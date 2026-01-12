# Bedrock Chatbot

A full‑stack **AI Chatbot platform** built with **Next.js**, **FastAPI**, **PostgreSQL**, and **Amazon Bedrock (Anthropic Claude 3.5)**.
The project supports **real‑time streaming responses**, **authentication**, **chat history**, and a **modern UI powered by Tailwind CSS + daisyUI**.

---

## ✨ Features

### 🧠 AI Chat

* Streaming responses via **Server‑Sent Events (SSE)**
* Powered by **Amazon Bedrock – Anthropic Claude 3.5 (Haiku / Sonnet)**
* Regenerate last response
* Auto‑title conversations (first message or via LLM)

### 💬 Chat Management

* Multiple conversations per user
* Sidebar with chat history
* Auto open last conversation
* Rename conversation title

### 🔐 Authentication & Security

* Register / Login with JWT
* Password hashing with **Argon2**
* Forgot password & reset password via email
* Secure token‑based authentication

### 🎨 Frontend UI

* **Next.js App Router**
* **Tailwind CSS + daisyUI** (light / dark themes)
* Responsive, minimal, ChatGPT‑style interface
* Navbar with user dropdown

### 🗄️ Backend

* **FastAPI** REST API
* **PostgreSQL** + SQLAlchemy ORM
* Modular routers (auth, chat, conversations)
* Clean separation of concerns

---

## 🧱 Tech Stack

### Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* daisyUI

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* python‑jose (JWT)
* passlib (Argon2)

### AI / Cloud

* Amazon Bedrock
* Anthropic Claude 3.5 (Haiku / Sonnet)
* Streaming inference

---

## 📂 Project Structure

```
Bedrock-chatbot/
├─ backend/
│  ├─ app/
│  │  ├─ core/          # security, mailer, config
│  │  ├─ db/            # models, session
│  │  ├─ routers/       # auth, chat, conversations
│  │  ├─ services/      # bedrock streaming
│  │  └─ main.py
│  └─ requirements.txt
│
├─ frontend/
│  ├─ app/
│  │  ├─ chat/
│  │  ├─ login/
│  │  ├─ register/
│  │  ├─ forgot-password/
│  │  └─ reset-password/
│  ├─ components/
│  ├─ lib/
│  └─ globals.css
│
└─ README.md
```

---

## 🚀 Getting Started

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bedrock_chat
JWT_SECRET=your_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=arn:aws:bedrock:...
FRONTEND_BASE_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=example@gmail.com
SMTP_PASS=your_password
MAIL_FROM=example@gmail.com
```

Run backend:

```bash
uvicorn app.main:app --reload --port 8000
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔁 Streaming Flow (SSE)

1. User sends message from frontend
2. FastAPI opens streaming response
3. Amazon Bedrock streams Claude tokens
4. Tokens are forwarded to frontend in real‑time
5. Full assistant message is saved to database

---

## 🔐 Security Notes

* Passwords are **never stored in plain text**
* JWT is required for all chat endpoints
* Forgot‑password endpoint prevents user enumeration
* Tokens have expiration time

---

## 📌 Future Improvements

* Chat export (Markdown / PDF)
* Rate limiting
* User profile settings
* System prompts per conversation
* RAG (document‑based chat)

---

## 📜 License

This project is for **educational and portfolio purposes**.

---

## 👤 Author

**Pathipat Mattra**
AI & Full‑Stack Developer

---

If you have any questions or want to extend this project, feel free to fork and experiment 🚀
