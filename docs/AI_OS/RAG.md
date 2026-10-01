# CHATR SI OS — Personal RAG (Local Knowledge Engine)
**Document:** `docs/AI_OS/RAG.md`  
**Core Service:** `LocalKnowledgeEngine`  

---

## 1. On-Device Knowledge Retrieval Pipeline

The `LocalKnowledgeEngine` indexes personal documents, notes, health summaries, and transcripts locally on the user's phone without sending raw text to third-party vector databases.

```
Document Input (Notes, PDF text, Chat Export)
     │
     ▼
Semantic Chunking (250 words / 40 word overlap)
     │
     ▼
On-Device Embedding Generation (LiteRT / 384-dim dense vector)
     │
     ▼
Encrypted Local Vector Index
     │
     ▼
Cosine Similarity Retrieval (Top-K = 3, Threshold ≥ 0.25)
     │
     ▼
Injected into PersonalAgent Context Window
```

---

## 2. Technical Characteristics

- **Embedding Vector Dimension**: 384 dimensions (standard compact dense embedding).
- **Index Latency**: $< 15\text{ ms}$ per chunk on ARM64 Cortex-A7x cores.
- **Search Latency**: $< 8\text{ ms}$ across 1,000 indexed chunks.
- **RAM Footprint**: $< 15\text{ MB}$ for active vector table.
- **Privacy Guarantee**: Vectors and source text remain within app-private storage.
