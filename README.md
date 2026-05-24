# Stax AI Tutor

> Gamified, AI-powered learning platform for CS placement, coding interview, and full-stack interview prep.

Built with **Next.js 14 (App Router)**, **TypeScript**, **MongoDB**, **Google Gemini AI**, **Judge0**, **NextAuth.js**, **Upstash Redis**, and **Tailwind CSS**.

---

## Live Demo

🚀 https://stax-tutor.vercel.app *(deploy your own from this repo)*

## Screenshots

*(Add screenshots of: landing, learning journey, code editor, AI interviewer, dashboard)*

---

## Features

| Module | What it does |
|---|---|
| **Gamified Journeys** | Pick a domain (DSA, Frontend, Backend, AI/ML, Interview) → unit → subtopic → phase |
| **Theory + MCQ** | AI-generated explanations + quiz gates with 70% pass threshold |
| **Code Challenges** | Monaco editor, multi-language (Python, C++, Java), sandboxed Judge0 execution, server-side grading |
| **SQL Practice** | In-memory SQLite, query execution, safety-checked SELECT-only |
| **Frontend Challenges** | HTML/CSS/JS/React with live iframe preview |
| **AI Interview Simulator** | Multi-turn AI interviewer with persistent session state |
| **Contests** | Time-bound coding events with server-graded leaderboards |
| **Auth** | NextAuth.js with Credentials + Google OAuth, JWT + bcrypt, HttpOnly cookies |

---

## Architecture

```
Browser
  → Next.js App Router (React Server + Client Components)
  → Edge middleware (auth, rate-limit, redirect)
  → API Route Handlers (thin)
  → Controllers (business logic)
  → Services (Gemini, Judge0, Redis)
  → Mongoose Models → MongoDB Atlas
```

**Detailed architecture:** [docs/06-ARCHITECTURE-V2.md](docs/06-ARCHITECTURE-V2.md)

---

## Folder Structure

```
app/                  Next.js routes (App Router)
  (auth)/             login, signup, layout
  (dashboard)/        protected routes
  api/                Route handlers (thin)

src/                  Backend + business logic
  controllers/        Business logic per feature
  services/           External integrations (Gemini, Judge0)
  models/             Mongoose schemas + indexes
  middleware/         Auth, rate-limit, error helpers
  validators/         Zod schemas
  lib/                db, jwt, bcrypt, logger, errors, constants
  utils/              Standard API response shape

components/
  ui/                 Reusable primitives (Button, Input, Card)
  features/           Feature components (learning, coding, ...)
  layouts/            Navbar, Sidebar
  providers/          Auth, Query, Theme

hooks/                Custom React hooks
store/                Zustand global state
content/              Static learning content (subjects, theory, MCQs)
tests/                Jest unit + integration
docs/                 Architecture, interview prep, API reference
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Monaco Editor |
| State | Zustand, TanStack Query |
| Backend | Next.js Route Handlers, Zod validation, custom AppError hierarchy |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | NextAuth.js, JWT, bcryptjs (12 rounds), HttpOnly cookies |
| AI | Google Gemini API |
| Code Execution | Judge0 (RapidAPI), SQLite in-memory |
| Cache + Rate Limit | Upstash Redis, sliding-window algorithm |
| Logging | Pino (structured JSON) |
| Payments | PayU (hash-based checkout) |
| Testing | Jest, ts-jest |
| DevOps | Docker (multi-stage), docker-compose, GitHub Actions CI |
| Deploy | Vercel, MongoDB Atlas, Upstash |

---

## Quick Start

### Prereqs
- Node.js 20+
- MongoDB (local or Atlas)
- Optional: Upstash Redis, Gemini API key, Judge0 RapidAPI key

### Setup

```bash
git clone https://github.com/your-username/stax-ai-tutor.git
cd stax-ai-tutor
npm install
cp .env.example .env.local
# Edit .env.local with your secrets
npm run dev
```

Visit http://localhost:3000

### Required env vars

See [.env.example](.env.example). Minimum to run:
- `MONGODB_URI`
- `NEXTAUTH_SECRET` (32+ chars)
- `JWT_SECRET` (32+ chars)
- `GEMINI_API_KEY` (for AI features)

### Docker (full stack)

```bash
docker compose up -d
```
Spins up app + MongoDB + Redis locally.

---

## Scripts

```bash
npm run dev         # Next.js dev server
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Jest unit tests
```

---

## Security

- **Auth:** JWT signed, HttpOnly + SameSite cookies (XSS + CSRF safe)
- **Passwords:** bcryptjs 12 rounds, never logged/returned in API
- **Validation:** Zod on every API input
- **Rate limit:** Upstash Redis sliding-window per endpoint type
- **CORS:** Same-origin only by default
- **Error responses:** No stack traces leaked in production

---

## Documentation

| Doc | Purpose |
|---|---|
| [00-START-HERE](docs/00-START-HERE.md) | Project overview (ELI10) |
| [01-ARCHITECTURE](docs/01-ARCHITECTURE.md) | Original architecture (v1) |
| [02-IMPORTANT-FLOWS](docs/02-IMPORTANT-FLOWS.md) | User + code flows |
| [03-INTERVIEW-GUIDE](docs/03-INTERVIEW-GUIDE.md) | Interview answers |
| [04-RESUME-GUIDE](docs/04-RESUME-GUIDE.md) | Resume bullets v1 |
| [05-RED-FLAGS-AND-IMPROVEMENTS](docs/05-RED-FLAGS-AND-IMPROVEMENTS.md) | What needs hardening |
| [06-ARCHITECTURE-V2](docs/06-ARCHITECTURE-V2.md) | Refactored architecture |
| [07-CLEANUP-PLAN](docs/07-CLEANUP-PLAN.md) | Migration plan |
| [INTERVIEW-PREP](docs/INTERVIEW-PREP.md) | Full interview Q&A bank |
| [API-REFERENCE](docs/API-REFERENCE.md) | Endpoints reference |
| [RESUME-BULLETS](docs/RESUME-BULLETS.md) | Resume copy + LinkedIn |

---

## Project Status

🟢 **MVP-complete with production patterns.**

✅ Done:
- Layered architecture (controllers/services/models)
- MongoDB swap from Supabase
- JWT auth + bcrypt + rate limit
- Server-side code grading
- Stateful AI interviews (Mongo-persisted)
- Docker + CI
- Tests
- Full docs

🟡 In progress:
- shadcn/ui full migration
- Component reorganization to features/
- E2E Playwright tests
- AI response streaming
- Semantic cache for Gemini calls

🔴 Future:
- Real-time multiplayer (Socket.io)
- Payment verification (PayU webhook)
- Email verification flow
- Admin panel
- Analytics dashboard

---

## Author

**Shivam Sharma**
Angular dev transitioning to Next.js + MongoDB fullstack.

📧 sakshamsharma.sam19@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/your-handle)
🐙 [GitHub](https://github.com/your-handle)

---

## License

MIT
