# 💰 Collaborative Finance App

A full-stack finance app built with React + Supabase + Groq AI.

## 🚀 Features
- User auth (Supabase)
- Manual / CSV / OCR transactions
- Categories & budgets
- Groups & shared accounts
- Private receipts storage
- AI Budget Advisor (Groq `gemma-2-9b-instruct`)

---

## 🔧 Setup

### 1. Clone & install
```bash
git clone <repo_url>
cd finance-app
pnpm install

### 2. Configure environment

Copy .env.example → .env.local and set:
SUPABASE_URL="..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

GROQUE_API_KEY="..."
GROQUE_MODEL="gemma-2-9b-instruct"

AI_ADVISOR_PROMPT="(provided system prompt)"

### 3. Database & Storage

Supabase migrations auto-run on deploy.
Storage bucket receipts + RLS policies already applied.

### 4. Run locally
pnpm dev

### 5. Deploy

Frontend: Vercel/Netlify
Backend: Supabase Edge Functions (auto-deployed)

### 5. Deploy

Frontend: Vercel/Netlify
Backend: Supabase Edge Functions (auto-deployed)

🧪 Tests

Tests are included and run in the AI Agent’s VM before delivery.
You can re-run:
pnpm test

### Sample Data

Located in /tests/data/:
receipts/ → example images for OCR.
csv/ → bank statements for CSV import.
seed/ → optional JSON/SQL seed transactions.
