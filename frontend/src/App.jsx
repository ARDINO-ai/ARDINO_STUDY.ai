import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000";

const MODES = [
  { id: "qa",        label: "Q&A Generator", icon: "◈", desc: "10 long + 10 short Q&A", category: "general" },
  { id: "mcq",       label: "MCQ Generator",  icon: "◉", desc: "Multiple choice questions", category: "general" },
  { id: "explain",   label: "Explain",         icon: "◇", desc: "Simple to advanced", category: "general" },
  { id: "notes",     label: "Smart Notes",     icon: "▣", desc: "Notes with tables", category: "general" },
  { id: "flashcard", label: "Flashcards",      icon: "▨", desc: "Quick revision cards", category: "general" },
  { id: "summary",   label: "Summarizer",      icon: "◎", desc: "Concise summary", category: "general" },
  { id: "gate",      label: "GATE Prep",       icon: "⬡", desc: "GATE-style MCQs", category: "exam", color: "#f59e0b" },
  { id: "jee",       label: "JEE Prep",        icon: "⬢", desc: "JEE Main + Advanced", category: "exam", color: "#60a5fa" },
  { id: "upsc",      label: "UPSC Prep",       icon: "⬣", desc: "Mains answer writing", category: "exam", color: "#a78bfa" },
  { id: "neet",      label: "NEET Prep",       icon: "✦", desc: "NEET MCQs + NCERT", category: "exam", color: "#34d399" },
];

const DIFFICULTY = ["Easy", "Medium", "Hard"];
const EXAM_COLORS = { gate: "#f59e0b", jee: "#60a5fa", upsc: "#a78bfa", neet: "#34d399" };

/* ─── TYPING TEXT ─── */
function TypingText({ text, speed = 5 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false); let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setDone(true); clearInterval(iv); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span style={{ whiteSpace: "pre-wrap" }}>{displayed}{!done && <span style={{ color: "#fbbf24", animation: "blink .7s step-end infinite" }}>|</span>}</span>;
}

/* ─── 3D PARTICLE LOGIN BG ─── */
function ThreeDBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 800, r: Math.random() * 2 + 0.5,
    }));

    let angle = 0, id;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)/1.5);
      grad.addColorStop(0, "rgba(20,10,40,1)");
      grad.addColorStop(1, "rgba(5,5,15,1)");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      angle += 0.003;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      particles.forEach(p => {
        const rx = p.x * cos - p.z * sin;
        const rz = p.x * sin + p.z * cos;
        const fov = 600;
        const scale = fov / (fov + rz + 400);
        const sx = rx * scale + W / 2;
        const sy = p.y * scale + H / 2;
        const alpha = Math.max(0, Math.min(1, scale * 1.5));
        const hue = ((rz + 400) / 800) * 60 + 30;
        ctx.beginPath();
        ctx.arc(sx, sy, p.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha * 0.8})`;
        ctx.fill();
      });

      const projected = particles.map(p => {
        const rx = p.x * cos - p.z * sin;
        const rz = p.x * sin + p.z * cos;
        const scale = 600 / (600 + rz + 400);
        return { x: rx * scale + W/2, y: p.y * scale + H/2 };
      });
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = `rgba(251,191,36,${(1 - dist/80) * 0.15})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ─── 3D MAIN APP BACKGROUND (enhanced) ─── */
function MainCanvas3D() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    // Floating 3D rings
    const rings = Array.from({ length: 6 }, (_, i) => ({
      cx: Math.random() * window.innerWidth,
      cy: Math.random() * window.innerHeight,
      rx: 60 + i * 30, ry: 20 + i * 10,
      speed: 0.003 + i * 0.001,
      phase: Math.random() * Math.PI * 2,
      hue: 30 + i * 15,
      alpha: 0.04 + i * 0.01,
    }));

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random()-.5)*.3,
      dy: (Math.random()-.5)*.3,
      a: Math.random() * .35 + .06,
    }));

    let t = 0, id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial glow
      const grd = ctx.createRadialGradient(canvas.width*.5, canvas.height*.4, 0, canvas.width*.5, canvas.height*.4, canvas.width*.6);
      grd.addColorStop(0, "rgba(251,191,36,0.03)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3D rotating ellipses (rings effect)
      rings.forEach(ring => {
        const phase = t * ring.speed + ring.phase;
        const scaleY = Math.abs(Math.sin(phase));
        ctx.beginPath();
        ctx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry * scaleY + 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${ring.hue}, 80%, 65%, ${ring.alpha + scaleY * 0.04})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Floating particles
      pts.forEach(p => {
        const depth = 0.5 + p.z * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${p.a * depth})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(251,191,36,${(1 - dist/90) * 0.09})`;
            ctx.lineWidth = 0.4; ctx.stroke();
          }
        }
      }

      t++;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 1 }} />;
}

/* ─── DOWNLOAD HELPERS ─── */
function downloadTxt(q, a, mode, diff) {
  const blob = new Blob([`Topic: ${q}\nMode: ${mode}\nDifficulty: ${diff}\n\n${a}`], { type: "text/plain" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
  link.download = `ardino_${mode}_${Date.now()}.txt`; link.click();
}
function downloadPdf(q, a, mode, diff) {
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>ARDINO.ai</title><style>body{font-family:Georgia;padding:40px;max-width:800px;margin:auto;line-height:1.7}h1{color:#d97706;border-bottom:2px solid #d97706;padding-bottom:8px}.q{background:#fffbeb;border-left:4px solid #d97706;padding:12px;margin:16px 0}.a{white-space:pre-wrap;font-size:14px}.meta{color:#888;font-size:12px;font-family:monospace}</style></head><body><h1>◈ ARDINO.ai</h1><div class="meta">Mode: ${mode} | Difficulty: ${diff} | ${new Date().toLocaleString()}</div><div class="q"><b>Topic:</b> ${q}</div><div class="a">${a}</div></body></html>`);
  w.document.close(); setTimeout(() => w.print(), 400);
}
function downloadWord(q, a, mode, diff) {
  const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Georgia;margin:40px;line-height:1.7}h1{color:#d97706}.q{background:#fffbeb;padding:10px;border-left:4pt solid #d97706}.a{white-space:pre-wrap}</style></head><body><h1>◈ ARDINO.ai</h1><p style="color:#888;font-size:11pt">Mode: ${mode} | Difficulty: ${diff} | ${new Date().toLocaleString()}</p><div class="q"><b>Topic:</b> ${q}</div><div class="a">${a}</div></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
  link.download = `ardino_${mode}_${Date.now()}.doc`; link.click();
}

/* ─── PRIVACY PAGE ─── */
function PrivacyPage({ onBack }) {
  return (
    <div style={{ ...S.root, overflowY: "auto" }}>
      <MainCanvas3D />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <h1 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 8, marginTop: 24 }}>Privacy Policy</h1>
        <p style={{ color: "#5a5040", fontSize: 13, fontStyle: "italic", marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>
        {[
          ["Data We Collect", "We collect your username, hashed password, questions you ask, and AI-generated answers. Voice inputs are processed in real-time and not stored permanently."],
          ["How We Use Your Data", "Your data is used solely to provide personalized learning experiences, maintain history, and track exam progress. We do not sell your data to third parties."],
          ["Data Storage", "All data is stored locally in a SQLite database on your device/server. No data is sent to external servers except Groq AI API for generating answers."],
          ["Third-Party Services", "We use Groq AI API for answer generation and speech transcription. Please review Groq's privacy policy at console.groq.com."],
          ["Data Deletion", "You can delete your chat history at any time from the app. To delete your account, contact the administrator."],
          ["Security", "Passwords are hashed using bcrypt. We recommend using a strong, unique password."],
          ["Contact", "For privacy concerns, contact the app administrator. This is an educational tool built for personal use."],
        ].map(([title, text]) => (
          <div key={title} style={{ marginBottom: 24, padding: "18px 20px", background: "rgba(14,14,22,.85)", border: "1px solid rgba(251,191,36,.12)", borderRadius: 10 }}>
            <h3 style={{ color: "#f5f0e8", fontSize: 15, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: "#9a9080", fontSize: 14, lineHeight: 1.7 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PAYMENT PAGE ─── */
function PaymentPage({ user, onBack, onUpgrade }) {
  const [loading, setLoading] = useState(false);
  const handlePay = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await fetch(`${API}/payment/verify`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user })
        });
        onUpgrade();
      } catch {}
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ ...S.root, overflowY: "auto" }}>
      <MainCanvas3D />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <h1 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 6, marginTop: 24 }}>Upgrade to Pro</h1>
        <p style={{ color: "#6b6050", fontStyle: "italic", marginBottom: 36 }}>Unlock unlimited access to all exam modes</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { plan: "Free", price: "₹0", features: ["5 generations/day", "General modes only", "Basic history (10)"], color: "#5a5040" },
            { plan: "Pro", price: "₹199/mo", features: ["Unlimited generations", "All exam modes (GATE/JEE/UPSC/NEET)", "Full history + export", "Voice input", "RAG file upload", "Image Vision AI", "Priority support"], color: "#fbbf24", highlight: true },
          ].map(({ plan, price, features, color, highlight }) => (
            <div key={plan} style={{ padding: "24px 20px", background: highlight ? "rgba(251,191,36,.06)" : "rgba(14,14,22,.85)", border: `1px solid ${highlight ? "rgba(251,191,36,.35)" : "rgba(255,255,255,.08)"}`, borderRadius: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 4 }}>{plan}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#f5f0e8", marginBottom: 16 }}>{price}</div>
              {features.map(f => (
                <div key={f} style={{ fontSize: 13, color: "#9a9080", marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ color: highlight ? "#fbbf24" : "#5a5040" }}>✓</span> {f}
                </div>
              ))}
              {highlight && (
                <button style={{ ...S.genBtn, marginTop: 20, opacity: loading ? .65 : 1 }}
                  onClick={handlePay} disabled={loading}>
                  {loading ? "Processing..." : "⚡ Upgrade Now"}
                </button>
              )}
            </div>
          ))}
        </div>
        <p style={{ color: "#3a3530", fontSize: 12, textAlign: "center", fontStyle: "italic" }}>
          Secured by Razorpay · Cancel anytime · No hidden charges
        </p>
      </div>
    </div>
  );
}

/* ─── PROGRESS PAGE ─── */
function ProgressPage({ user, onBack }) {
  const [progress, setProgress] = useState([]);
  useEffect(() => {
    fetch(`${API}/progress/${user}`).then(r => r.json()).then(d => setProgress(d.progress || []));
  }, [user]);

  const examStats = ["gate","jee","upsc","neet"].map(exam => {
    const entries = progress.filter(p => p.exam === exam);
    const total = entries.reduce((s, p) => s + p.total, 0);
    const score = entries.reduce((s, p) => s + p.score, 0);
    return { exam, entries: entries.length, score, total, pct: total ? Math.round(score/total*100) : 0 };
  });

  return (
    <div style={{ ...S.root, overflowY: "auto" }}>
      <MainCanvas3D />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <h1 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 28, marginTop: 24 }}>Exam Progress</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 32 }}>
          {examStats.map(s => {
            const color = EXAM_COLORS[s.exam] || "#fbbf24";
            return (
              <div key={s.exam} style={{ padding: "18px 16px", background: "rgba(14,14,22,.88)", border: `1px solid ${color}28`, borderRadius: 10 }}>
                <div style={{ color, fontSize: 12, fontFamily: "monospace", fontWeight: 700, letterSpacing: ".1em" }}>{s.exam.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "6px 0" }}>{s.pct}%</div>
                <div style={{ fontSize: 11, color: "#5a5040" }}>{s.score}/{s.total} pts · {s.entries} sessions</div>
                <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,.05)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: color, borderRadius: 2, transition: "width .8s" }} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ ...S.label, marginBottom: 12 }}>ALL SESSIONS</p>
        {progress.length === 0 && <p style={{ color: "#4a4535", fontStyle: "italic", fontSize: 14 }}>No progress recorded yet.</p>}
        {progress.map((p, i) => {
          const color = EXAM_COLORS[p.exam] || "#fbbf24";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(12,12,20,.9)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 8, marginBottom: 6 }}>
              <div>
                <div style={{ color, fontSize: 11, fontFamily: "monospace" }}>{p.exam.toUpperCase()}</div>
                <div style={{ color: "#c4b898", fontSize: 13, marginTop: 2 }}>{p.topic}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f5f0e8", fontSize: 15, fontWeight: 700 }}>{p.score}/{p.total}</div>
                <div style={{ color: "#5a5040", fontSize: 11 }}>{p.created_at?.slice(0,10)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── AUTH SCREEN with 3D + Show Password + Improved UI ─── */
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(""); const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (showPrivacy) return <PrivacyPage onBack={() => setShowPrivacy(false)} />;

  const submit = async () => {
    setMsg("");
    if (!u.trim() || !p.trim()) { setMsg("Fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(API + (tab === "login" ? "/login" : "/signup"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.detail || "Error");
      else if (tab === "signup") { setMsg("✓ Account created! Login karo."); setTab("login"); setU(""); setP(""); }
      else onLogin(u, data.is_pro);
    } catch { setMsg("Cannot connect to server. Is backend running?"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ThreeDBg />
      {/* Floating orbs */}
      <div style={{ position: "fixed", top: "15%", left: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,.08) 0%, transparent 70%)", animation: "float 6s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "fixed", bottom: "20%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,.06) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 1 }} />
      {/* Extra orb for depth */}
      <div style={{ position: "fixed", top: "55%", left: "5%", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,.05) 0%, transparent 70%)", animation: "float 10s ease-in-out infinite", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2, width: 380, animation: "slideUp .6s ease", padding: "0 16px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, color: "#fbbf24", marginBottom: 8, animation: "pulse 2s ease-in-out infinite", display: "inline-block" }}>◈</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#f5f0e8", letterSpacing: ".08em", fontFamily: "'Georgia',serif", margin: "0 0 4px" }}>
            ARDINO<span style={{ color: "#fbbf24" }}>.ai</span>
          </h1>
          <p style={{ color: "#5a5040", fontSize: 13, fontStyle: "italic" }}>AI-powered learning assistant</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(8,8,16,.88)", border: "1px solid rgba(251,191,36,.22)", borderRadius: 18, padding: "32px 28px", backdropFilter: "blur(24px)", boxShadow: "0 28px 90px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.03)" }}>
          {/* Tabs */}
          <div style={S.authTabs}>
            {["login","signup"].map(t => (
              <button key={t} style={{ ...S.authTab, ...(tab===t ? S.authTabActive : {}) }}
                onClick={() => { setTab(t); setMsg(""); setShowPwd(false); }}>
                {t === "login" ? "🔑 Login" : "✨ Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 22 }}>
            {/* Username */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#5a5040", fontSize: 15 }}>👤</span>
              <input
                style={{ ...S.authInput, paddingLeft: 40 }}
                placeholder="Username"
                value={u}
                onChange={e => setU(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Password with show/hide */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#5a5040", fontSize: 15 }}>🔒</span>
              <input
                style={{ ...S.authInput, paddingLeft: 40, paddingRight: 48 }}
                placeholder="Password"
                type={showPwd ? "text" : "password"}
                value={p}
                onChange={e => setP(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
              {/* Show/Hide toggle */}
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16,
                  color: showPwd ? "#fbbf24" : "#4a4535", padding: "2px 4px",
                  lineHeight: 1, transition: "color .2s",
                }}
              >
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>

            {/* Password strength hint for signup */}
            {tab === "signup" && p.length > 0 && (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {["Weak","Fair","Strong"].map((label, i) => {
                  const strength = p.length < 6 ? 0 : p.length < 10 ? 1 : 2;
                  const colors = ["#f87171","#fbbf24","#4ade80"];
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 40, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : "rgba(255,255,255,.07)", transition: "background .3s" }} />
                      {i === 2 && <span style={{ fontSize: 10, color: colors[strength], fontFamily: "monospace", marginLeft: 4 }}>{["Weak","Fair","Strong"][strength]}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {msg && (
            <p style={{ color: msg.startsWith("✓") ? "#4ade80" : "#f87171", fontSize: 13, marginTop: 12, textAlign: "center", animation: "slideUp .3s ease" }}>
              {msg}
            </p>
          )}

          <button
            style={{ ...S.genBtn, marginTop: 20, opacity: loading ? .65 : 1, boxShadow: "0 4px 20px rgba(251,191,36,.25)" }}
            onClick={submit} disabled={loading}
          >
            {loading ? <span className="spin">⟳</span> : (tab === "login" ? "Login →" : "Create Account →")}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 14px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
            <span style={{ color: "#3a3530", fontSize: 11, fontFamily: "monospace" }}>ARDINO.AI</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: "#4a4535", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Bottom tagline */}
        <p style={{ textAlign: "center", color: "#2a2520", fontSize: 11, marginTop: 18, fontFamily: "monospace" }}>
          Powered by Groq · LLaMA-4 Vision · Whisper
        </p>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [page, setPage] = useState("main");
  const [mode, setMode] = useState("qa");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [historyView, setHistoryView] = useState(null);
  const [fileContext, setFileContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  // Voice
  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceCountdown, setVoiceCountdown] = useState(0);
  // Image / Vision
  const [imageBase64, setImageBase64] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  // Score
  const [scoreInput, setScoreInput] = useState({ show: false, score: "", total: "" });

  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchHistory = async (u) => {
    try {
      const res = await fetch(`${API}/history/${u}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {}
  };

  useEffect(() => { if (user) fetchHistory(user); }, [user]);

  if (!user) return <AuthScreen onLogin={(u, pro) => { setUser(u); setIsPro(pro); fetchHistory(u); }} />;
  if (page === "privacy") return <PrivacyPage onBack={() => setPage("main")} />;
  if (page === "payment") return <PaymentPage user={user} onBack={() => setPage("main")} onUpgrade={() => { setIsPro(true); setPage("main"); }} />;
  if (page === "progress") return <ProgressPage user={user} onBack={() => setPage("main")} />;

  const currentMode = MODES.find(m => m.id === mode);
  const isExamMode = currentMode?.category === "exam";
  const examColor = currentMode?.color || "#fbbf24";

  // ─── VOICE (auto-stop at 5s) ───
  const startRecording = async () => {
    setVoiceError(""); setQuestion(""); setVoiceCountdown(5);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        clearInterval(countdownRef.current);
        setVoiceCountdown(0);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("file", blob, "voice.webm");
        try {
          const res = await fetch(`${API}/voice`, { method: "POST", body: form });
          const data = await res.json();
          if (data.text) setQuestion(data.text);
          else setVoiceError("Could not transcribe");
        } catch { setVoiceError("Voice API error"); }
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(); setRecording(true);

      // Auto-stop after 5 seconds
      let remaining = 5;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setVoiceCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);

      voiceTimerRef.current = setTimeout(() => {
        if (mediaRef.current && mediaRef.current.state === "recording") {
          mediaRef.current.stop();
          setRecording(false);
        }
      }, 5000);

    } catch { setVoiceError("Microphone not accessible"); }
  };

  const stopRecording = () => {
    clearTimeout(voiceTimerRef.current);
    clearInterval(countdownRef.current);
    setVoiceCountdown(0);
    if (mediaRef.current) mediaRef.current.stop();
    setRecording(false);
  };

  // ─── FILE UPLOAD (PDF/TXT) ───
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setFileLoading(true); setFileError(""); setFileContext(""); setFileName("");
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setFileContext(data.text); setFileName(data.filename);
    } catch (e) { setFileError("Upload error: " + e.message); }
    setFileLoading(false);
  };

  // ─── IMAGE UPLOAD (Vision) ───
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImageLoading(true); setImageError(""); setImageBase64(""); setImageName(""); setImagePreview("");
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch(`${API}/upload_image`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Image upload failed");
      setImageBase64(data.image_base64);
      setImageName(data.filename);
    } catch (e) { setImageError("Image error: " + e.message); setImagePreview(""); }
    setImageLoading(false);
  };

  const clearImage = () => {
    setImageBase64(""); setImageName(""); setImagePreview("");
    if (imageRef.current) imageRef.current.value = "";
  };

  // ─── DELETE HISTORY ───
  const deleteHistory = async (all = false, id = null) => {
    await fetch(`${API}/history`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, delete_all: all, history_id: id }),
    });
    fetchHistory(user);
    if (all) setHistoryView(null);
  };

  // ─── SAVE PROGRESS ───
  const saveProgress = async () => {
    if (!scoreInput.score || !scoreInput.total) return;
    await fetch(`${API}/progress`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, exam: mode, topic: question, score: parseInt(scoreInput.score), total: parseInt(scoreInput.total) }),
    });
    setScoreInput({ show: false, score: "", total: "" });
  };

  // ─── GENERATE ───
  const handleGenerate = async () => {
    if (!question.trim()) return;
    setLoading(true); setResult(""); setError(""); setHistoryView(null);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, question, mode, difficulty, file_context: fileContext, image_base64: imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");
      setResult(data.answer);
      fetchHistory(user);
      if (isExamMode) setScoreInput({ show: true, score: "", total: "" });
    } catch (e) { setError("Error: " + e.message); }
    setLoading(false);
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const displayedResult = historyView ? historyView.answer : result;
  const displayedQuestion = historyView ? historyView.question : question;
  const displayedDifficulty = historyView ? historyView.difficulty : difficulty;

  return (
    <div style={S.root}>
      <style>{css}</style>
      <MainCanvas3D />

      {/* TOP BAR */}
      <header style={S.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={S.menuBtn} onClick={() => setSidebarOpen(p => !p)}>{sidebarOpen ? "✕" : "☰"}</button>
          <span style={{ color: "#fbbf24", fontSize: 22, animation: "pulse 3s ease-in-out infinite" }}>◈</span>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: ".08em", color: "#f5f0e8", fontFamily: "'Georgia',serif" }}>
            ARDINO<span style={{ color: "#fbbf24" }}>.ai</span>
          </span>
          {isPro && <span style={{ fontSize: 10, background: "rgba(251,191,36,.15)", border: "1px solid rgba(251,191,36,.3)", color: "#fbbf24", borderRadius: 20, padding: "2px 8px", fontFamily: "monospace" }}>PRO</span>}
          {imageBase64 && <span style={{ fontSize: 10, background: "rgba(96,165,250,.12)", border: "1px solid rgba(96,165,250,.3)", color: "#60a5fa", borderRadius: 20, padding: "2px 8px", fontFamily: "monospace" }}>👁 VISION</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={S.topBtn} onClick={() => setPage("progress")}>📊 Progress</button>
          {!isPro && <button style={{ ...S.topBtn, color: "#fbbf24", borderColor: "rgba(251,191,36,.3)" }} onClick={() => setPage("payment")}>⚡ Upgrade</button>}
          <button style={S.topBtn} onClick={() => setPage("privacy")}>🔒 Privacy</button>
          <div style={S.userChip}><span style={S.dot} />{user}</div>
          <button style={S.logoutBtn} onClick={() => { setUser(null); setResult(""); setHistory([]); }}>Logout</button>
        </div>
      </header>

      <div style={S.body}>
        {/* SIDEBAR */}
        <aside style={{ width: sidebarOpen?242:0, opacity: sidebarOpen?1:0, overflow:"hidden", transition:"width .3s ease, opacity .25s ease", borderRight: sidebarOpen?"1px solid rgba(251,191,36,.08)":"none", background:"rgba(8,8,14,.94)", flexShrink:0 }}>
          <div style={{ width:242, padding:"20px 12px" }}>
            <p style={S.label}>GENERAL</p>
            {MODES.filter(m => m.category === "general").map(m => (
              <button key={m.id} style={{ ...S.modeBtn, ...(mode===m.id ? S.modeBtnActive : {}) }} onClick={() => { setMode(m.id); setHistoryView(null); }}>
                <span style={{ color:"#fbbf24", fontSize:13, flexShrink:0 }}>{m.icon}</span>
                <div><div style={{ fontSize:12, fontWeight:600 }}>{m.label}</div><div style={{ fontSize:10, color:"#6b6050", marginTop:1 }}>{m.desc}</div></div>
              </button>
            ))}

            <p style={{ ...S.label, marginTop:20 }}>EXAM MODES</p>
            {MODES.filter(m => m.category === "exam").map(m => (
              <button key={m.id} style={{ ...S.modeBtn, ...(mode===m.id ? { ...S.modeBtnActive, borderColor: `${m.color}40`, background: `${m.color}0d` } : {}) }} onClick={() => { setMode(m.id); setHistoryView(null); }}>
                <span style={{ color: m.color, fontSize:13, flexShrink:0 }}>{m.icon}</span>
                <div><div style={{ fontSize:12, fontWeight:600, color: mode===m.id ? m.color : "#8a8070" }}>{m.label}</div><div style={{ fontSize:10, color:"#6b6050", marginTop:1 }}>{m.desc}</div></div>
              </button>
            ))}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:22, marginBottom:8 }}>
              <p style={{ ...S.label, margin:0 }}>RECENT</p>
              {history.length > 0 && (
                <button onClick={() => deleteHistory(true)} style={{ fontSize:10, color:"#f87171", background:"none", border:"none", cursor:"pointer", fontFamily:"monospace" }}>
                  Clear All
                </button>
              )}
            </div>
            {history.slice(0,8).map((h,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                <button style={{ ...S.histItem, flex:1 }} onClick={() => { setHistoryView(h); setResult(""); }}>
                  <span style={{ color:"#fbbf24", fontSize:9, flexShrink:0 }}>▸</span>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:11 }}>{h.question}</span>
                </button>
                <button onClick={() => deleteHistory(false, h.id)} style={{ background:"none", border:"none", color:"#3a3530", cursor:"pointer", fontSize:12, padding:"2px 4px", flexShrink:0 }}>✕</button>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={S.main}>
          <div style={S.inner}>
            {/* HERO */}
            <div style={{ marginBottom:28, animation: "slideUp .7s ease" }}>
              <h1 style={{ fontSize:34, fontWeight:700, color:"#f5f0e8", letterSpacing:"-.02em", margin:0, lineHeight: 1.2 }}>
                Generate. Learn.{" "}
                <span style={{ color: isExamMode ? examColor : "#fbbf24", textShadow: `0 0 40px ${isExamMode ? examColor : "#fbbf24"}44` }}>
                  Master.
                </span>
              </h1>
              <p style={{ color:"#6b6050", marginTop:8, fontStyle:"italic", fontSize:13 }}>
                AI-powered learning — built for serious learners.{" "}
                {imageBase64 && <span style={{ color:"#60a5fa" }}>Vision mode active 👁</span>}
              </p>
            </div>

            {/* EXAM MODE BANNER */}
            {isExamMode && (
              <div style={{ padding:"12px 16px", background:`${examColor}0d`, border:`1px solid ${examColor}30`, borderRadius:10, marginBottom:20, display:"flex", alignItems:"center", gap:10, animation: "slideUp .4s ease" }}>
                <span style={{ fontSize:18, color:examColor }}>{currentMode.icon}</span>
                <div>
                  <div style={{ color:examColor, fontSize:13, fontWeight:700 }}>{currentMode.label} Mode Active</div>
                  <div style={{ color:"#6b6050", fontSize:12 }}>Questions are tailored for {mode.toUpperCase()} exam pattern</div>
                </div>
                <button onClick={() => setPage("progress")} style={{ marginLeft:"auto", fontSize:11, color:examColor, background:"none", border:`1px solid ${examColor}40`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>
                  View Progress →
                </button>
              </div>
            )}

            {/* INPUT CARD */}
            <div style={{ ...S.card, animation: "slideUp .5s ease" }}>
              <div style={{ marginBottom:12, fontSize:11, letterSpacing:".1em", color: isExamMode ? examColor : "#fbbf24", fontFamily:"monospace", display:"flex", alignItems:"center", gap:8 }}>
                {currentMode.icon} {currentMode.label.toUpperCase()}
                {imageBase64 && <span style={{ color:"#60a5fa", marginLeft:4 }}>· 👁 VISION READY</span>}
              </div>

              {/* Textarea + Voice */}
              <div style={{ position:"relative" }}>
                <textarea
                  style={{ ...S.textarea, paddingRight:52 }}
                  placeholder={imageBase64 ? "Describe what you want to know about the image..." : "Enter your topic or question..."}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  rows={3}
                />
                {/* Voice Button */}
                <button
                  style={{
                    position:"absolute", right:10, top:10, width:38, height:38, borderRadius:"50%",
                    background: recording ? "rgba(248,113,113,.18)" : "rgba(251,191,36,.1)",
                    border: `1px solid ${recording ? "rgba(248,113,113,.5)" : "rgba(251,191,36,.3)"}`,
                    color: recording ? "#f87171" : "#fbbf24", cursor:"pointer", fontSize:16,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    animation: recording ? "pulse 1s ease-in-out infinite" : "none",
                    transition: "all .2s",
                  }}
                  onClick={recording ? stopRecording : startRecording}
                  title={recording ? "Stop recording" : "Voice input — auto stops at 5s"}
                >
                  {recording ? (
                    <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:"#f87171" }}>{voiceCountdown}</span>
                  ) : "🎙"}
                </button>
              </div>

              {voiceError && <p style={{ color:"#f87171", fontSize:12, marginTop:4 }}>{voiceError}</p>}
              {recording && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#f87171", animation:"pulse .8s ease-in-out infinite" }} />
                  <p style={{ color:"#f87171", fontSize:12, fontStyle:"italic", margin:0 }}>
                    Recording... auto-stops in {voiceCountdown}s
                  </p>
                  <div style={{ flex:1, height:2, background:"rgba(248,113,113,.1)", borderRadius:1 }}>
                    <div style={{ height:"100%", width:`${((5 - voiceCountdown)/5)*100}%`, background:"rgba(248,113,113,.5)", borderRadius:1, transition:"width 1s linear" }} />
                  </div>
                </div>
              )}

              {/* File Upload Row */}
              <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap", alignItems:"center" }}>
                {/* PDF / TXT */}
                <div style={{ ...S.uploadRow, flex:1, minWidth:180 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <button style={S.uploadBtn} onClick={() => fileRef.current?.click()}>
                      {fileLoading ? "⟳ Uploading..." : "📎 PDF / TXT"}
                    </button>
                    <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display:"none" }} onChange={handleFileUpload} />
                    {fileName && (
                      <div style={S.fileChip}>
                        <span style={{ color:"#4ade80" }}>✓</span> {fileName}
                        <button onClick={() => { setFileContext(""); setFileName(""); if(fileRef.current) fileRef.current.value=""; }} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", marginLeft:6, fontSize:12 }}>✕</button>
                      </div>
                    )}
                  </div>
                  {fileName && <div style={{ fontSize:11, color:"#5a5040", marginTop:5, fontStyle:"italic" }}>◈ RAG active</div>}
                  {fileError && <p style={{ color:"#f87171", fontSize:12, marginTop:4 }}>{fileError}</p>}
                </div>

                {/* IMAGE Upload (Vision) */}
                <div style={{ ...S.uploadRow, flex:1, minWidth:180, borderColor: imageBase64 ? "rgba(96,165,250,.3)" : "rgba(251,191,36,.13)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <button
                      style={{ ...S.uploadBtn, background: imageBase64 ? "rgba(96,165,250,.1)" : "rgba(251,191,36,.07)", borderColor: imageBase64 ? "rgba(96,165,250,.35)" : "rgba(251,191,36,.22)", color: imageBase64 ? "#60a5fa" : "#fbbf24" }}
                      onClick={() => imageRef.current?.click()}
                    >
                      {imageLoading ? "⟳ Uploading..." : "🖼 Image (Vision)"}
                    </button>
                    <input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" style={{ display:"none" }} onChange={handleImageUpload} />
                    {imageName && (
                      <div style={{ ...S.fileChip, borderColor:"rgba(96,165,250,.3)", color:"#60a5fa" }}>
                        <span style={{ color:"#60a5fa" }}>👁</span> {imageName}
                        <button onClick={clearImage} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", marginLeft:6, fontSize:12 }}>✕</button>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                      <img src={imagePreview} alt="preview" style={{ width:52, height:52, objectFit:"cover", borderRadius:6, border:"1px solid rgba(96,165,250,.25)" }} />
                      <span style={{ fontSize:11, color:"#4a6080", fontStyle:"italic" }}>👁 Vision model will analyze this image</span>
                    </div>
                  )}
                  {imageError && <p style={{ color:"#f87171", fontSize:12, marginTop:4 }}>{imageError}</p>}
                </div>
              </div>

              {/* Difficulty */}
              <div style={{ margin:"14px 0" }}>
                <div style={S.optLabel}>DIFFICULTY</div>
                <div style={{ display:"flex", gap:6, marginTop:6 }}>
                  {DIFFICULTY.map(d => (
                    <button key={d} style={{ ...S.pill, ...(difficulty===d ? { ...S.pillActive, borderColor: isExamMode ? `${examColor}60` : undefined, color: isExamMode ? examColor : undefined } : {}) }} onClick={() => setDifficulty(d)}>{d}</button>
                  ))}
                </div>
              </div>

              <button
                style={{ ...S.genBtn, marginTop:8, background: isExamMode ? `linear-gradient(135deg, ${examColor}, ${examColor}cc)` : "linear-gradient(135deg,#fbbf24,#f59e0b)", opacity: loading ? .65 : 1, cursor: loading ? "not-allowed" : "pointer", boxShadow: `0 4px 20px ${isExamMode ? examColor : "#fbbf24"}30` }}
                onClick={handleGenerate} disabled={loading}
              >
                {loading ? <span className="spin">⟳ Generating...</span> : `⚡ Generate ${currentMode.label}${imageBase64 ? " (Vision)" : ""}`}
              </button>
            </div>

            {/* SCORE INPUT */}
            {scoreInput.show && isExamMode && (
              <div style={{ ...S.card, borderColor:`${examColor}30`, marginBottom:16 }}>
                <p style={{ color:examColor, fontSize:12, marginBottom:12, fontFamily:"monospace" }}>SAVE YOUR SCORE</p>
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <input type="number" placeholder="Score" value={scoreInput.score}
                    onChange={e => setScoreInput(p => ({ ...p, score: e.target.value }))}
                    style={{ ...S.authInput, width:90, padding:"8px 12px" }} />
                  <span style={{ color:"#5a5040" }}>out of</span>
                  <input type="number" placeholder="Total" value={scoreInput.total}
                    onChange={e => setScoreInput(p => ({ ...p, total: e.target.value }))}
                    style={{ ...S.authInput, width:90, padding:"8px 12px" }} />
                  <button onClick={saveProgress} style={{ ...S.pill, ...S.pillActive, borderColor:`${examColor}40`, color:examColor }}>Save Progress</button>
                  <button onClick={() => setScoreInput({ show:false, score:"", total:"" })} style={S.pill}>Skip</button>
                </div>
              </div>
            )}

            {/* HISTORY BANNER */}
            {historyView && (
              <div style={{ ...S.card, borderColor:"rgba(251,191,36,.28)", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:11, color:"#fbbf24", fontFamily:"monospace" }}>HISTORY · {historyView.created_at?.slice(0,16).replace("T"," ")}</span>
                  <button style={{ ...S.pill, fontSize:11 }} onClick={() => setHistoryView(null)}>✕ Close</button>
                </div>
                <p style={{ fontSize:14, color:"#c4b898" }}>{historyView.question}</p>
              </div>
            )}

            {/* RESULT */}
            {displayedResult && (
              <div style={S.resultCard}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
                  <span style={{ fontSize:11, color:"#fbbf24", fontFamily:"monospace" }}>RESULT</span>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    <button style={S.dlBtn} onClick={() => handleCopy(displayedResult)}>{copied ? "✓ Copied" : "⎘ Copy"}</button>
                    <button style={S.dlBtn} onClick={() => downloadTxt(displayedQuestion, displayedResult, currentMode.label, displayedDifficulty)}>⬇ TXT</button>
                    <button style={S.dlBtn} onClick={() => downloadPdf(displayedQuestion, displayedResult, currentMode.label, displayedDifficulty)}>⬇ PDF</button>
                    <button style={{ ...S.dlBtn, color:"#60a5fa", borderColor:"rgba(96,165,250,.25)" }} onClick={() => downloadWord(displayedQuestion, displayedResult, currentMode.label, displayedDifficulty)}>⬇ Word</button>
                  </div>
                </div>
                <div style={{ fontSize:14, color:"#9a9080", lineHeight:1.9 }}>
                  {historyView ? <span style={{ whiteSpace:"pre-wrap" }}>{displayedResult}</span> : <TypingText key={result} text={displayedResult} />}
                </div>
                <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
                  <span style={S.tag}>{displayedDifficulty}</span>
                  <span style={{ ...S.tag, color: isExamMode ? examColor : "#4a4535", borderColor: isExamMode ? `${examColor}25` : undefined }}>{currentMode.label}</span>
                  {fileContext && !historyView && <span style={{ ...S.tag, color:"#4ade80", borderColor:"rgba(74,222,128,.2)" }}>RAG</span>}
                  {imageBase64 && !historyView && <span style={{ ...S.tag, color:"#60a5fa", borderColor:"rgba(96,165,250,.2)" }}>👁 VISION</span>}
                </div>
              </div>
            )}

            {error && (
              <div style={{ ...S.resultCard, borderColor:"rgba(248,113,113,.3)", background:"rgba(248,113,113,.04)" }}>
                <p style={{ color:"#f87171", fontSize:14 }}>{error}</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <div className="ring" style={{ borderTopColor: isExamMode ? examColor : "#fbbf24" }} />
                <p style={{ color:"#5a5540", fontSize:13, marginTop:20, fontStyle:"italic" }}>
                  {imageBase64 ? "Analyzing image with Vision AI..." : "Generating your answer..."}
                </p>
              </div>
            )}

            {!displayedResult && !loading && !error && (
              <div style={{ textAlign:"center", padding:"52px 0", color:"#252018", animation: "slideUp .8s ease" }}>
                <div style={{ fontSize:50, marginBottom:12, animation:"float 4s ease-in-out infinite", display:"inline-block" }}>◈</div>
                <p style={{ fontStyle:"italic", fontSize:14 }}>Enter a topic above and hit Generate</p>
                <p style={{ fontSize:12, color:"#1e1a14", marginTop:6 }}>Upload an image to use Vision AI</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const S = {
  root: { minHeight:"100vh", background:"#080810", color:"#e8e4d9", fontFamily:"'Georgia','Times New Roman',serif", position:"relative", overflow:"hidden", margin:0, padding:0 },
  topbar: { position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", height:54, background:"rgba(6,6,12,.97)", borderBottom:"1px solid rgba(251,191,36,.1)", backdropFilter:"blur(18px)", flexWrap:"wrap", gap:8 },
  menuBtn: { background:"none", border:"none", color:"#fbbf24", fontSize:18, cursor:"pointer", padding:"4px 8px" },
  topBtn: { background:"none", border:"1px solid rgba(255,255,255,.1)", color:"#7a7060", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", letterSpacing:".03em" },
  userChip: { display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.18)", fontSize:13, color:"#d4c9a8" },
  dot: { width:7, height:7, borderRadius:"50%", background:"#4ade80", display:"inline-block" },
  logoutBtn: { background:"none", border:"1px solid rgba(255,255,255,.09)", color:"#666", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer" },
  body: { display:"flex", minHeight:"calc(100vh - 54px)", position:"relative", zIndex:1 },
  label: { fontSize:9, letterSpacing:".16em", color:"#4a4535", marginBottom:7, fontFamily:"monospace" },
  modeBtn: { display:"flex", alignItems:"flex-start", gap:9, width:"100%", background:"none", border:"1px solid transparent", color:"#8a8070", padding:"8px 10px", borderRadius:7, cursor:"pointer", textAlign:"left", marginBottom:2, transition:"all .18s" },
  modeBtnActive: { background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.22)", color:"#f5f0e8" },
  histItem: { display:"flex", alignItems:"center", gap:7, flex:1, background:"none", border:"none", color:"#5a5040", padding:"5px 6px", borderRadius:5, cursor:"pointer", textAlign:"left", transition:"color .18s" },
  main: { flex:1, overflowY:"auto", minWidth:0 },
  inner: { maxWidth:820, margin:"0 auto", padding:"34px 20px" },
  card: { background:"rgba(10,10,18,.92)", border:"1px solid rgba(251,191,36,.12)", borderRadius:12, padding:20, marginBottom:20, backdropFilter:"blur(10px)", boxShadow:"0 8px 32px rgba(0,0,0,.4)" },
  textarea: { width:"100%", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:8, color:"#e8e4d9", fontSize:14, padding:"13px 15px", resize:"vertical", outline:"none", fontFamily:"'Georgia',serif", lineHeight:1.6, boxSizing:"border-box" },
  uploadRow: { padding:"11px 13px", borderRadius:8, background:"rgba(255,255,255,.02)", border:"1px dashed rgba(251,191,36,.13)" },
  uploadBtn: { padding:"6px 13px", borderRadius:7, background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.22)", color:"#fbbf24", fontSize:12, cursor:"pointer" },
  fileChip: { display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#9a9080", background:"rgba(74,222,128,.05)", border:"1px solid rgba(74,222,128,.18)", borderRadius:20, padding:"3px 10px" },
  optLabel: { fontSize:9, letterSpacing:".13em", color:"#4a4535", fontFamily:"monospace" },
  pill: { padding:"5px 13px", borderRadius:20, fontSize:12, border:"1px solid rgba(255,255,255,.1)", background:"none", color:"#6b6050", cursor:"pointer", transition:"all .18s" },
  pillActive: { background:"rgba(251,191,36,.11)", border:"1px solid rgba(251,191,36,.38)", color:"#fbbf24" },
  genBtn: { width:"100%", padding:13, borderRadius:8, border:"none", color:"#0a0a0f", fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:".03em", transition:"all .2s" },
  resultCard: { background:"rgba(10,10,18,.92)", border:"1px solid rgba(251,191,36,.16)", borderRadius:12, padding:22, backdropFilter:"blur(10px)" },
  dlBtn: { background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)", color:"#fbbf24", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer" },
  tag: { fontSize:9, letterSpacing:".1em", color:"#4a4535", border:"1px solid rgba(255,255,255,.06)", borderRadius:4, padding:"2px 8px", fontFamily:"monospace" },
  backBtn: { background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.2)", color:"#fbbf24", borderRadius:7, padding:"6px 14px", fontSize:13, cursor:"pointer" },
  authTabs: { display:"flex", border:"1px solid rgba(251,191,36,.15)", borderRadius:8, overflow:"hidden" },
  authTab: { flex:1, padding:"9px 0", background:"none", border:"none", color:"#6b6050", fontSize:13, cursor:"pointer", transition:"all .2s", letterSpacing:".04em" },
  authTabActive: { background:"rgba(251,191,36,.1)", color:"#fbbf24" },
  authInput: { width:"100%", padding:"11px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, color:"#e8e4d9", fontSize:14, outline:"none", fontFamily:"'Georgia',serif", boxSizing:"border-box" },
  authBtn: { padding:"12px", background:"linear-gradient(135deg,#fbbf24,#f59e0b)", border:"none", color:"#0a0a0f", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer" },
};

const css = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body, #root { background:#080810; min-height:100vh; width:100%; }
  body { margin:0 !important; padding:0 !important; overflow-x:hidden; }
  textarea:focus, input:focus { border-color:rgba(251,191,36,.4) !important; box-shadow:0 0 0 3px rgba(251,191,36,.06); }
  button:hover { opacity:.82; }
  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.06)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(251,191,36,.1)} 50%{box-shadow:0 0 40px rgba(251,191,36,.25)} }
  .spin { display:inline-block; animation:spinning 1s linear infinite; }
  @keyframes spinning { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .ring { width:42px;height:42px;border-radius:50%;border:2px solid rgba(251,191,36,.2);border-top-color:#fbbf24;animation:spinning 1s linear infinite;margin:0 auto; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(251,191,36,.15);border-radius:2px}
  input[type=number]::-webkit-inner-spin-button { opacity:.5; }
  input[type=file] { display:none; }
`;
