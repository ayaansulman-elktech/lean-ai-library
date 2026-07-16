# Lean AI Library

A static catalog for models, libraries, applications, agents, and research articles. Content is

For the complete architecture, Factory workflow, data rules, and every CLI command, see
[LIBRARY.md](LIBRARY.md).
imported from portable JSON feeds and can be curated locally without losing edits on later imports.

## Prerequisites

- Node.js (v18+)
- npm
- Python 3.11+ only when producing feeds in the factory repository

## Getting Started

```bash
npm install
npm run cli -- build
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Import and edit content

```bash
npm run cli -- feed import path/to/library-feeds --dry-run
npm run cli -- feed import path/to/library-feeds
npm run cli -- article edit iris --short-description "Custom text"
npm run cli -- article attach iris --thumbnail cover.png
npm run cli -- article attach iris --pdf research.pdf
```

## How it works

- Factory feeds replace imported `factoryData` only.
- Library edits live in `localOverrides`; thumbnails and PDFs are local attachments.
- The build command generates lightweight catalog JSON plus one offline detail JSON per article.
- The vanilla browser frontend reads only files under `data/` and local article attachments.
