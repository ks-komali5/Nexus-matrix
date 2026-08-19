# NexusMatrix ⚡ Enterprise Multi-Modal AI Agent Framework

**NexusMatrix** is an enterprise-grade AI engineering framework for dynamic task orchestration across specialized multi-modal AI agents using a shared 768-dimensional vector database, semantic caching, and real-time inter-agent feedback telemetry.

![NexusMatrix System Architecture](./src/assets/hero.png)

---

## 🌟 Key Features

* **Dynamic DAG Task Graph Orchestration**: Decomposes complex engineering objectives into dependency-linked Directed Acyclic Graphs (DAG).
* **Model Multiplexing**: Routable to specialized Gemini models (`gemini-3.7-flash` for fast orchestration/vision and `gemini-3.1-pro-preview` for deep code & logic).
* **Shared 768D Vector Database**: In-memory vector database using L2-normalized 768-D embeddings and Cosine Similarity dot-product math.
* **Semantic Cache Layer (>0.88 Threshold)**: Bypasses LLM inference for queries matching historical vector memory with >88% similarity, delivering sub-millisecond responses (~0.4ms) at 0 token cost.
* **Inter-Agent Feedback Loop**: Emits real-time `AgentFeedbackReport` telemetry with confidence scores (0.0 to 1.0), error alerts, and suggested dynamic reroutes.
* **4 Interactive Modules**:
  1. **DAG Canvas (`CANVAS`)**: Topological graph visualizer with live node state execution animation, latency timers, token counters, and inspector drawer.
  2. **Vector DB Explorer (`VECTOR DB`)**: 2D vector projection scatter map (t-SNE/PCA) with hover tooltips and Cosine Search Sandbox.
  3. **Agent Mesh Dashboard (`AGENT MESH`)**: 7-agent capability registry matrix, standalone multi-modal sandbox (Text, Vision, Code), and live telemetry event log.
  4. **Architecture Blueprint (`BLUEPRINT`)**: LaTeX mathematical formulations, sequence diagrams, and model benchmark matrices.

---

## 📐 System Architecture

For complete mathematical proofs, sequence diagrams, and model benchmarks, see [ARCHITECTURE.md](./ARCHITECTURE.md).

```
[ User Objective ] ──> [ Master Orchestrator (gemini-3.7-flash) ]
                              │
                     [ Topological DAG ]
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
[ Semantic Cache Check ]               [ Agent Model Multiplexer ]
  (>0.88 Cosine Sim Hit)                ┌─────────┴─────────┐
          │                             ▼                   ▼
  (Sub-ms Bypass)             gemini-3.7-flash    gemini-3.1-pro-preview
          │                   (Summarizer/Vision)   (Code/Logic)
          └───────────────────┬───────────────────┘
                              ▼
               [ Zero-Trust Guardrail Agent ]
                              │
               [ Inter-Agent Telemetry Bus ]
                              │
               [ Shared 768D Vector Store ]
                              │
             [ Executive Synthesizer Agent ]
                              │
            [ Consolidated Executive Report ]
```

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/ks-komali5/Nexus-matrix.git
cd Nexus-matrix
npm install
```

### 2. Running Locally
```bash
# Start Vite Frontend Dev Server
npm run dev

# (Optional) Start Express Backend API Server
npx tsx server/server.ts
```

Open **`http://localhost:5173/`** in your browser.

---

## ⚙️ Configuration & Execution Modes

NexusMatrix supports two seamless execution modes:

1. **Autonomous High-Fidelity Simulation Mode (Default)**:
   Operates out-of-the-box locally with 100% vector math calculations, Cosine similarity evaluation, and simulated agent model outputs without requiring API keys.

2. **Live Gemini Multi-Modal API Mode**:
   Click **"Configure Gemini Key"** in the top navigation header and enter your `GEMINI_API_KEY`. The backend will execute live inference calls to `gemini-3.7-flash` and `gemini-3.1-pro-preview` using `@google/genai`.

---

## 🧮 Mathematical Formulations

### Cosine Similarity
$$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{768} A_i B_i}{\sqrt{\sum_{i=1}^{768} A_i^2} \sqrt{\sum_{i=1}^{768} B_i^2}}$$

### Semantic Cache Distance Threshold
$$d(A, B) = 1 - \text{Similarity}(A, B) \le 0.12 \implies \text{Similarity}(A, B) \ge 0.88$$

---

## 📄 License

MIT License. Built for Enterprise Multi-Modal Agent Orchestration.
