# 06 - Architecture V2 (Production Refactor Plan)

> **Target:** Fullstack Next.js + MongoDB job-ready project for service-based companies (TCS/Infy/Wipro/Accenture).
> **Locked on:** 2026-05-21

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js App (React + TS + Tailwind + shadcn/ui)         │   │
│  │  ├─ Server Components (data fetching, SEO)                │   │
│  │  ├─ Client Components (interactivity, Monaco)             │   │
│  │  ├─ Zustand (global UI state)                             │   │
│  │  └─ TanStack Query (server state cache)                   │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTPS (JWT in HttpOnly cookie)
┌────────────────────────▼────────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  middleware.ts  →  Auth check, rate limit, CORS, logging  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Route Handlers (app/api/*)  →  thin, calls controller   │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Controllers (business logic)                             │   │
│  │  ├─ AuthController, UserController                        │   │
│  │  ├─ LearningController, ContestController                 │   │
│  │  └─ InterviewController, PaymentController                │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Services (external integrations)                         │   │
│  │  ├─ GeminiService (AI)      ├─ Judge0Service (code)       │   │
│  │  ├─ RedisService (cache)    └─ EmailService               │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Models (Mongoose schemas)                                │   │
│  │  User, Progress, Contest, Submission, Interview, Payment  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────────────┐
│ MongoDB Atlas│  │ Upstash     │  │ Gemini API  │  │ Judge0 API  │
│ (primary DB) │  │ Redis       │  │ (Google AI) │  │ (RapidAPI)  │
│              │  │ (cache+rate)│  │             │  │             │
└──────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### Interview Line
> "Sir, maine layered architecture follow kiya — middleware → routes → controllers → services → models. Har layer ka single responsibility hai. External integrations services me isolate kiye taki swap karna easy ho. Spring Boot / Express ke pattern jaisa hi hai, bas Next.js me."

---

## 2. Request Flow (Example: User Submits Code)

```
1. User clicks "Submit"  [CodingChallenge.tsx]
        ▼
2. TanStack Query mutation → POST /api/code/submit
   Body: { problemId, code, language }
        ▼
3. middleware.ts
   ├─ Extract JWT from HttpOnly cookie
   ├─ Verify token → attach user to req
   ├─ Rate limit check (Redis: 10 req/min per user)
   └─ Log request
        ▼
4. app/api/code/submit/route.ts (Route Handler)
   ├─ Parse body
   ├─ Validate via Zod schema
   └─ Call CodeController.submit(user, dto)
        ▼
5. CodeController.submit()
   ├─ Fetch problem from DB
   ├─ Call Judge0Service.execute(code, testCases)
   ├─ Calculate score (server-side, no client trust!)
   ├─ Save Submission to MongoDB
   ├─ Update User XP/streak via UserService
   └─ Return result DTO
        ▼
6. Response → client → UI updates
```

### Kya / Kahan / Kyun / Interview Angle

| Layer | Kya | Kahan | Kyun | Interview Angle |
|---|---|---|---|---|
| middleware | Auth + rate limit | `middleware.ts` root | Centralized cross-cutting concerns | "Middleware pattern — Express jaisa, har request pe pehle ye chalega" |
| Route Handler | HTTP plumbing | `app/api/*/route.ts` | Thin layer, easy to test | "Routes ko patla rakha, business logic controllers me" |
| Validator | Input check | `src/validators/` | Type-safe input, no garbage in DB | "Zod schema runtime validate karta — TS sirf compile-time check karta" |
| Controller | Business logic | `src/controllers/` | Reusable across REST/GraphQL/CLI | "Controller orchestrate karta — DB call + service call + response banata" |
| Service | External calls | `src/services/` | Mockable in tests, swap-able vendor | "Gemini hata ke OpenAI laga sakta — sirf service file change hogi" |
| Model | DB schema | `src/models/` | Mongoose enforce structure | "Mongoose schema validation + indexes + middleware hooks de deta" |

---

## 3. Complete Folder Structure

```
stax-ai-tutor/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint + test on PR
│       └── deploy.yml                # auto-deploy main
│
├── .vscode/
│   └── settings.json
│
├── app/                              # Next.js routes ONLY
│   ├── (auth)/                       # route group — no URL prefix
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx                # centered auth layout
│   │
│   ├── (dashboard)/                  # protected routes
│   │   ├── learn/
│   │   │   └── [subjectId]/
│   │   │       └── [unitId]/
│   │   │           └── [subtopicId]/
│   │   │               └── [phase]/page.tsx
│   │   ├── contests/
│   │   ├── interviews/
│   │   ├── profile/
│   │   └── layout.tsx                # sidebar + navbar
│   │
│   ├── (marketing)/                  # public landing
│   │   ├── page.tsx                  # home
│   │   ├── pricing/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── api/                          # backend
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── logout/route.ts
│   │   ├── users/
│   │   │   ├── me/route.ts
│   │   │   └── progress/route.ts
│   │   ├── learn/
│   │   │   ├── theory/route.ts
│   │   │   ├── mcq/route.ts
│   │   │   └── assignment/route.ts
│   │   ├── code/
│   │   │   ├── execute/route.ts
│   │   │   └── submit/route.ts
│   │   ├── sql/execute/route.ts
│   │   ├── contests/
│   │   ├── interviews/
│   │   └── payments/
│   │
│   ├── layout.tsx                    # root layout
│   ├── error.tsx                     # global error boundary
│   ├── not-found.tsx
│   └── globals.css
│
├── src/                              # all backend + business logic
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── learning.controller.ts
│   │   ├── code.controller.ts
│   │   ├── contest.controller.ts
│   │   ├── interview.controller.ts
│   │   └── payment.controller.ts
│   │
│   ├── services/
│   │   ├── gemini.service.ts
│   │   ├── judge0.service.ts
│   │   ├── sqlite.service.ts
│   │   ├── redis.service.ts
│   │   ├── email.service.ts
│   │   └── payu.service.ts
│   │
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Progress.model.ts
│   │   ├── Subject.model.ts
│   │   ├── Submission.model.ts
│   │   ├── Contest.model.ts
│   │   ├── ContestParticipation.model.ts
│   │   ├── InterviewSession.model.ts
│   │   ├── Subscription.model.ts
│   │   └── index.ts                  # barrel export
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── code.validator.ts
│   │   ├── contest.validator.ts
│   │   └── common.validator.ts
│   │
│   ├── lib/
│   │   ├── db.ts                     # Mongo connection (cached)
│   │   ├── jwt.ts                    # sign/verify helpers
│   │   ├── bcrypt.ts                 # hash/compare
│   │   ├── logger.ts                 # Pino instance
│   │   ├── errors.ts                 # AppError, ValidationError
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── api.types.ts
│   │   └── next-auth.d.ts            # session augmentation
│   │
│   └── utils/
│       ├── apiResponse.ts            # standard response shape
│       ├── slugify.ts
│       └── dateFormat.ts
│
├── components/                       # React UI only
│   ├── ui/                           # shadcn primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── toast.tsx
│   │
│   ├── features/                     # feature components
│   │   ├── learning/
│   │   │   ├── JourneyMap.tsx
│   │   │   ├── GamifiedJourney.tsx
│   │   │   ├── ConceptLearning.tsx
│   │   │   ├── MCQGate.tsx
│   │   │   └── PersonalizedAssignment.tsx
│   │   ├── coding/
│   │   │   ├── CodingChallenge.tsx
│   │   │   ├── FrontendEditor.tsx
│   │   │   ├── FrontendPreview.tsx
│   │   │   └── SQLChallenge.tsx
│   │   ├── contest/
│   │   ├── interview/
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   │
│   ├── layouts/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   │
│   └── providers/
│       ├── ThemeProvider.tsx
│       ├── QueryProvider.tsx
│       └── AuthProvider.tsx
│
├── hooks/                            # React hooks
│   ├── useAuth.ts
│   ├── useProgress.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
├── store/                            # Zustand stores
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── learning.store.ts
│
├── content/                          # static learning content
│   ├── subjects.ts                   # moved from lib/
│   ├── theory/
│   ├── mcq/
│   └── coding-problems/
│
├── tests/
│   ├── unit/
│   │   └── controllers/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── learning-flow.spec.ts
│
├── public/
│   ├── images/
│   └── favicon.ico
│
├── docs/                             # keep existing + new
│   ├── 00-START-HERE.md
│   ├── 01-ARCHITECTURE.md            # old (v1)
│   ├── 06-ARCHITECTURE-V2.md         # this file
│   ├── INTERVIEW-PREP.md             # full Q&A bank (todo)
│   ├── API-REFERENCE.md              # Postman-style (todo)
│   └── diagrams/
│
├── .env.example
├── .env.local                        # gitignored
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── middleware.ts                     # Next.js root middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Folder-by-Folder Reasoning

### `app/`
- **Kya:** Next.js App Router routes only. No business logic.
- **Kyun:** Separation — UI routing alag, logic alag. Next.js convention.
- **Interview:** "App Router 13+ ka latest pattern hai — Server Components by default, file-based routing, route groups for layout sharing."

### `app/(auth)`, `app/(dashboard)`, `app/(marketing)`
- **Kya:** Route groups — parentheses ke kaaran URL me nahi aate.
- **Kyun:** Same prefix wale routes ek layout share kare without URL nesting.
- **Interview:** "Maine route groups use kiye — auth pages ka layout alag, dashboard ka alag, marketing ka alag. URL clean rahta — `/login` not `/(auth)/login`."

### `app/api/`
- **Kya:** Thin HTTP layer.
- **Kyun:** Route handler sirf request parse kare aur controller call kare — testable.
- **Interview:** "Route handlers ko thin rakha — Single Responsibility. Business logic controllers me, taki future me REST se GraphQL pe migrate karna ho to sirf route layer badle."

### `src/controllers/`
- **Kya:** Business logic per feature.
- **Kyun:** Spring Boot / Express MVC pattern. Reusable.
- **Interview:** "Controller pattern follow kiya — har feature ka ek controller. Inside controller, validation → service call → DB op → response transform."

### `src/services/`
- **Kya:** External API wrappers (Gemini, Judge0, Redis).
- **Kyun:** Vendor lock-in se bachne ke liye. Mockable for tests.
- **Interview:** "Services layer external dependencies isolate karta. Agar kal Gemini se OpenAI me shift karna ho — sirf `gemini.service.ts` change. Controllers untouched."

### `src/models/`
- **Kya:** Mongoose schemas + methods.
- **Kyun:** DB schema single place. Indexes, validation, hooks centralized.
- **Interview:** "Mongoose schemas me validation, indexes, pre/post hooks define kiye. Schema-level validation = data integrity guarantee."

### `src/middleware/`
- **Kya:** Cross-cutting concerns (auth, rate limit, error).
- **Kyun:** DRY — har route me copy-paste nahi.
- **Interview:** "Middleware chain pattern — auth check, rate limit check, logging — sab automatically har protected request pe chalta."

### `src/validators/`
- **Kya:** Zod schemas for input validation.
- **Kyun:** Runtime safety. TS sirf compile time, runtime me garbage aa sakta.
- **Interview:** "Zod schemas use kiye — type inference TS se aata aur runtime validation bhi same schema deti. Single source of truth."

### `src/lib/`
- **Kya:** Low-level utilities (DB connect, JWT helpers, logger).
- **Kyun:** Reusable atomic helpers.
- **Interview:** "Lib me singleton patterns — DB connection cached hota Next.js serverless me cold start avoid karne ko."

### `components/ui/`
- **Kya:** Primitive components (Button, Input, Card) via shadcn.
- **Kyun:** Design system foundation.
- **Interview:** "shadcn/ui use kiya — Radix UI accessibility primitives + Tailwind. Components copy hote, install nahi, full ownership rehta."

### `components/features/`
- **Kya:** Feature-specific composite components.
- **Kyun:** Domain organization, not random flat folder.
- **Interview:** "Components ko feature-wise organize kiya — learning/, coding/, contest/. Scale karne pe ye structure clean rehta."

### `hooks/`
- **Kya:** Reusable React hooks.
- **Kyun:** Logic reuse across components.
- **Interview:** "Custom hooks me business logic — components purely presentational rahte."

### `store/`
- **Kya:** Zustand global state.
- **Kyun:** UI state (theme, sidebar, modal) without prop drilling.
- **Interview:** "Zustand chose over Redux — boilerplate kam, hooks-native API, Angular ke NgRx jaisa structure but simpler."

### `content/`
- **Kya:** Static learning data (subjects, theory).
- **Kyun:** Code se data alag. Editors update kar sake.
- **Interview:** "Content layer alag rakha — future me CMS (Sanity/Strapi) integrate karna asaan."

### `middleware.ts` (root)
- **Kya:** Next.js Edge middleware.
- **Kyun:** Runs before route — auth, geo, A/B, redirects.
- **Interview:** "Next.js middleware Edge runtime pe chalta — fast cold start. Yahan auth check + locale detection + rate limit pre-route."

---

## 5. Tech Stack Final

| Layer | Tech | Interview Keyword |
|---|---|---|
| Frontend | Next.js 14 App Router, React 18, TS | "Server Components, RSC, App Router" |
| Styling | Tailwind + shadcn/ui + Framer Motion | "Component library, design system" |
| State | Zustand + TanStack Query | "Global state, server state management" |
| Backend | Next.js Route Handlers + Server Actions | "API routes, Server Actions, edge-ready" |
| DB | MongoDB Atlas + Mongoose | "NoSQL, schema design, aggregation pipeline" |
| Auth | NextAuth.js (JWT + bcrypt) | "JWT-based authentication, hashed passwords" |
| Validation | Zod | "Type-safe runtime validation" |
| Code Exec | Judge0 | "Sandboxed code execution" |
| AI | Gemini API + streaming | "Generative AI, LLM integration" |
| Cache/Rate | Upstash Redis | "Redis caching, rate limiting" |
| Deploy | Vercel + MongoDB Atlas | "Cloud deployment, serverless" |
| CI | GitHub Actions | "CI/CD pipeline" |
| Container | Docker | "Containerization" |
| Logging | Pino | "Structured logging" |
| Tests | Jest + Playwright | "Unit + E2E testing" |

20+ resume keywords. Service-based ATS friendly.

---

## 6. MongoDB Schema Design (Preview)

```
User
 ├─ _id, email, passwordHash, name, avatar
 ├─ role: 'student' | 'admin'
 ├─ subscription: { plan, expiresAt }
 ├─ stats: { xp, streak, rank, totalSolved }
 └─ timestamps

Progress (one per user-subtopic)
 ├─ userId (ref), subjectId, unitId, subtopicId
 ├─ phasesCompleted: ['theory', 'mcq', 'basic']
 ├─ mcqScore, codingScore
 ├─ attempts, lastAttemptAt
 └─ INDEX: { userId, subjectId } compound

Submission
 ├─ userId, problemId, contestId (optional)
 ├─ code, language, status
 ├─ score (server-calculated, never trust client)
 ├─ testResults: [{ passed, runtime, memory }]
 └─ timestamps

Contest
 ├─ title, description, domain
 ├─ problemIds, startAt, endAt
 ├─ participants: [{ userId, score, rank }]
 └─ INDEX: { startAt }, { endAt }

InterviewSession
 ├─ userId, type ('frontend'|'backend'|'ml')
 ├─ messages: [{ role, content, timestamp }]
 ├─ score, feedback
 ├─ status ('active'|'completed')
 └─ INDEX: { userId, status }
```

### Interview Angle
> "MongoDB document-oriented hai — Progress me nested phases array store karna SQL me 5 tables banane se simple. Aggregation pipeline use ki leaderboard ke liye — `$match → $group → $sort → $limit`. Indexes compound kiye frequent query paths pe — `userId + subjectId` saath query hote."

---

## 7. Migration Strategy (Old → New)

| Old | New | Action |
|---|---|---|
| `components/*.tsx` (flat) | `components/features/*/` | Move + categorize |
| `lib/database/*.ts` (Supabase) | `src/models/` + `src/controllers/` | Rewrite with Mongoose |
| `lib/subjects.ts` | `content/subjects.ts` | Move |
| `lib/gemini.ts` | `src/services/gemini.service.ts` | Refactor + add streaming |
| `lib/judge0.ts` | `src/services/judge0.service.ts` | Refactor |
| `app/api/*/route.ts` (thick) | thin route + controller | Split |
| No auth | NextAuth + JWT | Build new |
| No middleware | `middleware.ts` + `src/middleware/` | Build new |
| No validators | `src/validators/` (Zod) | Build new |
| No tests | `tests/` | Build new |

---

## 8. Strategic Roadmap (4 Stages)

### Stage 1: Foundation Reset
- MongoDB migration (drop Supabase, add Mongoose)
- Real Auth (NextAuth.js Credentials + Google, JWT + bcrypt)
- Folder restructure (MVC-style)
- Zod validation everywhere
- Centralized error handler + custom AppError
- `.env.example` + README v1

### Stage 2: Core Features Hardening
- JWT middleware for protected routes
- Server-side contest grading (no client-trust)
- Rate limit (Upstash Redis) — Gemini/Judge0 protect
- Progress sync — Mongo source of truth
- Real profile stats — aggregate from DB
- Schema fix — no more drift

### Stage 3: Polish & Showcase
- UI redesign — dashboard, animations, mobile responsive
- Loading skeletons + error boundaries
- AI streaming (theory + interview responses)
- Dark/light theme toggle
- Landing page redesign
- Deploy Vercel + MongoDB Atlas

### Stage 4: Interview Armor
- Tests (Jest unit + Playwright E2E)
- Docker + docker-compose
- GitHub Actions CI
- README rewrite + architecture diagram
- Interview prep doc
- Resume bullets + LinkedIn description

---

## 9. Mega Interview Question (Practice Daily)

**Q: "Apne project ka architecture explain karo."**

### Ideal 2-min Answer

> "Sir, mera project Next.js 14 ka fullstack application hai with App Router. Maine layered architecture follow kiya hai — 4 main layers:
>
> **Pehla layer — Presentation:** App Router pages, jo Server Components by default hai. Reusable UI components shadcn/ui se. State management ke liye Zustand global state ko, TanStack Query server state ko handle karta.
>
> **Doosra layer — API:** `app/api` me thin route handlers. Inka kaam sirf HTTP parse karna aur controller ko call karna.
>
> **Teesra layer — Business:** `src/controllers` me actual logic. `src/services` me external integrations — Gemini AI, Judge0 code execution, Redis cache, MongoDB. Ye separation ki wajah se kal vendor change karna ho to sirf service file edit hogi.
>
> **Chautha layer — Data:** MongoDB Atlas with Mongoose ODM. Schemas validation, indexing, middleware hooks sab schema level pe.
>
> **Cross-cutting:** Authentication NextAuth.js se with JWT + bcrypt. Rate limiting Upstash Redis se. Validation Zod se. Logging Pino se structured JSON logs. Deployment Vercel pe with MongoDB Atlas, CI/CD GitHub Actions."

---

## 10. Status

- [x] Architecture locked (2026-05-21)
- [ ] Folder scaffolding
- [ ] Dependencies install
- [ ] MongoDB connection setup
- [ ] Auth (NextAuth) setup
- [ ] Models created
- [ ] Controllers + Services created
- [ ] API routes refactored
- [ ] Frontend feature folders reorganized
- [ ] Tests
- [ ] Docker + CI
- [ ] Deploy
- [ ] Resume + Interview doc
