# Apple-docs RAG

Grounds agents in real Apple docs instead of letting them hallucinate. Retrieves the most
relevant chunks from `corpus/` and answers **using only that context**, with `[Title]` citations;
returns `grounded: false` ("Not found in the indexed Apple docs.") when the corpus doesn't cover it.

```python
from apple_docs_rag import AppleDocsRAGAgent
res = AppleDocsRAGAgent(ctx).run("Does Core ML run on device?")
res.output["answer"]      # with [Core ML] citation
res.output["grounded"]    # False if not in the corpus
res.output["sources"]     # the source URLs
```

- **Corpus** (`corpus/*.md`): App Store guidelines (4.3-focused), Core ML, Foundation Models, HIG.
  Add more docs by dropping `*.md` files (a `source:` line becomes the citation URL).
- **Retrieval**: `libraries/rag` TF-IDF (no deps, offline). Pluggable seam for an embedding
  retriever later (semantic recall via the ml-core providers).
