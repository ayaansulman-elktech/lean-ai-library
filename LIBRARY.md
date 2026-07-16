# Lean AI Library — Complete Guide

This document explains how the Library works, how Factory data reaches the UI, how local changes
are preserved, and how to use every CLI command.

## 1. System overview

The Library is a static HTML/CSS/JavaScript website. It does not require Next.js, a database, or a
backend API.

```text
AI Lean Factory
  library-manifests/*/manifest.json
          ↓ Python exporter
  dist/library-feeds/*/block.json
          ↓ Library CLI import
Lean AI Library
  content/articles/<id>/block.json
          ↓ Library build
  data/articles.json
  data/categories.json
  data/articles/<id>.json
          ↓ Browser fetch
  Home, Library, Updates, and Article pages
```

The UI exposes exactly six Factory blocks:

1. Agent Library
2. Code Library
3. Knowledge Library
4. MCP Library
5. Model Library
6. iOS Library

## 2. Requirements

- Node.js 18 or newer
- npm
- Python 3.11 or newer in the Factory repository

Install Library dependencies once:

```powershell
cd "C:\path\to\lean-ai-library"
npm install
```

## 3. Factory publishing workflow

The Factory has two separate kinds of metadata.

### Source manifests

The six publishing sources are:

```text
library-manifests/agents/manifest.json
library-manifests/code/manifest.json
library-manifests/knowledge/manifest.json
library-manifests/mcp/manifest.json
library-manifests/models/manifest.json
library-manifests/ios/manifest.json
```

These hold the curated article metadata and source paths. They are not imported by the Library
directly.

### Generated feeds

Run these commands in the Factory:

```powershell
cd "C:\path\to\ai-lean-factory"
python scripts/bootstrap_library_manifests.py
python scripts/export_library.py
```

`bootstrap_library_manifests.py` recreates the six source manifests from the Factory structure and
explicit metadata. Use it when deliberately reseeding the manifests; it can replace manual edits in
those source manifests.

`export_library.py` creates exactly six portable feeds:

```text
dist/library-feeds/agents/block.json
dist/library-feeds/code/block.json
dist/library-feeds/knowledge/block.json
dist/library-feeds/mcp/block.json
dist/library-feeds/models/block.json
dist/library-feeds/ios/block.json
```

Only the Python exporter creates these publishing `block.json` files. Existing native
`libraries/models/blocks/*/block.json` and `libraries/code/blocks/*/block.json` files describe
Factory components and are not publishing feeds.

Each exported feed includes article metadata, the source file tree, and embedded UTF-8 content for
Markdown and JSON previews. Binary source files are listed in the tree but are not embedded.

## 4. Feed format

Every generated feed uses schema version `1.0.0`:

```json
{
  "schemaVersion": "1.0.0",
  "library": {
    "id": "model-library",
    "name": "Model Library",
    "description": "Portable AI model blocks."
  },
  "articles": [
    {
      "id": "iris",
      "type": "model",
      "category": "model-library",
      "name": "Iris",
      "shortDescription": "Iris and eye-landmark detection",
      "description": "Locates the pupil center and iris boundary.",
      "keywords": ["iris", "eyes", "landmarks"],
      "sourcePath": "libraries/models/blocks/iris",
      "fileTree": []
    }
  ]
}
```

`id` is the permanent article identity. Names, descriptions, categories, and source paths may
change, but an article ID should not be reused for a different article.

## 5. Importing Factory data

The Library accepts a single generated feed, the generated feed directory, or any parent directory
such as the Factory root.

Always preview an import first:

```powershell
npm run cli -- feed import "C:\path\to\ai-lean-factory" --dry-run
```

Perform the import:

```powershell
npm run cli -- feed import "C:\path\to\ai-lean-factory"
```

Other valid inputs:

```powershell
npm run cli -- feed import "C:\path\to\ai-lean-factory\dist\library-feeds"
npm run cli -- feed import "C:\path\to\ai-lean-factory\dist\library-feeds\models\block.json"
```

Directory inputs are searched recursively. The importer reads only valid schema-versioned feeds and
ignores native Factory component manifests.

An import reports four outcomes:

- `added`: new stable IDs
- `updated`: existing imported data changed
- `unchanged`: data already matches
- `deleted`: always zero during import

Imports never remove articles simply because they are absent from a feed.

## 6. How local changes are preserved

The canonical Library record is:

```text
content/articles/<id>/block.json
```

It contains three independent layers:

```json
{
  "schemaVersion": "1.0.0",
  "id": "iris",
  "factoryData": {},
  "localOverrides": {},
  "attachments": {
    "thumbnail": null,
    "pdf": null
  }
}
```

The effective article uses this precedence:

```text
local attachments → localOverrides → factoryData
```

Import replaces only `factoryData`. It does not overwrite:

- Locally edited names or descriptions
- Locally edited keywords, type, or category
- Thumbnails
- PDFs
- Articles not present in the imported feed

Do not edit files under `data/` directly. They are generated browser output.

## 7. Building and serving

Generate the frontend JSON:

```powershell
npm run cli -- build
```

This writes:

- `data/articles.json`: lightweight cards and search metadata
- `data/categories.json`: Library category data
- `data/articles/<id>.json`: article detail, source tree, and preview text

Mutation commands such as feed import, article edit, and thumbnail import build automatically.

Start the static server:

```powershell
npm start
```

Or use the CLI wrapper:

```powershell
npm run cli -- serve
```

Open:

```text
http://127.0.0.1:4173
```

## 8. Adding a local article

Create an article JSON file:

```json
{
  "id": "language-model",
  "type": "pdf",
  "category": "agent-library",
  "name": "Language Model",
  "shortDescription": "Skill optimization process",
  "description": "A directly applicable language-model framework.",
  "keywords": ["agentic", "llm", "security", "skill"]
}
```

Add it:

```powershell
npm run cli -- article add --file "C:\path\to\article.json"
```

The ID must contain lowercase letters, numbers, hyphens, or underscores and must not already exist.

## 9. Editing articles

Change one or more fields:

```powershell
npm run cli -- article edit iris --name "Iris Detection"
npm run cli -- article edit iris --short-description "Detect iris boundaries and pupil centers"
npm run cli -- article edit iris --description "Full custom description"
npm run cli -- article edit iris --keywords "iris,eyes,vision,landmarks"
npm run cli -- article edit iris --type model --category model-library
```

Open the complete local override object in the configured system editor:

```powershell
npm run cli -- article edit iris --editor
```

Reset a field to its latest imported Factory value:

```powershell
npm run cli -- article edit iris --reset shortDescription
npm run cli -- article edit iris --reset name description keywords
```

Editable fields are `name`, `shortDescription`, `description`, `keywords`, `type`, and `category`.

## 10. Thumbnails

Attach one thumbnail manually:

```powershell
npm run cli -- article attach iris --thumbnail "C:\path\to\iris.png"
```

Supported extensions are PNG, JPG, JPEG, WebP, and GIF. The image is copied into the article
directory, so the original source file can move later.

Detach a thumbnail:

```powershell
npm run cli -- article detach iris --thumbnail
```

### Batch thumbnail matching

Preview matches first:

```powershell
npm run cli -- thumbnails import "C:\path\to\thumbnails" --dry-run
```

Import matches:

```powershell
npm run cli -- thumbnails import "C:\path\to\thumbnails"
```

Matching normalizes spaces, underscores, and hyphens and recognizes filename suffixes such as
`-from-json`, `-from-json-v2`, and `-variation-1`. It compares both stable IDs and display names.
Namespaced articles such as `ios-iris` can reuse the `iris` thumbnail. Ambiguous families have
explicit mappings in the CLI.

Matched files are copied locally. Unmatched articles retain their existing thumbnail or
`assets/default_thumbnail.png`.

Card behavior:

- Custom thumbnail: show the image without title/type overlay text
- Default thumbnail: show the article name and type over the default image

## 11. PDFs and article content

Attach a PDF:

```powershell
npm run cli -- article attach language-model --pdf "C:\path\to\document.pdf"
```

When a PDF is attached, the article page uses the PDF viewer and displays a download action.

Detach it and return to the source-tree view:

```powershell
npm run cli -- article detach language-model --pdf
```

Without a PDF, the article page displays the imported folder tree. Markdown and JSON files can be
opened as offline previews. Other source files remain visible but are not previewable.

## 12. Removing an article

Removal is always explicit:

```powershell
npm run cli -- article remove language-model --yes
```

This removes the canonical article directory, its local attachments, and its generated detail JSON.
Feed import never performs this operation automatically.

## 13. Validation, tests, and health checks

Validate records, required fields, keywords, and attachment paths:

```powershell
npm run cli -- validate
```

Run the Library tests:

```powershell
npm run cli -- test
```

Check catalog and frontend file health:

```powershell
npm run cli -- doctor
```

Run TypeScript validation during development:

```powershell
npx tsc --noEmit
```

Run the Factory export contract test:

```powershell
cd "C:\path\to\ai-lean-factory"
python -m pytest tests/test_library_export.py -q
```

## 14. Publishing

Publish the static site:

```powershell
npm run cli -- publish
npm run cli -- publish --provider vercel
```

The publish pipeline regenerates frontend data, validates the catalog, runs tests, and then invokes
the configured deployment adapter. Publishing changes external deployment state; use it only when
the target Vercel project and credentials are configured.

## 15. All CLI commands

```text
npm run cli -- build
npm run cli -- publish [--provider vercel]
npm run cli -- validate
npm run cli -- test
npm run cli -- doctor
npm run cli -- serve

npm run cli -- feed import <path> [--dry-run]

npm run cli -- article add --file <article.json>
npm run cli -- article edit <id> [field options] [--editor] [--reset <fields...>]
npm run cli -- article attach <id> [--thumbnail <image>] [--pdf <document>]
npm run cli -- article detach <id> [--thumbnail] [--pdf]
npm run cli -- article remove <id> --yes

npm run cli -- thumbnails import <directory> [--dry-run]
```

Show live help at any level:

```powershell
npm run cli -- --help
npm run cli -- article --help
npm run cli -- article edit --help
npm run cli -- feed import --help
npm run cli -- thumbnails import --help
```

## 16. Recommended daily workflow

```powershell
# Factory: regenerate feeds after Factory changes
cd "C:\path\to\ai-lean-factory"
python scripts/bootstrap_library_manifests.py
python scripts/export_library.py
python -m pytest tests/test_library_export.py -q

# Library: preview, import, validate, and serve
cd "C:\path\to\lean-ai-library"
npm run cli -- feed import "C:\path\to\ai-lean-factory" --dry-run
npm run cli -- feed import "C:\path\to\ai-lean-factory"
npm run cli -- validate
npm start
```

## 17. Troubleshooting

### Import says no generated feeds were found

Run `python scripts/export_library.py` in the Factory and confirm these files exist:

```text
dist/library-feeds/*/block.json
```

### A custom description disappeared

Library customizations must be made with `article edit`, which writes `localOverrides`. Do not edit
`factoryData` or generated `data/*.json` files directly.

### A thumbnail does not appear

Run `npm run cli -- validate`, confirm the article's `attachments.thumbnail` points to an existing
file, then rebuild with `npm run cli -- build`. The local server uses `Cache-Control: no-store`, so a
normal refresh should load the current image.

### An article page is blank or reports not found

Confirm `data/articles/<id>.json` exists and run:

```powershell
npm run cli -- build
npm run cli -- doctor
node --check assets/app.js
```

### An upstream article was removed but remains in the Library

This is intentional. Imports never delete. Remove it explicitly with `article remove <id> --yes`.
