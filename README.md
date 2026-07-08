# Lean AI Library

A beautifully designed, responsive Next.js directory and catalog interface that aggregates assets (models, libraries, applications, agents, etc.) from standard Github repositories into a unified, explorable library.

## Prerequisites
- Node.js (v18+)
- npm

## Getting Started

Follow these steps to run the library locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/ayaansulman-elktech/lean-ai-library.git
cd lean-ai-library
```

### 2. Install Dependencies
Install all the necessary packages for both the Next.js frontend and the CLI parser:
```bash
npm install
```

### 3. Build the Catalog (Critical Step)
This project relies on a custom CLI pipeline that automatically clones the `lean-ai-factory` repository, scans it for assets (`article.json`, `README.md`, `SKILL.md`), validates the metadata, and generates the static JSON files required by the frontend. 

**You MUST run this command before starting the server:**
```bash
npm run cli -- build
```
*Note: This command clones the target repository into `.tmp-factory`, parses the assets, generates the `catalog.json` file inside the `generated/` directory, and finally cleans up the temporary files.*

### 4. Run the Development Server
Once the catalog is built, start the Next.js development server:
```bash
npm run dev
```

### 5. Explore
Open [http://localhost:3000](http://localhost:3000) with your browser to see the Library! 

---

## How it works
- **CLI Pipeline**: The pipeline (`cli/index.ts`) handles asset discovery and metadata parsing. It strictly validates fields like `shortDescription`, `description`, `name`, and `keywords` against specific character limits.
- **Frontend**: A Next.js App Router application showcasing the assets in a beautiful, Apple-inspired interface, utilizing fluid typography and dynamic UI components.
