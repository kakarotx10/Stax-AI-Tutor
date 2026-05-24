# 07 - Cleanup & Migration Plan

> **Owner:** Shivam
> **Date locked:** 2026-05-21
> **Scope:** Convert current Supabase-based MVP into MongoDB-based production-quality fullstack project.

---

## 1. Current State Snapshot

### Root level files
```
README.md (20KB old)         → rewrite v2
SETUP.md                     → delete (merge into README)
IMPLEMENTATION_SUMMARY.md    → delete (stale)
package.json                 → update deps
tsconfig.json                → add path aliases
next.config.js               → keep
tailwind.config.ts           → keep
postcss.config.js            → keep
next-env.d.ts                → keep (auto-gen)
```

### Folders
```
app/         → routes (refactor api/)
components/  → flat 15 files (reorganize → features/)
lib/         → mixed bag (split into content/, src/services/, src/utils/)
lib/database/→ Supabase wrappers (full rewrite → src/controllers/ + Mongoose)
supabase/    → schema.sql (DELETE)
scripts/     → 1 generator file (keep)
types/       → 1 declaration (move to src/types/)
docs/        → keep, add new docs
```

### Dependencies already installed (good news!)
- `mongoose` ✅
- `bcryptjs` + `@types/bcryptjs` ✅
- `jsonwebtoken` + `@types/jsonwebtoken` ✅
- `zod` ✅
- `redis` ✅
- `@google/generative-ai` ✅
- `@monaco-editor/react` ✅
- `sqlite3` ✅
- `framer-motion`, `lucide-react`, `tailwind-merge`, `clsx` ✅

### Dependencies to remove
- `@supabase/supabase-js` (Mongo swap)
- `pg` (Postgres driver no longer needed)

### Dependencies to install
- `next-auth` (auth)
- `@auth/mongodb-adapter` (NextAuth + Mongo)
- `pino` + `pino-pretty` (logging)
- `@upstash/redis` + `@upstash/ratelimit` (serverless rate limit)
- `@tanstack/react-query` (server state)
- `zustand` (global state)
- shadcn/ui CLI components (button, input, card, dialog, toast)
- `jest`, `@testing-library/react`, `@testing-library/jest-dom` (unit tests)
- `playwright` (E2E)

---

## 2. DELETE List

| File/Folder | Kyun delete | Risk |
|---|---|---|
| `supabase/schema.sql` | Mongo swap | 🟢 |
| `lib/supabase.ts` | Mongo swap | 🟢 (replaced by `src/lib/db.ts`) |
| `lib/database/*` (all) | Rewrite as controllers + models | 🔴 |
| `IMPLEMENTATION_SUMMARY.md` | Stale 9KB doc | 🟢 |
| `SETUP.md` | Merge into README v2 | 🟢 |
| `app/api/database/*` | Direct DB hits, refactor needed | 🔴 |
| `app/api/seed/*` | Move to `scripts/seed/` | 🟢 |
| `lib/types.ts` | Move to `src/types/` | 🟢 |
| `package.json` deps: `pg`, `@supabase/supabase-js` | Mongo swap | 🟢 |

**Delete strategy:** Only delete AFTER replacement exists. Never leave broken state mid-migration.

---

## 3. MOVE List (relocate, no logic change)

### Static content → `content/`
| From | To |
|---|---|
| `lib/subjects.ts` | `content/subjects.ts` |
| `lib/theoryDatabase.ts` | `content/theory.ts` |
| `lib/mcqDatabase.ts` | `content/mcq.ts` |
| `lib/codingProblemDatabase.ts` | `content/codingProblems.ts` |
| `lib/sqlDatabase.ts` | `content/sql.ts` |
| `lib/frontendBackendQuestions.ts` | `content/frontendBackend.ts` |
| `lib/contestProblems.ts` | `content/contestProblems.ts` |
| `lib/badges.ts` | `content/badges.ts` |
| `lib/pricing.ts` | `content/pricing.ts` |
| `lib/interviewQuestionnaire.ts` | `content/interviewQuestionnaire.ts` |

### External integrations → `src/services/`
| From | To |
|---|---|
| `lib/gemini.ts` | `src/services/gemini.service.ts` |
| `lib/judge0.ts` | `src/services/judge0.service.ts` |
| `lib/huggingface.ts` | `src/services/huggingface.service.ts` |
| `lib/interviewEngine.ts` | `src/services/interviewEngine.service.ts` |
| `lib/interviewAIHelper.ts` | `src/services/interviewAI.service.ts` |

### Utils / types / hooks
| From | To |
|---|---|
| `lib/utils.ts` | `src/utils/index.ts` |
| `lib/types/*` | `src/types/*` |
| `lib/types.ts` | `src/types/legacy.types.ts` |
| `lib/hooks/useDatabase.ts` | `hooks/useDatabase.ts` |
| `types/canvas-confetti.d.ts` | `src/types/canvas-confetti.d.ts` |

### Components reorganization
| From | To |
|---|---|
| `components/Navigation.tsx` | `components/layouts/Navbar.tsx` |
| `components/JourneyMap.tsx` | `components/features/learning/JourneyMap.tsx` |
| `components/GamifiedJourney.tsx` | `components/features/learning/GamifiedJourney.tsx` |
| `components/ConceptLearning.tsx` | `components/features/learning/ConceptLearning.tsx` |
| `components/MCQGate.tsx` | `components/features/learning/MCQGate.tsx` |
| `components/PersonalizedAssignment.tsx` | `components/features/learning/PersonalizedAssignment.tsx` |
| `components/YouTubeVideos.tsx` | `components/features/learning/YouTubeVideos.tsx` |
| `components/CodingChallenge.tsx` | `components/features/coding/CodingChallenge.tsx` |
| `components/FrontendEditor.tsx` | `components/features/coding/FrontendEditor.tsx` |
| `components/FrontendPreview.tsx` | `components/features/coding/FrontendPreview.tsx` |
| `components/SQLChallenge.tsx` | `components/features/coding/SQLChallenge.tsx` |
| `components/StaxInterviewer.tsx` | `components/features/interview/StaxInterviewer.tsx` |
| `components/BadgeUnlock.tsx` | `components/features/gamification/BadgeUnlock.tsx` |
| `components/LeaderboardUnlock.tsx` | `components/features/gamification/LeaderboardUnlock.tsx` |
| `components/CountdownTimer.tsx` | `components/ui/CountdownTimer.tsx` |

---

## 4. CREATE New (fresh files)

### Backend foundation
- `src/lib/db.ts` — Mongo connection (singleton)
- `src/lib/jwt.ts`
- `src/lib/bcrypt.ts`
- `src/lib/logger.ts` (Pino)
- `src/lib/errors.ts` (AppError, ValidationError, AuthError)
- `src/lib/constants.ts`

### Mongoose models
- `src/models/User.model.ts`
- `src/models/Progress.model.ts`
- `src/models/Submission.model.ts`
- `src/models/Contest.model.ts`
- `src/models/ContestParticipation.model.ts`
- `src/models/InterviewSession.model.ts`
- `src/models/Subscription.model.ts`
- `src/models/index.ts` (barrel)

### Middleware
- `src/middleware/auth.middleware.ts`
- `src/middleware/rateLimit.middleware.ts`
- `src/middleware/error.middleware.ts`
- `src/middleware/logger.middleware.ts`
- `middleware.ts` (root — Next.js Edge)

### Validators (Zod)
- `src/validators/auth.validator.ts`
- `src/validators/code.validator.ts`
- `src/validators/contest.validator.ts`
- `src/validators/interview.validator.ts`
- `src/validators/common.validator.ts`

### Controllers
- `src/controllers/auth.controller.ts`
- `src/controllers/user.controller.ts`
- `src/controllers/learning.controller.ts`
- `src/controllers/code.controller.ts`
- `src/controllers/contest.controller.ts`
- `src/controllers/interview.controller.ts`
- `src/controllers/payment.controller.ts`

### Frontend foundation
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/layout.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/signup/route.ts`
- `components/ui/button.tsx` (shadcn)
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/toast.tsx`
- `components/providers/ThemeProvider.tsx`
- `components/providers/QueryProvider.tsx`
- `components/providers/AuthProvider.tsx`
- `store/auth.store.ts`
- `store/ui.store.ts`
- `store/learning.store.ts`
- `hooks/useAuth.ts`
- `hooks/useProgress.ts`

### Config / DevOps
- `.env.example`
- `.eslintrc.json` (proper config)
- `.prettierrc`
- `Dockerfile`
- `docker-compose.yml` (Mongo + Redis local)
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

### Tests
- `tests/unit/controllers/auth.test.ts`
- `tests/integration/api/auth.test.ts`
- `tests/e2e/learning-flow.spec.ts`
- `jest.config.js`
- `playwright.config.ts`

### Docs
- `docs/INTERVIEW-PREP.md` (full Q&A bank)
- `docs/API-REFERENCE.md`
- `docs/diagrams/architecture.svg`
- `README.md` (v2 — rewrite)

---

## 5. KEEP As-Is

| File | Reason |
|---|---|
| `app/layout.tsx` | Will refactor later (Phase F) |
| `app/globals.css` | Tailwind base |
| `next.config.js` | Fine |
| `tailwind.config.ts` | Fine (small additions later) |
| `postcss.config.js` | Standard |
| `next-env.d.ts` | Auto-generated |
| `scripts/generate-databases.js` | Useful, keep |

---

## 6. Migration Risk Matrix

| Risk | Count | Examples |
|---|---|---|
| 🟢 Safe (pure move/copy) | ~20 files | Static content `lib/*Database.ts` → `content/` |
| 🟡 Refactor needed | ~15 files | Services need streaming/error wrappers |
| 🔴 Full rewrite | ~10 files | All `lib/database/*` Supabase wrappers |
| 🔴 Delete + replace | 4 files | Supabase, pg, schema.sql |

---

## 7. Migration Execution Order

### Phase A — Safe foundation (low risk)
1. Install missing deps
2. Create empty `src/`, `content/`, `hooks/`, `store/` folders
3. Setup `tsconfig.json` path aliases (`@/src`, `@/content`)
4. Create `.env.example`
5. Move static content `lib/*Database.ts` → `content/`

### Phase B — DB layer
6. `src/lib/db.ts` (Mongo cached connection)
7. All `src/models/*.ts` (Mongoose schemas)
8. `src/lib/{jwt, bcrypt, logger, errors, constants}.ts`

### Phase C — Auth
9. Install + configure NextAuth
10. `app/api/auth/*` routes
11. `middleware.ts` root (auth + rate limit)
12. Login/signup pages
13. `useAuth` hook + auth store

### Phase D — Services
14. Refactor `lib/gemini.ts` → `src/services/gemini.service.ts` with streaming
15. Refactor `lib/judge0.ts` → `src/services/judge0.service.ts`
16. Add error handling + retries + Redis cache

### Phase E — Controllers
17. Build `src/controllers/*` one feature at a time
18. Refactor `app/api/*/route.ts` → thin handler + controller call

### Phase F — Frontend
19. Move components → `features/`
20. Install shadcn primitives (`components/ui/*`)
21. Add providers (Theme, Query, Auth)
22. Setup Zustand stores
23. Refactor `app/layout.tsx`

### Phase G — Polish
24. UI redesign (landing, dashboard, animations)
25. Loading skeletons + error boundaries
26. Tests (Jest + Playwright)
27. Docker + docker-compose
28. GitHub Actions CI
29. Deploy Vercel + MongoDB Atlas
30. Rewrite README + interview docs

---

## 8. Interview Talking Points About This Migration

**Q: "Project me kya bada change kiya?"**

> "Sir, initially MVP banaya tha Supabase Postgres pe. Phir MongoDB me migrate kiya kyunki mera data mostly document-shaped tha — user progress, AI conversation history, nested test results. Sath me layered architecture follow kiya — Express jaise MVC pattern with controllers/services/models. Authentication NextAuth.js + JWT + bcrypt se replace kiya. Rate limiting + Redis caching add kiya AI APIs ko protect karne ke liye. Validation Zod se centralize ki. Result — production-grade architecture jo scale ho sake."

**Q: "Folder structure kyun change kiya?"**

> "Sir, original me flat structure tha — sab components ek folder me, sab utilities ek lib me. Maine MVC-style separation kiya — Single Responsibility ke principle pe. Controllers business logic me, Services external integrations me, Models DB schemas me, Middleware cross-cutting concerns me. Components ko features ke hisab se group kiya — learning/, coding/, interview/. Naye developer ko codebase samajhne me 2 minute lagega."

---

## 9. Progress Tracker

- [x] Architecture locked (`docs/06-ARCHITECTURE-V2.md`)
- [x] Cleanup plan (this doc)
- [ ] Phase A — Foundation
- [ ] Phase B — DB layer
- [ ] Phase C — Auth
- [ ] Phase D — Services
- [ ] Phase E — Controllers
- [ ] Phase F — Frontend
- [ ] Phase G — Polish
