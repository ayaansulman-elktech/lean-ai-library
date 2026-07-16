# CognitiveShift CLI

Install a Library article into any project without requiring that project to use Node.js:

```bash
npx cognitiveshift iris
```

The default destination is `./<article-id>`. Use `--output .` to place the article contents in the
current directory, `--dry-run` to inspect the operation, and `--force` to replace conflicts.

```bash
npx cognitiveshift --list
npx cognitiveshift iris --output ./models/iris
npx cognitiveshift iris --output . --dry-run
```

The package archives are generated from the Factory by the Library's portable exporter and copied
into this package when the six JSON feeds are imported into the Library.
