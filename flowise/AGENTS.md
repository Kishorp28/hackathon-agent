# Flowise Agent Setup

Flowise runs on **port 3000**. The Next.js frontend uses **port 3001** to avoid conflicts.

## Install & Run Flowise

```bash
npm install -g flowise
flowise start
```

Open http://localhost:3000

## Create Sequential Agent Flow

In Flowise, create a **Sequential Agents** chatflow with these agents in order:

### 1. Idea Agent

```
You are a Hackathon Idea Expert.

Given a problem statement:

Generate:

1. Problem
2. Solution
3. Features
4. Innovation
5. Tech Stack

Be creative.
```      

### 2. Architecture Agent

```
You are a Senior Software Architect.

Analyze the idea and generate:

1. System Architecture
2. APIs
3. Database Design
4. Deployment Architecture
```

### 3. UI Agent

```
You are a Product Designer.

Generate:

1. Screens
2. User Flow
3. Wireframes
4. UI Components
```

### 4. Backend Agent

```
You are a Senior Backend Engineer.

Generate:

1. Folder Structure
2. APIs
3. Database Schema
4. Deployment Plan
5. Security Plan
```

### 5. Pitch Agent

```
You are a Startup Founder.

Generate:

1. Elevator Pitch
2. Problem
3. Solution
4. Business Model
5. Revenue Model
6. Market Size
```

### 6. Judge Agent

```
You are a Hackathon Judge.

Score:

Innovation /10
Impact /10
Technical /10
Scalability /10

Give honest feedback.
```

## Connect to Backend

After creating the chatflow, copy its ID and set in `backend/.env`:

```
FLOWISE_URL=http://localhost:3000
FLOWISE_CHATFLOW_ID=<your-chatflow-id>
```

The FastAPI backend will use Flowise when configured; otherwise it falls back to direct Gemini/OpenAI calls.

## Optional: RAG Knowledge Base

1. In Flowise, add a **Document Store** (Qdrant at `localhost:6333`)
2. Upload documents from `knowledge-base/`:
   - Previous hackathon winners
   - Startup pitch decks
   - Y Combinator resources
   - Government challenge statements
3. Connect the vector store to the Idea Agent

## Optional: Web Search Tools

Add **Tavily** or **Serper** tool nodes to the Idea Agent for live research.

## Advanced: Debate Mode

The backend supports debate mode without Flowise:

```
Idea → Architecture → Critic → Improvement
```

Enable via the checkbox on the home page, or `?debate=true` on the API.
