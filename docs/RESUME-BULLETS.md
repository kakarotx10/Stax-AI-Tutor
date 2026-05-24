# Resume Bullets & LinkedIn Copy — Shivam

> Service-based company optimized (TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini).

---

## Project Header (Resume)

**Stax AI Tutor — AI-Powered Gamified Learning Platform**
Personal Project | 2026 | [GitHub](https://github.com/...) | [Live Demo](https://stax-tutor.vercel.app)

---

## Top 4 Bullets (Recommended for Resume)

- Built a full-stack **AI-powered learning platform** using **Next.js 14 App Router, TypeScript, MongoDB, and Google Gemini AI**, supporting 50+ learning subtopics across DSA, Frontend, Backend, AI/ML, and Interview prep.
- Implemented **secure authentication** with **NextAuth.js, JWT, and bcrypt** (12-round hashing), **role-based middleware** for protected routes, and **Upstash Redis sliding-window rate limiting** to prevent API abuse on AI and code execution endpoints.
- Designed a **layered backend architecture** with controllers, services, Mongoose models, and Zod validators; integrated **Judge0** for sandboxed multi-language code execution with **server-side grading** and immutable submission audit trail.
- Built **real-time AI interview simulator** with persistent session state in MongoDB, integrated **Pino structured logging**, **TanStack Query** for server-state caching, **Docker** containerization, and **GitHub Actions CI/CD** pipeline.

---

## Alternative Bullet Sets

### Backend-Heavy
- Architected RESTful API using **Next.js Route Handlers + custom controller/service layer**, applying **MVC patterns** with Zod-based input validation and centralized error handling via `AppError` class hierarchy mapped to HTTP status codes.
- Designed **MongoDB schemas with Mongoose ODM** — compound indexes, pre-save hooks, virtuals, and aggregation pipelines for leaderboard, dashboard analytics, and user progress queries.
- Implemented **JWT-based authentication** flow with HttpOnly + SameSite cookies (XSS/CSRF safe), session callbacks for role propagation, and edge middleware for route protection.
- Built **Upstash Redis sliding-window rate limiter** with per-endpoint key strategies (userId or IP) to protect AI APIs costing real money.

### Frontend-Heavy
- Built responsive UI using **Next.js 14 App Router** with **React Server Components** for SEO-critical pages and **Client Components** for interactive flows (Monaco editor, MCQ quiz, AI chat).
- Implemented design system with **shadcn/ui-style primitives, Tailwind CSS, and Framer Motion animations**; route groups for marketing, auth, and dashboard layouts.
- Integrated **TanStack Query** for server-state with smart caching, retries, and **Zustand** for lightweight global UI state.
- Built **Monaco-based code editor**, **iframe-sandboxed frontend preview**, and **SQL playground** with in-memory SQLite execution.

### AI / Integration-Heavy
- Integrated **Google Gemini API** for AI-generated theory, MCQs, coding problems, hints, and re-teaching content; wrapped in a **service layer with structured error handling, latency tracking, and Pino logging**.
- Designed **AI interview engine** with stateful session persistence in MongoDB, supporting follow-up questions, cross-questioning, and code feedback over multi-turn conversations.
- Implemented **Judge0 code execution service** with exponential-backoff retries, base64 encoding, multi-language support (Python/C++/Java), and structured error normalization.

---

## LinkedIn Project Section

**Title:** Stax AI Tutor — Fullstack AI Learning Platform

**Description:**
> Built and maintained a production-quality, fullstack AI-powered learning platform helping students prepare for placements, coding interviews, and developer roles.
>
> **Tech:** Next.js 14 (App Router, RSC), TypeScript, MongoDB Atlas, Mongoose, Google Gemini, Judge0, NextAuth.js, Upstash Redis, Tailwind CSS, Framer Motion, Monaco Editor, Docker, GitHub Actions.
>
> **Key contributions:**
> ✅ Architected layered backend — controllers, services, models, middleware (MVC-style separation)
> ✅ Implemented secure auth — JWT + bcrypt + HttpOnly cookies + edge middleware
> ✅ Designed MongoDB schemas with compound indexes + aggregation pipelines
> ✅ Built AI service layer wrapping Gemini with error handling, retries, structured logging
> ✅ Implemented server-side code grading (Judge0) with immutable submission audit
> ✅ Stateful AI interview sessions persisted in Mongo
> ✅ Production setup — Docker multi-stage build, GitHub Actions CI, env management
>
> **Link:** github.com/... | Live: stax-tutor.vercel.app

---

## GitHub README Headline Copy

> ### 🎯 Stax AI Tutor — Gamified AI Learning Platform
>
> A production-quality fullstack Next.js 14 application for CS placement preparation. Features AI-generated content (Gemini), sandboxed code execution (Judge0), gamified learning journeys, contests, and an AI-powered interview simulator.
>
> Built to demonstrate: clean architecture, secure auth, MongoDB schema design, AI integration patterns, observability, and modern DevOps.

---

## ATS Keywords (paste into header/skills section)

**Languages:** TypeScript, JavaScript, HTML, CSS, SQL, Python
**Frontend:** Next.js 14, React 18, App Router, Server Components, Tailwind CSS, Framer Motion, Monaco Editor, Radix UI, shadcn/ui
**Backend:** Node.js, Next.js Route Handlers, Express patterns, REST API, JWT, NextAuth.js, Zod validation
**Database:** MongoDB, Mongoose ODM, aggregation pipelines, indexing, SQL, SQLite
**State Management:** TanStack Query, Zustand, React Context
**AI:** Google Gemini API, prompt engineering, AI service abstraction, streaming responses
**DevOps:** Docker, docker-compose, GitHub Actions, CI/CD, Vercel, MongoDB Atlas, Upstash Redis
**Security:** bcrypt, JWT, HttpOnly cookies, CSRF, rate limiting, OWASP, sanitization
**Tooling:** Git, GitHub, ESLint, Prettier, Jest, ts-jest, Pino logging

---

## What NOT to Claim

- ❌ "Production-grade SaaS deployed to thousands of users" (kept hobby scale)
- ❌ "Built fully automated grading for all challenge types" (frontend challenges still weak)
- ❌ "Real-time multiplayer competition" (no websockets)
- ❌ "Implemented from scratch" — say "built and integrated"
- ❌ "Reduced X by Y%" without honest metric

---

## Honest Closing Line for HR

> "Sir, ye project mera fullstack stack mastery ka proof hai. End-to-end ownership — architecture, auth, DB, AI integration, deployment. MVP-quality but production-pattern. Aapko har layer line-by-line samjha sakta hu."
