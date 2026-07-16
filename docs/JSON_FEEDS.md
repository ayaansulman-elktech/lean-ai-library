# JSON feed workflow

The complete operator manual is [LIBRARY.md](../LIBRARY.md).

The site is static. Its source of truth is `content/articles/<id>/block.json`; browser files under
`data/` are generated and should not be edited directly.

## Import factory feeds

```bash
npm run cli -- feed import path/to/library-feeds/models/block.json --dry-run
npm run cli -- feed import path/to/library-feeds
npm run cli -- feed import "C:\\path\\to\\ai-lean-factory"
```

Directory inputs are searched recursively. Only generated schema-versioned feeds are imported;
native factory component manifests are ignored.

Imports replace only `factoryData` for matching stable IDs. `localOverrides`, thumbnails, PDFs,
and articles omitted from the feed remain unchanged.

## Curate articles

```bash
npm run cli -- article add --file article.json
npm run cli -- article edit iris --short-description "Custom card text"
npm run cli -- article edit iris --keywords "vision,iris,eyes"
npm run cli -- article edit iris --editor
npm run cli -- article edit iris --reset shortDescription
npm run cli -- article attach iris --thumbnail cover.png
npm run cli -- article attach iris --pdf research.pdf
npm run cli -- article detach iris --pdf
npm run cli -- article remove iris --yes
```

Run `npm run cli -- build` to regenerate `data/articles.json`, `data/categories.json`, and the
per-article detail files. Mutation commands regenerate them automatically.

The companion exporter lives in the factory repository at `scripts/export_library.py`.
