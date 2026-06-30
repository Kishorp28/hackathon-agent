# Hackathon Partner — Multi-Agent AI Orchestrator

An advanced multi-agent AI team that collaborates to produce complete hackathon solutions — from concepts to production architecture, user interface journeys, database schemas, and pitch decks.

mermaid
graph TD
    User([Problem Statement]) --> RAG[RAG Retrieval: text-embedding-004 + Qdrant]
    User --> Search[Web Search: Tavily API]
    RAG --> Idea[1. Idea Agent]
    Search --> Idea
    
    Idea --> Arch[2. Architecture Agent]
    
    subgraph Debate Mode (Self-Correction)
        Arch --> Critic[Critic Agent]
        Critic --> Improve[Improvement Agent]
        Improve --> FinalArch[Refactored Architecture]
    end
    
    FinalArch --> UI[3. UI/UX Agent]
    UI --> Backend[4. Backend Agent]
    
    subgraph Debate Mode (Self-Correction)
        Backend --> CriticB[Critic Agent]
        CriticB --> ImproveB[Improvement Agent]
        ImproveB --> FinalBackend[Refactored Backend Code]
    end
    
    FinalBackend --> Pitch[5. Pitch Agent]
    Pitch --> Judge[6. Judge Agent]
    Judge --> Report([Complete Hackathon Report])

---

## 🚀 Key Features

*   **6 Specialized AI Agents**: Idea Generator, Architecture Reviewer, UI/UX Designer, Backend Engineer, Pitch Deck Creator, and Judge Simulator.
*   **Expert System Prompts**: Agents are configured to think like Principal Engineers, enforcing SOLID design principles, 3NF database normalization, WCAG accessibility rules, Y-Combinator slide layouts, and independent security audits.
*   **Production RAG Integration**: Embeds queries on the fly using Google's `text-embedding-004` REST endpoint to query a local Qdrant Vector Database containing historical hackathon winning concepts.
*   **Debate Mode (Self-Correction)**: Enabling debate mode runs iterative Critic-Improvement feedback loops on the Architecture and Backend segments to automatically detect security vulnerabilities, UX friction, and query bottlenecks.
*   **Performance Latency Dashboard**: Next.js frontend profiles execution in real-time, displaying total pipeline latency, RAG/Web Search overhead, and individual agent timing metrics.
*   **Live Stepper & Timer**: Real-time progress loader and stopwatch timer showing exactly which LLM agent node is currently processing.
*   **Dynamic 429 Rate-Limit Wait**: Parses rate-limit warnings from either headers or response error messages and dynamically sleeps for the exact duration required before resuming.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, TailwindCSS, TypeScript |
| **Backend** | FastAPI, Python, HTTPX |
| **Vector DB** | Qdrant |
| **Database** | PostgreSQL |
| **Search API** | Tavily / Serper |
| **Models** | Gemini 2.5 Pro / Flash, Google Text Embedding |
| **Container** | Docker Desktop, Docker Compose |

---

## 💻 Quick Start

### 1. Configure Environment Variables
Copy the templates and configure your API keys:
```bash
cp backend/.env.example backend/.env
```
Inside `backend/.env`, set your Gemini and Tavily keys:
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash # Or gemini-2.5-pro for expert reasoning
TAVILY_API_KEY=tvly-...
```

### 2. Start Services via Docker
Start PostgreSQL, Qdrant (Vector DB), and Flowise (optional visual editor) in the background:
```bash
docker compose up -d
```

### 3. Start Backend API
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 4. Start Frontend UI
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open **`http://localhost:3001`** in your browser.

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/generate?debate=false` | Executes the sequential multi-agent workflow. |
| `POST` | `/api/report/pdf` | Compiles and downloads a PDF copy of the hackathon report. |
| `GET` | `/api/health` | Service health status. |

---

## 📂 Project Structure

```
hack-idea/
├── frontend/             # Next.js Application (Port 3001)
│   ├── src/components/   # LatencyDashboard, Navbar, ScoreGauge
│   └── src/app/          # Page router / UI views
├── backend/              # FastAPI Server (Port 8000)
│   └── app/
│       ├── agents/       # Sequential orchestrator and prompts
│       ├── services/     # llm, rag, search, pdf services
│       └── models/       # Pydantic schemas
├── flowise/              # Flowise agent guides
├── knowledge-base/       # RAG context documents
└── docker-compose.yml    # Docker configuration (Postgres, Qdrant, Flowise)
```
