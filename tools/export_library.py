#!/usr/bin/env python3
"""Portable Lean AI Factory -> Library JSON exporter.

Copy this file into a Factory repository (or run it by absolute path), set the Factory root as the
current directory, and run `python export_library.py`. It writes six standalone JSON feeds plus installable article ZIP packages without
modifying Factory source files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import tomllib
import zipfile
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "1.0.0"
IGNORED_TREE_DIRS = {".git", ".pytest_cache", ".ruff_cache", "__pycache__", "node_modules", ".venv", "venv", "build", "dist", "coverage"}


def normalize_id(value: str) -> str:
    return re.sub(r"[^a-z0-9_-]+", "-", value.lower().replace("_", "-")).strip("-")


def documentation(directory: Path) -> tuple[str, str]:
    pyproject = directory / "pyproject.toml"
    if pyproject.exists():
        project = tomllib.loads(pyproject.read_text(encoding="utf-8")).get("project", {})
        if project.get("description"):
            value = str(project["description"])
            return value, value
    for filename in ("SKILL.md", "README.md"):
        source = directory / filename
        if not source.exists():
            continue
        text = source.read_text(encoding="utf-8")
        frontmatter = re.search(r"^description:\s*(.+)$", text, re.MULTILINE)
        if frontmatter:
            value = frontmatter.group(1).strip().strip('"')
            return value[:180], value
        body = re.sub(r"^---.*?---", "", text, flags=re.DOTALL).strip()
        for paragraph in re.split(r"\n\s*\n", body):
            value = re.sub(r"\s+", " ", paragraph).strip()
            if value and not value.startswith(("#", "```", "|")):
                return value[:180], value[:1200]
    fallback = "See the included Markdown documentation for implementation and usage details."
    return fallback, fallback


def file_tree(directory: Path, root: Path) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []
    for item in sorted(directory.iterdir(), key=lambda value: (not value.is_dir(), value.name.lower())):
        if item.name in IGNORED_TREE_DIRS or item.name in {".DS_Store"}:
            continue
        relative = item.relative_to(root).as_posix()
        node: dict[str, Any] = {
            "name": item.name,
            "type": "directory" if item.is_dir() else "file",
            "path": relative,
        }
        if item.is_dir():
            node["children"] = file_tree(item, root)
        else:
            node["previewable"] = item.suffix.lower() == ".md"
            if node["previewable"]:
                node["content"] = item.read_text(encoding="utf-8")
        nodes.append(node)
    return nodes


def article(directory: Path, factory_root: Path, category: str, article_type: str, metadata: dict[str, Any] | None = None, prefix: str = "") -> dict[str, Any]:
    metadata = metadata or {}
    short, description = documentation(directory)
    article_id = prefix + normalize_id(directory.name)
    return {
        "id": article_id,
        "type": article_type,
        "category": category,
        "name": str(metadata.get("name") or directory.name).replace("_", "-"),
        "shortDescription": str(metadata.get("summary") or metadata.get("task") or short)[:180],
        "description": str(metadata.get("description") or description),
        "keywords": metadata.get("keywords") or [part for part in re.split(r"[-_]", directory.name) if part],
        "sourcePath": directory.relative_to(factory_root).as_posix(),
        "fileTree": file_tree(directory, directory),
    }


def directory_articles(factory_root: Path, relative: str, category: str, article_type: str, metadata_name: str | None = None, prefix: str = "") -> list[dict[str, Any]]:
    parent = factory_root / relative
    if not parent.is_dir():
        return []
    results = []
    for directory in sorted(parent.iterdir(), key=lambda value: value.name.lower()):
        if not directory.is_dir() or directory.name.startswith((".", "_")) or directory.name in IGNORED_TREE_DIRS:
            continue
        metadata = None
        if metadata_name and (directory / metadata_name).exists():
            metadata = json.loads((directory / metadata_name).read_text(encoding="utf-8"))
        results.append(article(directory, factory_root, category, article_type, metadata, prefix))
    return results


def ios_articles(factory_root: Path) -> list[dict[str, Any]]:
    registry_path = factory_root / "libraries/ios-ready/registry.json"
    if not registry_path.exists():
        return []
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    raw_root = factory_root / "libraries/ios-ready/raw"
    raw = {item.name.lower(): item for item in raw_root.iterdir() if item.is_dir()} if raw_root.is_dir() else {}
    model_root = factory_root / "libraries/models/blocks"
    models = {normalize_id(item.name): item for item in model_root.iterdir() if item.is_dir()} if model_root.is_dir() else {}
    results = []
    for item in registry.get("models", []):
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        base_id = normalize_id(name)
        source = raw.get(name.lower()) or models.get(base_id)
        results.append({
            "id": f"ios-{base_id}",
            "type": "model",
            "category": "ios-ready",
            "name": name,
            "shortDescription": str(item.get("task") or name),
            "description": str(item.get("note") or item.get("task") or "iOS model registry entry."),
            "keywords": ["ios", "model", str(item.get("status") or "raw")],
            "sourcePath": source.relative_to(factory_root).as_posix() if source else "",
            "fileTree": file_tree(source, source) if source else [],
        })
    return results


def feeds(factory_root: Path) -> list[tuple[str, dict[str, Any]]]:
    definitions = [
        ("agents", "agent-library", "Agent Library", "Specialized Factory agents.", directory_articles(factory_root, "agents", "agent-library", "agent")),
        ("code", "code-library", "Code Library", "Reusable implementation blocks.", directory_articles(factory_root, "libraries/code/blocks", "code-library", "library", "block.json")),
        ("knowledge", "knowledge-library", "Knowledge Library", "Curated reference material.", directory_articles(factory_root, "libraries/knowledge", "knowledge-library", "folder", prefix="knowledge-")),
        ("mcp", "mcp-library", "MCP Library", "Shared MCP servers and tools.", directory_articles(factory_root, "libraries/mcp", "mcp-library", "library", prefix="mcp-")),
        ("models", "model-library", "Model Library", "Portable AI model blocks.", directory_articles(factory_root, "libraries/models/blocks", "model-library", "model", "block.json")),
        ("ios", "ios-ready", "iOS Library", "Models tracked for Apple-platform deployment.", ios_articles(factory_root)),
    ]
    all_ids: set[str] = set()
    output = []
    for filename, library_id, name, description, articles in definitions:
        for item in articles:
            if item["id"] in all_ids:
                raise ValueError(f"Duplicate article id: {item['id']}")
            all_ids.add(item["id"])
        output.append((filename, {
            "schemaVersion": SCHEMA_VERSION,
            "library": {"id": library_id, "name": name, "description": description},
            "articles": articles,
        }))
    return output


def package_files(directory: Path):
    for item in sorted(directory.rglob("*")):
        relative = item.relative_to(directory)
        if any(part in IGNORED_TREE_DIRS or part == ".DS_Store" for part in relative.parts):
            continue
        if item.is_file() and not item.is_symlink():
            yield item, relative


def write_package(directory: Path, target: Path) -> str:
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source, relative in package_files(directory):
            archive.write(source, relative.as_posix())
    return hashlib.sha256(target.read_bytes()).hexdigest()

def write_metadata_package(item: dict[str, Any], target: Path) -> str:
    readme = f"# {item['name']}\n\n{item['description']}\n"
    manifest = {key: value for key, value in item.items() if key not in {"fileTree", "package"}}
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.writestr("README.md", readme)
        archive.writestr("block.json", json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    return hashlib.sha256(target.read_bytes()).hexdigest()

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--factory-root", type=Path, default=Path.cwd(), help="Factory repository root; defaults to the current directory")
    parser.add_argument("--output", type=Path, default=Path("library-output"), help="Output directory; defaults to ./library-output")
    args = parser.parse_args()
    factory_root = args.factory_root.resolve()
    output = args.output if args.output.is_absolute() else factory_root / args.output
    if not (factory_root / "agents").is_dir() or not (factory_root / "libraries").is_dir():
        parser.error(f"Not a compatible Factory root: {factory_root}")
    output.mkdir(parents=True, exist_ok=True)
    packages = output / "packages"
    packages.mkdir(parents=True, exist_ok=True)
    for stale in packages.glob("*.zip"):
        stale.unlink()

    generated_feeds = feeds(factory_root)
    for _, payload in generated_feeds:
        for item in payload["articles"]:
            source_path = str(item.get("sourcePath") or "")
            source = factory_root / source_path
            archive = packages / f"{item['id']}.zip"
            checksum = write_package(source, archive) if source_path and source.is_dir() else write_metadata_package(item, archive)
            item["package"] = {
                "format": "zip",
                "path": f"packages/{archive.name}",
                "sha256": checksum,
            }

    for filename, payload in generated_feeds:
        target = output / f"{filename}.json"
        target.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{target} ({len(payload['articles'])} articles)")
    print(f"{packages} ({len(list(packages.glob('*.zip')))} installable packages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
