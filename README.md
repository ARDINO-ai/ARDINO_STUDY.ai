# ARDINO.ai — Setup Guide

## Project Structure
```
ardino-ai/
├── backend/
│   ├── main.py          ← FastAPI server
│   ├── requirements.txt
│   └── .env             ← Your Groq API key goes here
└── frontend/
    └── src/
        └── App.jsx      ← React frontend
```

---

## Step 1 — Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Add your Groq API key in .env file:
# GROQ_API_KEY=your_groq_api_key_here

# Run the server
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**

---

## Step 2 — Frontend Setup

```bash
# Create a new Vite + React project (only first time)
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Replace src/App.jsx with the provided App.jsx file

# Run the dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## Step 3 — Get Groq API Key

1. Go to https://console.groq.com
2. Sign up / Login
3. Go to API Keys → Create new key
4. Paste it in `backend/.env`:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
   ```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create new user |
| POST | `/login` | Login user |
| POST | `/generate` | Generate AI answer |
| GET | `/history/{username}` | Get user history |

---

## Notes
- Users are stored in `ardino.db` (SQLite, auto-created)
- History is saved per user in the same DB
- Model used: `llama-3.1-8b-instant` via Groq (fast & free)
- To change model, edit `main.py` line with `model=`
