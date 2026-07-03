# rag

A small, **dependency-free** retrieval library for grounding agents in a document corpus.

- **`Corpus`** — documents chunked into pieces, each carrying its `source` (for citations).
- **`load_corpus(dir)`** — index every `*.md` (uses a `source:` line as the citation URL).
- **`LexicalRetriever`** — TF-IDF cosine over chunks. No external deps; a solid baseline for a
  focused doc set and fully offline-testable.
- **`Retriever`** protocol — the seam for a future `EmbeddingRetriever` (semantic recall via the
  ml-core providers) that drops in without changing callers.

```python
from rag import load_corpus, LexicalRetriever
r = LexicalRetriever(load_corpus("path/to/docs"))
for chunk, score in r.search("how does Guideline 4.3 treat variant apps?", k=4):
    print(score, chunk.title, chunk.source)
```

Used by `agents/apple-docs-rag` to answer Apple-development questions with citations.
