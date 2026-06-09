from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import sqlite3, bcrypt, os, io, base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,  # FIX 1: needed for auth headers / cookies
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─── DB ───
def get_db():
    conn = sqlite3.connect("ardino.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY, password BLOB NOT NULL,
        is_pro INTEGER DEFAULT 0)""")
    c.execute("""CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL, question TEXT NOT NULL,
        answer TEXT NOT NULL, mode TEXT, difficulty TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    c.execute("""CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL, exam TEXT NOT NULL,
        topic TEXT NOT NULL, score INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    conn.commit()
    conn.close()

init_db()

# ─── PROMPTS ───
# FIX 2: "notes" lambda used raw newlines inside f-string → use triple-quoted string via helper
def _notes_prompt(q: str, d: str) -> str:
    return (
        "You are an expert AI tutor and note-making assistant.\n\n"
        "Your task is to convert the given topic/content into highly structured SMART NOTES for fast learning and revision.\n\n"
        "Rules:\n"
        "1. Explain in very simple Hinglish + English mix language.\n"
        "2. Use headings and subheadings properly.\n"
        "3. Make notes concise but information-rich.\n"
        "4. Include:\n"
        "   - Definition\n"
        "   - Key Concepts\n"
        "   - Real-world Examples\n"
        "   - Important Formulas\n"
        "   - Diagrams (ASCII if needed)\n"
        "   - Short Tricks / Memory Tips\n"
        "   - Interview or Exam Questions\n"
        "   - Common Mistakes\n"
        "   - Summary Table\n"
        "5. Highlight important keywords using emojis or symbols.\n"
        "6. If topic is coding related:\n"
        "   - Explain code line-by-line\n"
        "   - Mention time complexity\n"
        "   - Give optimized approach\n"
        "   - Give real-world applications\n"
        "7. If topic is AI/ML:\n"
        "   - Explain workflow\n"
        "   - Training process\n"
        "   - Dataset role\n"
        "   - Model architecture\n"
        "   - Use cases\n"
        "8. Create revision-friendly notes.\n"
        "9. End with:\n"
        "   - 5 Quick Revision Points\n"
        "   - 5 MCQs with answers\n"
        "   - 3 Interview Questions\n\n"
        "Output format:\n"
        "# Topic Name\n"
        "## Introduction\n"
        "## Core Concepts\n"
        "## Detailed Explanation\n"
        "## Examples\n"
        "## Important Points\n"
        "## Summary\n"
        "## MCQs\n"
        "## Interview Questions\n\n"
        f"Topic/Input:\n{q}. Difficulty: {d}."
    )

PROMPTS = {
    "qa":        lambda q, d: f"Create 10 Long Q&A and 10 Short Q&A on: {q}. Difficulty: {d}. Use headings 'LONG Q&A' and 'SHORT Q&A'.",
    "mcq":       lambda q, d: f"Create 10 MCQs with 4 options, mark correct answer on: {q}. Difficulty: {d}.",
    "explain":   lambda q, d: f"Explain from Logic analogies and reasoning with Advantages and Disadvantages with Code also and show output also: {q}. Difficulty: {d}.",
    "notes":     _notes_prompt,  # FIX 2: replaced broken inline lambda
    "flashcard": lambda q, d: f"Create 10 flashcard Q&A pairs (concise) on: {q}. Difficulty: {d}. Format: 'Q: ... | A: ...'",
    "summary":   lambda q, d: f"Give a clear concise structured summary of: {q}. Difficulty: {d}.",
    # Exam Modes
    "gate":      lambda q, d: f"You are a GATE exam expert. Create 10 GATE-style MCQs with detailed solutions on: {q}. Difficulty: {d}. Include topic tags and marks weightage.",
    "jee":       lambda q, d: f"You are a JEE Main/Advanced expert. Create 10 JEE-style questions (MCQ + numerical) with step-by-step solutions on: {q}. Difficulty: {d}.",
    "upsc":      lambda q, d: f"You are a UPSC CSE expert. Create answer for UPSC mains on: {q}. Difficulty: {d}. Include introduction, body with subheadings, conclusion, and key facts. Also suggest 3 related PYQs.",
    "neet":      lambda q, d: f"You are a NEET exam expert. Create 10 NEET-style MCQs with explanations on: {q}. Difficulty: {d}. Include NCERT reference.",
}

# ─── MODELS ───
class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class GenerateRequest(BaseModel):
    username: str
    question: str
    mode: str
    difficulty: str = "Medium"
    file_context: str = ""
    image_base64: str = ""

class ProgressRequest(BaseModel):
    username: str
    exam: str
    topic: str
    score: int
    total: int

class DeleteHistoryRequest(BaseModel):
    username: str
    delete_all: bool = False
    history_id: Optional[int] = None  # FIX 3: must be Optional, not bare `int = None`

class PaymentRequest(BaseModel):             # FIX 4: proper model instead of raw dict
    username: str

# ─── AUTH ───
@app.post("/signup")
def signup(req: SignupRequest):
    conn = get_db()
    try:                                      # FIX 5: always close DB on error
        c = conn.cursor()
        c.execute("SELECT username FROM users WHERE username=?", (req.username,))
        if c.fetchone():
            raise HTTPException(400, "User already exists")
        hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt())
        c.execute("INSERT INTO users VALUES (?, ?, 0)", (req.username, hashed))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}

@app.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    try:
        c = conn.cursor()
        c.execute("SELECT password, is_pro FROM users WHERE username=?", (req.username,))
        row = c.fetchone()
    finally:
        conn.close()
    if not row:
        raise HTTPException(401, "User not found")
    if not bcrypt.checkpw(req.password.encode(), row["password"]):
        raise HTTPException(401, "Wrong password")
    return {"ok": True, "username": req.username, "is_pro": bool(row["is_pro"])}

# ─── VOICE / WHISPER ───
@app.post("/voice")
async def voice_transcribe(file: UploadFile = File(...)):
    content = await file.read()
    try:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",
            file=(file.filename, content),
            response_format="text"
        )
        return {"text": transcription}
    except Exception as e:
        raise HTTPException(500, f"Voice error: {str(e)}")

# ─── FILE UPLOAD / RAG ───
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()
    extracted = ""
    if filename.endswith(".txt"):
        extracted = content.decode("utf-8", errors="ignore")
    elif filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                extracted += page.extract_text() or ""
        except ImportError:
            raise HTTPException(500, "Run: pip install pypdf")
        except Exception as e:
            raise HTTPException(500, f"PDF error: {str(e)}")
    else:
        raise HTTPException(400, "Only .pdf and .txt supported")
    extracted = extracted.strip()[:4000]
    if not extracted:
        raise HTTPException(400, "No text found in file")
    return {"text": extracted, "filename": file.filename, "chars": len(extracted)}

# ─── IMAGE UPLOAD (Vision) ───
@app.post("/upload_image")
async def upload_image(file: UploadFile = File(...)):
    """Accepts jpg/png/webp, returns base64 data URI for vision model."""
    content = await file.read()
    filename = file.filename.lower()
    allowed = (".jpg", ".jpeg", ".png", ".webp", ".gif")
    if not any(filename.endswith(ext) for ext in allowed):
        raise HTTPException(400, "Only JPG, PNG, WEBP, GIF supported")
    if len(content) > 4 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 4MB)")
    mime = "image/jpeg"
    if filename.endswith(".png"):   mime = "image/png"
    elif filename.endswith(".webp"): mime = "image/webp"
    elif filename.endswith(".gif"):  mime = "image/gif"
    b64 = base64.b64encode(content).decode("utf-8")
    data_uri = f"data:{mime};base64,{b64}"
    return {"image_base64": data_uri, "filename": file.filename, "size": len(content)}

# ─── GENERATE ───
@app.post("/generate")
def generate(req: GenerateRequest):
    prompt_fn = PROMPTS.get(req.mode)
    if not prompt_fn:
        raise HTTPException(400, "Invalid mode")
    base_prompt = prompt_fn(req.question, req.difficulty)

    if req.file_context.strip():
        base_prompt = (
            f"Use this document as reference:\n---\n{req.file_context}\n---\n\n"
            f"Based on above, {base_prompt}"
        )

    # ── Vision: image provided → use llama-4-scout (vision capable) ──
    if req.image_base64.strip():
        img_data = req.image_base64
        mime_type = "image/jpeg"
        if img_data.startswith("data:"):
            header, raw_b64 = img_data.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0]
        else:
            raw_b64 = img_data

        try:
            res = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{raw_b64}"}
                        },
                        {
                            "type": "text",
                            "text": base_prompt
                        }
                    ]
                }],
                max_tokens=4096
            )
        except Exception as e:
            raise HTTPException(500, f"Vision model error: {str(e)}")
    else:
        # Text-only generation
        try:
            res = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": base_prompt}]
            )
        except Exception as e:
            raise HTTPException(500, f"Generation error: {str(e)}")

    answer = res.choices[0].message.content
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO history (username,question,answer,mode,difficulty) VALUES (?,?,?,?,?)",
            (req.username, req.question, answer, req.mode, req.difficulty)
        )
        conn.commit()
    finally:
        conn.close()
    return {"answer": answer}

# ─── HISTORY ───
@app.get("/history/{username}")
def get_history(username: str):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, question, answer, mode, difficulty, created_at FROM history "
            "WHERE username=? ORDER BY id DESC LIMIT 30",
            (username,)
        ).fetchall()
    finally:
        conn.close()
    return {"history": [dict(r) for r in rows]}

@app.delete("/history")
def delete_history(req: DeleteHistoryRequest):
    conn = get_db()
    try:
        if req.delete_all:
            conn.execute("DELETE FROM history WHERE username=?", (req.username,))
        elif req.history_id is not None:
            conn.execute(
                "DELETE FROM history WHERE id=? AND username=?",
                (req.history_id, req.username)
            )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}

# ─── PROGRESS ───
@app.post("/progress")
def save_progress(req: ProgressRequest):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO progress (username,exam,topic,score,total) VALUES (?,?,?,?,?)",
            (req.username, req.exam, req.topic, req.score, req.total)
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}

@app.get("/progress/{username}")
def get_progress(username: str):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT exam, topic, score, total, created_at FROM progress "
            "WHERE username=? ORDER BY id DESC",
            (username,)
        ).fetchall()
    finally:
        conn.close()
    return {"progress": [dict(r) for r in rows]}

# ─── PAYMENT (Razorpay ready) ───
@app.post("/payment/verify")
def verify_payment(data: PaymentRequest):  # FIX 4: typed model, not raw dict
    conn = get_db()
    try:
        conn.execute("UPDATE users SET is_pro=1 WHERE username=?", (data.username,))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "message": "Pro activated!"}
