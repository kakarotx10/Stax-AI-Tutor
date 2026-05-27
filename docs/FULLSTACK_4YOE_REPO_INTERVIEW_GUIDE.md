# Stax AI Tutor - Full Stack 4 YOE Interview Prep Guide

This guide is strictly based on this repository: Next.js App Router frontend, API route handlers, MongoDB/Mongoose backend layer, legacy Supabase competition modules, NextAuth, Judge0, Gemini, SQLite, PayU, Docker, CI, and tests.

## 1. Confident Project Explanation

Strong 60-second answer:

> Sir, Stax AI Tutor ek gamified AI-powered learning platform hai for CS placement and full-stack interview prep. Frontend Next.js 14 App Router, React, TypeScript, Tailwind, Framer Motion aur Monaco Editor se bana hai. Backend same Next.js app ke `app/api` route handlers me hai. Newer modules me layered architecture follow kiya hai: route handler -> controller -> validator -> service/model. MongoDB with Mongoose user, progress, attempts, submissions, contests, interviews ke liye use hua hai. Auth NextAuth Credentials provider, bcrypt password hashing, JWT session strategy, and middleware-based route protection se handled hai. AI content ke liye Gemini, coding execution ke liye Judge0, SQL practice ke liye in-memory SQLite, and payments ke liye PayU checkout hash generation hai. Important point ye hai ki repo migration state me hai: core auth/dashboard/attempt/evaluator MongoDB based hain, but contests/duels/marathons/standoffs ke kuch legacy modules abhi Supabase/localStorage based hain. Main isko production MVP bolunga, but enterprise-ready banane ke liye server-side grading, schema cleanup, payment verification, rate limits, and E2E tests improve karne honge.

## 2. Architecture Questions

### Q1. [HIGH PRIORITY] Is this frontend-only, backend-only, or full-stack?

Expected answer: Ye full-stack Next.js app hai. Frontend `app/` pages and `components/` me hai. Backend `app/api/**/route.ts` me hai. Newer backend logic `src/controllers`, `src/services`, `src/models`, `src/validators`, `src/middleware`, `src/lib` me layered hai.

Tricky follow-up: "Then why no Express server?"  
Answer: Next.js route handlers hi backend APIs ka role play kar rahe hain. Express separate process ki zarurat nahi hai unless independent backend scaling or non-Next workloads chahiye.

Interviewer mindset: Candidate ko repo structure samajh aaya ya sirf README padha, ye check karna.

### Q2. [HIGH PRIORITY] Explain request flow for code submission.

Expected answer: Client `CodingChallenge` ya contest solve page se code bhejta hai. Newer secure path `/api/code/submit` -> `requireAuth()` -> `checkRateLimit(user.id, 'code')` -> `src/controllers/code.controller.submit()` -> content se test cases load -> `src/services/judge0.service.executeCode()` per test case -> score server-side calculate -> `Submission` create -> optional `Attempt` create -> `applyEvaluationBookkeeping()` progress/user stats update.

Tricky follow-up: "Repo me har code submit isi path se jaata hai?"  
Answer: Nahi. `components/CodingChallenge.tsx` abhi `/api/judge0/execute` call karke client side par pass/fail aggregate karta hai and then `/api/users/attempts` save karta hai. `/api/code/submit` better production path hai, but not every UI has migrated.

Interviewer mindset: Overclaim pakadna. Strong candidate honest hybrid state batata hai.

### Q3. [HIGH PRIORITY] Why controllers/services/models layer added?

Expected answer: Route handlers ko thin rakhne ke liye. Controllers business orchestration karte hain, services external APIs isolate karte hain, models DB shape define karte hain, validators runtime input safety dete hain. Example: `auth.controller.ts` signup/login, `judge0.service.ts` external execution, `User.model.ts` schema.

Follow-up: "Benefit in testing?"  
Answer: Controller/service pure functions ko route handler ke bina unit test/mock kar sakte hain. Existing tests evaluator service/controller and rubrics ko directly test karte hain.

Interviewer mindset: Candidate separation of concerns practically samjha sakta hai ya nahi.

### Q4. [HIGH PRIORITY] What is the biggest architecture inconsistency?

Expected answer: Repo me two data paths hain. Newer README/API docs MongoDB + NextAuth + controllers describe karte hain. Legacy modules like contests/duels/marathons/standoffs/interview posts `lib/database/*` through Supabase use karte hain, and some client pages still use localStorage user mapping. Isliye migration incomplete hai.

Follow-up: "How will you clean it?"  
Answer: One source of truth choose karunga. If Mongo final hai, Supabase competition helpers replace with Mongoose models/controllers, remove localStorage identity dependency, migrate schema/data, and update UI APIs to use current authenticated user only.

Interviewer mindset: Repo maturity and ownership honesty.

### Q5. [HIGH PRIORITY] Explain middleware role.

Expected answer: Root `middleware.ts` protected page prefixes and protected APIs check karta hai. It uses `getToken()` from NextAuth JWT. Auth pages par already logged in user ko `/dashboard` redirect karta hai. Protected APIs without token return 401 JSON.

Follow-up: "Public API kaun se hain?"  
Answer: `PUBLIC_API_PREFIXES = ['/api/auth']`; baaki `/api/*` protected by middleware matcher.

Interviewer mindset: Security boundary samajhna.

### Q6. Is middleware also doing rate limiting?

Expected answer: Current root middleware auth/redirect karta hai, rate limiting nahi. Rate limit helper `src/middleware/rateLimit.middleware.ts` route handlers me manually call hota hai, like signup, code submit, attempts POST. README me broad claim hai, but actual centralized middleware-level rate limit nahi hai.

Follow-up: "Problem kya hai?"  
Answer: Jahan helper call nahi hua, expensive APIs protected hone ke baad bhi abuse ho sakte hain.

Interviewer mindset: Documentation vs implementation mismatch catch karna.

### Q7. What should be server components vs client components here?

Expected answer: Many pages are client components because they use state/effects/localStorage/Monaco/voice APIs. Dashboard is server component because it fetches `getServerSession()` and Mongo stats server-side. Interviewer can ask why `app/profile/page.tsx` is client: because it reads localStorage and Supabase hook data.

Follow-up: "Optimization?"  
Answer: More data pages can be server-rendered after localStorage dependency is removed. Monaco-heavy components should stay client and ideally lazy-load.

Interviewer mindset: Next.js App Router understanding.

### Q8. Why `connectDB()` caches connection globally?

Expected answer: Next.js dev hot reload/serverless cold starts can create repeated module contexts. `global.mongooseCache` caches connection and promise, preventing Mongo connection storms.

Follow-up: "What happens on failure?"  
Answer: Catch resets `cached.promise = null`, so next call can retry.

Interviewer mindset: Practical serverless DB handling.

### Q9. Why `force-dynamic` used in some routes?

Expected answer: Routes like `/api/users/attempts`, dashboard, progress are user/session dependent and should not be statically cached. `dynamic = 'force-dynamic'` ensures fresh per-request behavior.

Follow-up: "What if omitted?"  
Answer: In some routes Next may still infer dynamic due cookies/session, but explicit dynamic avoids ambiguity.

Interviewer mindset: Caching awareness.

### Q10. Which parts are cleanly production-patterned?

Expected answer: `src/lib/errors.ts`, `src/utils/apiResponse.ts`, Mongoose models with indexes, auth controller validation, bcrypt pre-save, rate limit helper, evaluator tests, Docker standalone build, CI typecheck/test.

Follow-up: "Which parts are MVP?"  
Answer: Legacy Supabase competition APIs, random duel scoring, frontend manual validation, SQL correctness gap, payment verification.

Interviewer mindset: Balanced project explanation.

## 3. Frontend Questions

### Q11. [HIGH PRIORITY] Explain frontend routing structure.

Expected answer: App Router use hua hai. Main routes: `/`, `/dashboard`, `/profile`, `/pricing`, `/contests`, `/duels`, `/standoffs`, `/marathons`, `/interviews`, `/stax-interview`. Dynamic learning routes: `/subject/[subjectId]`, `/subject/[subjectId]/unit/[unitId]/journey`, `/subject/[subjectId]/unit/[unitId]/subtopic/[subtopicId]/[phase]`.

Follow-up: "Phase route kya render karta hai?"  
Answer: Theory -> `ConceptLearning`, MCQ -> `MCQGate`, DBMS coding phases -> `SQLChallenge`, OS/CN -> `MCQGate`, other subjects -> `CodingChallenge`, assignment -> `PersonalizedAssignment`.

Interviewer mindset: Routing and dynamic params clarity.

### Q12. How is learning journey locking handled?

Expected answer: `GamifiedJourney` reads `completedPhases` from localStorage. It allows first unit first subtopic freely; otherwise previous phase completion unlocks next phase.

Follow-up: "Weakness?"  
Answer: localStorage can be manipulated and not server source of truth. Mongo `Progress` exists, but journey unlock is not fully hydrated from Mongo.

Interviewer mindset: Client-trust issue.

### Q13. [HIGH PRIORITY] How does MCQ gate work?

Expected answer: `MCQGate` fetches MCQs from `/api/gemini/mcq`, which actually reads static DB via `getMCQsForSubtopic`. It filters difficulty by phase. Pass threshold is 70%. It saves attempt to `/api/users/attempts` and progress to `/api/users/progress`.

Follow-up: "Does backend trust score?"  
Answer: `/api/users/attempts` re-evaluates legacy MCQ batch in evaluator controller, so client score/status is normalized away for saved attempt.

Interviewer mindset: Data trust and workflow.

### Q14. How is Monaco Editor used?

Expected answer: `components/MonacoEditor.tsx` wraps `@monaco-editor/react`, used by coding, SQL, frontend editor, interview coding, contest/marathon pages.

Follow-up: "Optimization?"  
Answer: Monaco is heavy, so lazy load/dynamic import per route, avoid loading on pages where code editor not needed.

Interviewer mindset: Bundle performance.

### Q15. [HIGH PRIORITY] Explain frontend code preview.

Expected answer: `FrontendEditor` creates HTML with HTML/CSS/JS or React CDN+Babel and renders in iframe via `srcDoc`. Iframe sandbox is `allow-scripts allow-same-origin`.

Follow-up: "Security concern?"  
Answer: User-written JS executes in iframe. Sandbox helps, but `allow-same-origin` with scripts is risky because it weakens isolation. For production, remove `allow-same-origin`, use separate origin/domain, CSP, and no sensitive data in preview.

Interviewer mindset: Frontend security awareness.

### Q16. How is state management used?

Expected answer: NextAuth SessionProvider handles session. Zustand `store/auth.store.ts` stores optional profile/loading. TanStack Query provider is configured globally but this repo mostly uses direct axios/fetch, so Query is underutilized.

Follow-up: "Improvement?"  
Answer: Replace ad hoc fetch/axios state with React Query hooks for contests, marathons, attempts, dashboard where caching, retry, loading states matter.

Interviewer mindset: Practical state management.

### Q17. Why many pages use localStorage?

Expected answer: Legacy MVP used anonymous user tracking and Supabase UUID mapping. Files like `userManagement.ts`, profile, journey, completion pages still rely on localStorage for user/profile/progress fallback.

Follow-up: "Production issue?"  
Answer: Cross-device progress breaks, user can tamper with completion, and server cannot fully trust client state.

Interviewer mindset: Mature production thinking.

### Q18. What design system exists?

Expected answer: Tailwind tokens in `tailwind.config.ts` and `app/globals.css`, reusable UI primitives in `components/ui`, legacy `.glass-card`, `.btn-primary`, `.btn-secondary`, and neutralized neon aliases.

Follow-up: "What is migration status?"  
Answer: README says shadcn/ui full migration in progress; actual repo has custom UI components and Radix primitives.

Interviewer mindset: Frontend maintainability.

### Q19. How are loading/error states handled?

Expected answer: Components have local loading states, spinners, retry buttons, and toast errors. API failures often fallback to static data or empty arrays.

Follow-up: "Risk?"  
Answer: Returning empty arrays can hide backend issues. Production should log with correlation IDs and show user-friendly but diagnosable states.

Interviewer mindset: Debuggability.

### Q20. How would you improve frontend performance?

Expected answer: Lazy-load Monaco and heavy competition pages, use server components for data-heavy pages, React Query caching for list/detail APIs, remove duplicate Supabase/Mongo paths, reduce polling, use Suspense boundaries, and avoid loading all static content in client bundles where possible.

Follow-up: "Specific file?"  
Answer: `components/MonacoEditor.tsx`, `app/contests/[id]/solve/page.tsx`, `components/CodingChallenge.tsx`, `components/PersonalizedAssignment.tsx`.

Interviewer mindset: Repo-specific optimization.

## 4. Backend API Questions

### Q21. [HIGH PRIORITY] What is standard API response shape?

Expected answer: Newer APIs use `ok()`, `created()`, `fail()`, `withErrorHandler()` from `src/utils/apiResponse.ts`: success `{ success: true, data }`, error `{ success: false, error: { code, message, details } }`.

Follow-up: "Are all APIs using it?"  
Answer: No. Many legacy routes directly return `NextResponse.json({ error })` or custom shapes like `{ contests: [] }`.

Interviewer mindset: Consistency and migration.

### Q22. How is validation handled?

Expected answer: Newer modules use Zod validators in `src/validators`: auth, code, contest, attempt, evaluator, progress. Legacy APIs manually check fields.

Follow-up: "Why Zod if TypeScript exists?"  
Answer: TypeScript compile-time only; API body is runtime unknown. Zod validates actual request payload before business logic.

Interviewer mindset: Runtime safety.

### Q23. [HIGH PRIORITY] What does `/api/code/execute` do vs `/api/code/submit`?

Expected answer: `/api/code/execute` is broad legacy execution route. It handles SQL, frontend preview, simulated backend languages, ML Python, Python/C++/Java via old `lib/judge0`. `/api/code/submit` is newer production-style server grading route using `src/controllers/code.controller.submit`, rate limit, structured response, Mongo `Submission`.

Follow-up: "Which one should production UI use?"  
Answer: `/api/code/submit` for judged submissions; `/api/code/execute` can remain for playground/run-only preview after stricter limits.

Interviewer mindset: API boundary and trust.

### Q24. [HIGH PRIORITY] How does error handling work?

Expected answer: Custom `AppError` classes map to HTTP status: validation 400, auth 401, forbidden 403, not found 404, conflict 409, rate limit 429, external service 502. `withErrorHandler()` catches and serializes.

Follow-up: "Where not used?"  
Answer: Many `app/api/gemini/*`, legacy competitions, SQL, PayU routes manually catch and return.

Interviewer mindset: Consistency and stack trace leakage.

### Q25. How are external service failures represented?

Expected answer: Newer services wrap errors as `ExternalServiceError`, especially Gemini and Judge0. Old helper files often throw plain errors and log to console.

Follow-up: "Production improvement?"  
Answer: Common service wrapper, timeout, retry policy, circuit breaker for Gemini/Judge0, structured logs with request IDs.

Interviewer mindset: Reliability.

### Q26. [HIGH PRIORITY] Why are route handlers kept thin?

Expected answer: Thin route handlers parse request/session, call controller, return response. Example `/api/users/attempts` only gets auth, query/body, calls `listAttempts/createAttempt`.

Follow-up: "Counterexample?"  
Answer: `/api/sql/execute` contains SQLite helpers and validation inside route file; could move to service/controller.

Interviewer mindset: Code organization.

### Q27. What is the biggest API design issue?

Expected answer: Duplicate/mixed API versions. There is `/api/contests` legacy Supabase path and `/api/v2/contests` Mongo path. Some docs describe `/api/code/submit` but UI still uses `/api/judge0/execute`.

Follow-up: "Migration plan?"  
Answer: Freeze legacy endpoints, migrate frontend calls feature by feature, add deprecation notes/tests, then delete Supabase helpers.

Interviewer mindset: Ownership and technical debt.

## 5. Authentication and Security Questions

### Q28. [HIGH PRIORITY] Explain signup/login.

Expected answer: Signup route `/api/auth/signup` rate limits by IP, calls `auth.controller.signup`, validates with Zod, checks duplicate email, creates User with plain password assigned to `passwordHash`, pre-save hook hashes it. Login uses NextAuth Credentials provider, calls `auth.controller.login`, selects `+passwordHash`, compares bcrypt, updates login timestamps, returns public user. NextAuth stores JWT session.

Follow-up: "Is Google OAuth implemented?"  
Answer: README/env mention Google keys, but `src/lib/auth.ts` only registers CredentialsProvider currently.

Interviewer mindset: Actual implementation vs docs.

### Q29. Why is `passwordHash` `select: false`?

Expected answer: By default password hash DB field query response me nahi aata. Login explicitly `.select('+passwordHash')` karta hai only when comparison needed.

Follow-up: "What if API returns user.toJSON?"  
Answer: `toJSON` transform removes `passwordHash` and `__v`.

Interviewer mindset: Data exposure prevention.

### Q30. [HIGH PRIORITY] Is JWT custom helper used?

Expected answer: `src/lib/jwt.ts` exists, but main auth flow uses NextAuth JWT strategy. Custom JWT helpers seem available for future/manual token use, not primary path.

Follow-up: "Risk?"  
Answer: Duplicate auth patterns confuse maintainers. Either remove unused helper or clearly use it in custom APIs.

Interviewer mindset: Dead code / architecture clarity.

### Q31. How are protected pages handled?

Expected answer: `middleware.ts` protects route prefixes like `/dashboard`, `/profile`, `/subject`, competitions, interviews, stax-interview. No token -> redirect to `/login?callbackUrl=...`. Auth pages redirect logged-in user to `/dashboard`.

Follow-up: "What about `/pricing`?"  
Answer: Navigation shows pricing public/private, but middleware protected prefixes do not include `/pricing`, so pricing is public.

Interviewer mindset: Route protection specifics.

### Q32. [HIGH PRIORITY] Where are security gaps?

Expected answer: Legacy contest/duel/standoff submissions trust client score/status. Frontend iframe allows scripts and same-origin. PayU success page trusts query params and no webhook verification. Some profile/progress is localStorage/demo. Some expensive Gemini routes lack route-level rate limiting. SQL keyword blocking is basic string matching.

Follow-up: "Which is most severe?"  
Answer: Client-trusted scoring because leaderboard/results can be manipulated. Payment verification also critical before enabling paid access.

Interviewer mindset: Prioritization.

### Q33. Is SQL execution safe?

Expected answer: It uses in-memory SQLite per request and blocks dangerous keywords, requires query starts with SELECT. Safer than executing against production DB. But keyword contains matching is not a full SQL parser; comments/CTEs/edge syntax can bypass or false-positive. Also no timeout/row limit in current route.

Follow-up: "How to harden?"  
Answer: Use SQL parser/AST allowlist, statement timeout, max rows, read-only DB connection, no `allow-same-origin` style risks, and expected result comparison.

Interviewer mindset: Sandbox thinking.

### Q34. How is rate limiting implemented?

Expected answer: Upstash Redis sliding window. `checkRateLimit(identifier, key)` supports ai/code/evaluation/auth/default. If Upstash env missing, it logs warning and disables rate limit.

Follow-up: "Production concern?"  
Answer: Fail-open rate limiting is okay for local dev, but production should fail closed for expensive endpoints or use fallback in-memory per instance with clear alert.

Interviewer mindset: Abuse prevention.

## 6. Database Questions

### Q35. [HIGH PRIORITY] Which databases are used?

Expected answer: Current repo uses MongoDB/Mongoose for newer core modules: User, Progress, Attempt, Submission, Contest, InterviewSession, Subscription. It also still includes Supabase/Postgres schema and helpers for legacy competitions/profile/interview resources. SQL practice uses in-memory SQLite per request.

Follow-up: "What is final source of truth?"  
Answer: README positions MongoDB as primary, but code is hybrid. Candidate should say migration is incomplete.

Interviewer mindset: Data architecture honesty.

### Q36. Explain User model.

Expected answer: User has email unique indexed, passwordHash hidden, name, avatar, role, stats, subscription, login counters, timestamps. Pre-save hashes password if not bcrypt. Stats include xp, streak, rank, totalSolved, lastActiveAt.

Follow-up: "Does pre-save always hash?"  
Answer: Only when `passwordHash` modified and does not start with `$2`.

Interviewer mindset: Mongoose hooks and auth safety.

### Q37. Explain Attempt model.

Expected answer: Attempt stores user attempt across coding, MCQ, SQL, written, assignment, contest. It stores subject/unit/subtopic, phase, problem metadata, language/code, status/score, rubric, feedback, evaluator version, testResults, mcqResults, sqlResult. Indexes support user/type/status/subject queries.

Follow-up: "Why flexible schema?"  
Answer: Different attempt types need different nested result data. Mongo document model fits this better than many relational nullable tables.

Interviewer mindset: Data modeling.

### Q38. Explain Progress model.

Expected answer: Progress is unique per userId+subjectId+unitId+subtopicId. It stores completed phases array, scores, attempts, lastAttemptAt, completed flag. `upsertProgress` and evaluator bookkeeping update it.

Follow-up: "Weakness?"  
Answer: UI journey still uses localStorage for locking, not only Mongo Progress.

Interviewer mindset: DB vs UI state consistency.

### Q39. Explain dashboard aggregation.

Expected answer: `getDashboardStats()` runs parallel Mongo queries/aggregations: user, per-subject progress grouping, attempt totals, attempts by type/status, recent attempts, 14-day timeline, weak topics from failed statuses. It uses `Promise.all`.

Follow-up: "Performance?"  
Answer: Indexes on Attempt and Progress help. At scale, precomputed analytics or nightly/user-level counters may be needed.

Interviewer mindset: Aggregation and indexing.

### Q40. [HIGH PRIORITY] Which indexes exist and why?

Expected answer: User email unique and stats.xp. Attempt indexes by userId+createdAt, userId+type+createdAt, userId+status+createdAt, userId+subjectId+unitId. Progress unique composite and userId+subjectId/completed. Submission indexes userId+problemId+createdAt and contestId+score. Contest status/startAt/domain.

Follow-up: "Missing index?"  
Answer: If leaderboard stays embedded participants array, large contests become painful. Better separate ContestParticipation/Submission collection with index `{ contestId, score: -1, joinedAt: 1 }`.

Interviewer mindset: Query-driven schema design.

### Q41. Why embedded contest participants can be a scaling issue?

Expected answer: `Contest` model embeds `participants` array. For small contests okay, but thousands/lakhs participants means huge document, array update contention, 16MB Mongo doc limit risk, and leaderboard aggregation becomes costly.

Follow-up: "Fix?"  
Answer: Separate `ContestParticipation` collection/table with one document per participant.

Interviewer mindset: Mongo modeling tradeoff.

### Q42. What is Supabase schema used for?

Expected answer: `supabase/schema.sql` defines users, user_progress, user_stats, badges, contests, contest_problems, participants, submissions, duels, standoffs, marathons, indexes, triggers. Legacy helpers use these tables.

Follow-up: "Mismatch?"  
Answer: Some helper code expects columns like `domain` on contests/marathons/duels/standoffs; schema includes domain in some TS interfaces but original SQL may not fully match all latest modules.

Interviewer mindset: Migration discipline.

## 7. AI, Judge0, Evaluator, SQL Questions

### Q43. [HIGH PRIORITY] How does Judge0 integration work?

Expected answer: New service `src/services/judge0.service.ts` base64 encodes source/stdin/expected output, posts to Judge0 submissions with `wait=false`, polls token until status not queued/processing, decodes stdout/stderr/compile output, compares trimmed stdout to expected output, returns status/time/memory/passed.

Follow-up: "Supported languages?"  
Answer: In new service: python, cpp, java. Old UI route sometimes offers javascript but old `lib/judge0` only maps python/cpp/java.

Interviewer mindset: External API handling.

### Q44. What are Judge0 failure modes?

Expected answer: API key missing, RapidAPI errors, queued too long timeout, compile/runtime error, output format mismatch, rate limit, network failure.

Follow-up: "How handled?"  
Answer: New service has retry for 5xx, timeout 30s, `ExternalServiceError`. Old helper throws plain errors.

Interviewer mindset: Reliability.

### Q45. [HIGH PRIORITY] How does evaluator service work?

Expected answer: `evaluator.service.ts` accepts discriminated union: mcq, coding, sql, written. MCQ/coding/sql are deterministic rubric based. Written uses Gemini JSON grading, retries once, then fallback keyword grading with degraded metadata. It returns score, level, status, rubric, feedback, nextStep, meta.

Follow-up: "Why deterministic rubrics?"  
Answer: For code/MCQ/SQL, test results are objective. LLM only where natural language answer grading is needed.

Interviewer mindset: AI should not replace deterministic logic unnecessarily.

### Q46. Explain next-step logic.

Expected answer: Score <50 MCQ -> retry; score <50 coding -> review theory; 50-74 -> practice similar; 75-89 with prior phases -> advance; 90+ and last three high attempts -> interview_ready; otherwise retry.

Follow-up: "Where context comes from?"  
Answer: `evaluator.controller` loads prior Progress and last Attempts.

Interviewer mindset: Personalization logic.

### Q47. [HIGH PRIORITY] How does written answer grading avoid bad LLM output?

Expected answer: Prompt asks JSON only. Response parsed as JSON or extracts object by regex. Zod `WrittenGradeSchema` validates. It retries once with stricter prompt. If still invalid, fallback keyword overlap grading and `meta.degraded = true`.

Follow-up: "Weakness?"  
Answer: Regex extraction can still parse wrong object; fallback is basic. Production should use structured output API/schema where available.

Interviewer mindset: LLM robustness.

### Q48. How does SQL evaluator compare rows?

Expected answer: `evaluateSqlRubric` stable-stringifies rows, compares ordered or unordered sets, 85% correctness and 15% query quality. Query quality penalizes `SELECT *`, cartesian joins, joins without ON.

Follow-up: "Does current SQL challenge use this fully?"  
Answer: Not fully. `SQLChallenge` marks success after query executes and saves completed score 100; evaluator can re-evaluate if expected rows are provided in metadata, but current path often lacks expectedRows.

Interviewer mindset: Implementation gap.

### Q49. Gemini usage in learning content?

Expected answer: Old `lib/gemini.ts` has Gemini model discovery and prompt templates. But `/api/gemini/theory`, `/mcq`, `/coding-problem` currently rely mainly on static content DBs; assignment/hint/reteach/reinforcement use Gemini.

Follow-up: "Why not generate everything live?"  
Answer: Static DB is predictable, cheaper, testable. Live Gemini useful for personalized assignment/hints but needs caching/rate limiting.

Interviewer mindset: Cost and reliability.

### Q50. HuggingFace/DeepSeek purpose?

Expected answer: `lib/huggingface.ts` verifies generated coding assignment quality. If key missing or errors, it often fails open/defaults verified.

Follow-up: "Production issue?"  
Answer: Fail-open is okay for MVP availability, but quality assurance in production should be explicit and logged, maybe mark unverified instead of verified.

Interviewer mindset: AI QA.

## 8. Competition Modules Questions

### Q51. [HIGH PRIORITY] Are contests secure?

Expected answer: Mixed. New `src/controllers/contest.controller.submitContestProblem()` server-grades using code controller and `$max`. But actual legacy route `/api/contests/[id]/submit` accepts `status` and `score` from body and calls Supabase helper. So current UI path still has client-trust risk.

Follow-up: "How to fix?"  
Answer: Route should accept only code/language/problemId, run Judge0 server-side, calculate score, then update leaderboard. Remove status/score from request contract.

Interviewer mindset: Production security.

### Q52. How do duels work?

Expected answer: `duels/page.tsx` finds opponent via `/api/duels/find-opponent`, Supabase helper can find by level or create bot. A problem is Gemini-generated. Duel detail page lets user submit solution.

Follow-up: "Weakness?"  
Answer: `app/duels/[id]/page.tsx` uses `Math.floor(Math.random() * 100)` as score. The API accepts score. Not production judging.

Interviewer mindset: Candidate should not claim real duel judging.

### Q53. How do standoffs work?

Expected answer: Supabase helper creates pending standoff team, users join team slots, matching merges two teams, generates problem, and team score is max submitted score.

Follow-up: "Weakness?"  
Answer: Score is client-provided, team membership updates can race, no transaction/locking, no real-time robust coordination.

Interviewer mindset: Multiplayer consistency.

### Q54. How do marathons work?

Expected answer: Marathons are Supabase-based, list/detail/leaderboard helpers exist, join creates participant, solve pages use static contest problems and Judge0 execution client-driven.

Follow-up: "Scaling issue?"  
Answer: Leaderboards should be server-computed, indexed, and maybe cached; client-driven scoring should be removed.

Interviewer mindset: Leaderboard integrity.

### Q55. Why are competitions returning fallback data?

Expected answer: If Supabase not configured or fails, pages use fallback sample contests/marathons/interview experiences. This prevents UI breakage in dev/demo.

Follow-up: "Production downside?"  
Answer: Silent fallback can hide real outage and show fake data. Production should display degraded state and log/alert.

Interviewer mindset: Observability.

## 9. Payment and Pricing Questions

### Q56. [HIGH PRIORITY] Explain PayU checkout integration.

Expected answer: `/api/payments/payu/checkout` validates plan/user fields, reads PayU merchant key/salt/mode, calculates amount from pricing, creates txnid, builds hash string with salt using SHA512, returns `actionUrl` and form params.

Follow-up: "Is payment complete?"  
Answer: No. Success/failure pages read query params only. There is no PayU webhook/callback hash verification or Subscription activation in DB.

Interviewer mindset: Payment security.

### Q57. What is Subscription model for?

Expected answer: Mongo `Subscription` model stores userId, plan, status, provider, transaction/payment ids, amount, currency, start/expiry/cancel timestamps, raw provider response.

Follow-up: "Is it wired?"  
Answer: Model exists but PayU checkout route does not create/update subscription yet.

Interviewer mindset: Schema vs feature completeness.

## 10. Testing, CI/CD, Docker Questions

### Q58. [HIGH PRIORITY] What tests exist?

Expected answer: Jest/ts-jest tests under `tests/unit`: bcrypt helpers, error classes, attempt validator, evaluator rubrics, evaluator service, evaluator controller, learning question coverage. E2E/integration folders are placeholders.

Follow-up: "Current status?"  
Answer: In this workspace, tests pass: 7 suites, 23 tests. TypeScript typecheck also passes.

Interviewer mindset: Evidence-based claim.

### Q59. What does CI do?

Expected answer: `.github/workflows/ci.yml` runs on push/PR to main, Node 20, npm ci, lint with `continue-on-error: true`, typecheck, tests with test env secrets.

Follow-up: "Issue?"  
Answer: Lint is non-blocking, so code style/errors caught by lint won't fail CI. Also no build step in CI.

Interviewer mindset: CI quality bar.

### Q60. Explain Docker setup.

Expected answer: Multi-stage Dockerfile: deps npm ci, builder npm run build, runner copies standalone Next output, runs as non-root `nextjs`, exposes 3000. `docker-compose.yml` runs app + mongo:7 + redis:7-alpine with volumes.

Follow-up: "Mismatch?"  
Answer: docker-compose sets `REDIS_URL`, but rate limit helper expects Upstash REST URL/token, so local Redis container is not used by current rate limiter.

Interviewer mindset: Deployment config accuracy.

### Q61. Why `output: 'standalone'`?

Expected answer: Next standalone output bundles production server with minimal files, good for Docker runner image.

Follow-up: "What must Docker copy?"  
Answer: `.next/standalone`, `.next/static`, and public assets.

Interviewer mindset: Next deployment awareness.

## 11. Production Issue Scenarios

### Scenario 1. [HIGH PRIORITY] Users report contest leaderboard cheating.

Expected answer: First inspect `/api/contests/[id]/submit`; it accepts `score/status` from client. Attackers can post high score. Immediate fix: ignore client score/status, server-run code via Judge0, calculate score, update participant with `$max`/transaction. Also audit existing suspicious submissions.

Follow-up: "What log helps?"  
Answer: Submission logs with userId, contestId, problemId, server score, IP/request id.

Interviewer mindset: Incident handling and root cause.

### Scenario 2. Judge0 latency spikes and code submissions hang.

Expected answer: New service polls up to 30s. Need add queue/backoff, user-visible pending state, timeout response, retry only safe calls, rate limit, and possibly async job queue. Cache? Not for arbitrary code, but duplicate run protection possible by code hash/testcase.

Follow-up: "Current bottleneck?"  
Answer: `code.controller.submit` executes test cases sequentially; can parallelize with concurrency limit.

Interviewer mindset: External dependency bottlenecks.

### Scenario 3. Mongo connections exceed limit.

Expected answer: `connectDB` global cache should reduce storms. Check if multiple runtimes/processes still create too many connections. Use connection pooling options, serverless-friendly Mongo driver settings, avoid connecting at module import, and monitor Atlas connections.

Follow-up: "Which file?"  
Answer: `src/lib/db.ts`.

Interviewer mindset: Serverless DB ops.

### Scenario 4. Users lose progress after browser change.

Expected answer: Journey unlocking/profile still uses localStorage. Need load progress from Mongo `Progress` by authenticated user, derive completed phases server-side, and make localStorage only cache.

Follow-up: "Files?"  
Answer: `GamifiedJourney.tsx`, phase page, profile page, `lib/database/userManagement.ts`.

Interviewer mindset: Source of truth.

### Scenario 5. Payment shows success but plan not active.

Expected answer: Expected because success page only displays query params. Need PayU callback/webhook verification, verify hash/status server-side, create/update `Subscription`, and update User subscription.

Follow-up: "Never do what?"  
Answer: Never activate based only on success URL query params.

Interviewer mindset: Payment correctness.

### Scenario 6. Gemini quota exhausted.

Expected answer: `gemini.service` maps quota errors to ExternalServiceError. Some routes show error. Improve by caching static AI content, fallback content, route rate limits, model fallback, and alerting on quota.

Follow-up: "Where already static?"  
Answer: theory/mcq/coding-problem routes use local databases.

Interviewer mindset: AI cost/reliability.

### Scenario 7. SQL route abused with huge SELECT.

Expected answer: Current route has no row limit/timeout. Add max query length, sqlite interrupt/timeout, max returned rows, AST allowlist, and rate limit.

Follow-up: "Why in-memory helps?"  
Answer: It protects production DB because each request creates temporary SQLite DB.

Interviewer mindset: Sandbox hardening.

### Scenario 8. Dashboard slow for power users.

Expected answer: `getDashboardStats` performs several aggregations. Indexes help, but high volume needs pre-aggregated user analytics, pagination, background jobs, and caching per user.

Follow-up: "Which aggregation costly?"  
Answer: weakTopics and timeline over many Attempt docs.

Interviewer mindset: Query performance.

## 12. Scaling and Enterprise-Level Changes

Current heavy traffic behavior:

- Auth-protected pages depend on NextAuth JWT, so session check is mostly stateless.
- Mongo DB connection is cached but database still becomes bottleneck under high write volume.
- Judge0/Gemini are external bottlenecks and cost centers.
- Legacy Supabase modules can fail silently to fallback data.
- Competition leaderboards using embedded participants/client score are not safe at high traffic.
- Monaco-heavy client pages increase JS bundle size.

Enterprise changes needed:

- Single DB architecture: migrate legacy Supabase/localStorage modules to Mongo or formalize polyglot split.
- Server-side judging only for contests/duels/marathons/standoffs.
- Separate participation/submission collections for leaderboards.
- Redis/queue for async code judging and AI generation.
- Centralized rate limit on all expensive endpoints.
- Payment webhook verification and subscription lifecycle.
- Proper monitoring: request id, structured logs, error tracking, external API latency metrics.
- E2E tests for signup, learning flow, code submit, contest join/submit, payment callback.
- Admin tooling for content, contests, users, subscriptions.
- Security hardening: iframe sandbox, SQL parser, CSP, secrets audit, role checks.

## 13. Optimization Opportunities

- Replace `/api/judge0/execute` UI scoring with `/api/code/submit`.
- Parallelize Judge0 test execution with concurrency limit.
- Lazy-load Monaco Editor only when editor visible.
- Use React Query consistently for competitions/interviews.
- Cache Gemini outputs and static content lookups.
- Move SQL and code execution logic into services.
- Remove duplicate old `lib/judge0.ts` after migration to `src/services/judge0.service.ts`.
- Make lint blocking and add build to CI.
- Remove demo/fake profile stats.
- Use Mongo Progress as journey source of truth.

## 14. Hidden Weak Points Interviewers May Catch

- README says Google OAuth, but auth config only has CredentialsProvider.
- README says CI/CD deploy, repo has CI only, no deploy workflow present.
- `docker-compose` Redis is not used by Upstash REST-based rate limiter.
- `src/controllers/interview.controller.ts` persists interview sessions, but Stax interview route uses in-memory `InterviewEngine` state sent by client and does not use that controller.
- Contest secure Mongo controller exists, but legacy Supabase contest submit route is still used by pages.
- Profile page overwrites some stats with fake demo numbers.
- Frontend editor submissions get 100 if non-empty code; no DOM validation.
- SQL challenge success is query execution success, not necessarily expected output correctness.
- PayU success page does not verify payment.
- Many Gemini routes have manual validation and no direct route-level rate limit.

## 15. "Why This Approach?" Questions

- Why Next.js full-stack instead of separate backend?  
  Expected: One repo, faster MVP, route handlers enough for APIs, easier deploy on Vercel.

- Why MongoDB for attempts/progress?  
  Expected: Attempt/test/rubric/feedback data is nested and varies by type.

- Why still Supabase?  
  Expected: Legacy MVP modules use Supabase. Newer refactor moves core flows to Mongo.

- Why NextAuth JWT strategy?  
  Expected: Serverless-friendly, no DB session store required, cookies handled by NextAuth.

- Why Zod?  
  Expected: Runtime validation for untrusted request bodies.

- Why Judge0 instead of running code locally?  
  Expected: Avoid unsafe arbitrary code execution inside app server; Judge0 provides sandboxed execution.

- Why in-memory SQLite for SQL practice?  
  Expected: Safe temporary DB per request, no production DB mutation.

- Why fallback content?  
  Expected: Better dev/demo UX when Supabase/Gemini missing, but production should make degradation explicit.

## 16. Coding and Machine Coding Round Possibilities

1. Add Zod validation to `/api/sql/execute`.
2. Convert `/api/contests/[id]/submit` to server-side Judge0 grading.
3. Create a `ContestParticipation` Mongoose model and migrate leaderboard query.
4. Lazy-load Monaco with `next/dynamic`.
5. Add payment verification route for PayU callback.
6. Implement DOM validation for `FrontendEditor` requirements.
7. Add rate limit to `/api/gemini/hint` and `/api/gemini/assignment`.
8. Add API response wrapper to legacy routes.
9. Build React Query hook for contests list/detail.
10. Add Mongo-backed progress hydration to `GamifiedJourney`.
11. Add unit test for `code.controller.submit` with mocked Judge0.
12. Add SQL expected-row comparison in `SQLChallenge`.
13. Add request id logging middleware/helper.
14. Add admin-only guard using `requireRole('admin')`.
15. Add pagination cursor to leaderboard.

## 17. Senior Follow-Up Questions

- How would you migrate Supabase competition data to Mongo without downtime?
- How would you design idempotent code submissions?
- How would you prevent duplicate contest joins under concurrent clicks?
- How would you handle Judge0 callback/webhook instead of polling?
- How would you cache Gemini safely without returning wrong content to another subject?
- How would you design a fair leaderboard tie-breaker?
- How would you add RBAC for admin contest creation?
- How would you monitor AI cost per user?
- How would you separate read-heavy dashboard analytics from write-heavy attempts?
- How would you verify iframe preview cannot access app cookies/session?
- How would you support JavaScript execution if Judge0 mapping only supports Python/C++/Java?
- How would you invalidate NextAuth sessions if user is banned?
- How would you store interview session state securely instead of trusting client engineState?
- How would you handle schema migrations across Mongo and Supabase?
- How would you test payment webhook replay attacks?

## 18. HR and Managerial Questions From This Project

### Q1. What was your role?

Expected answer: Main ownership full-stack flow par tha: Next.js UI, API routes, auth, Mongo models, code execution, evaluator, and docs. Kuch modules MVP/legacy state me hain, unka production hardening plan bhi documented hai.

### Q2. Biggest technical challenge?

Expected answer: Sabse bada challenge tha multiple learning modes ko one platform me connect karna: theory, MCQ, coding, SQL, frontend preview, AI interview, attempts/progress. Iske liye normalized Attempt model and evaluator layer banaya.

### Q3. How did you handle mistakes/tech debt?

Expected answer: Repo me migration ke weak points clearly documented hain. Main overclaim nahi karunga: Supabase/localStorage legacy parts abhi migrate hone baaki hain. Next step is server-side grading and single source of truth.

### Q4. How did you ensure quality?

Expected answer: TypeScript strict mode, Zod validation in newer APIs, Mongoose indexes, unit tests for evaluator/errors/bcrypt/validators, and CI with typecheck/tests.

### Q5. What would you improve first?

Expected answer: Contest/duel score trust, payment verification, progress source of truth, and rate limiting for expensive AI/code APIs.

## 19. Resume Discussion Questions

- You wrote "secure auth"; prove it from code.
  Answer: NextAuth Credentials, bcrypt 12 rounds, passwordHash select false, JWT session, middleware route protection.

- You wrote "server-side grading"; is it complete?
  Answer: New `/api/code/submit` and Mongo contest controller support it, but legacy contest UI route still needs migration.

- You wrote "AI-powered"; where exactly?
  Answer: Gemini assignment/hint/reteach/reinforcement/interview follow-ups; static content for theory/MCQ/coding problems in current routes.

- You wrote "Redis rate limit"; where?
  Answer: `src/middleware/rateLimit.middleware.ts` with Upstash sliding window, used in signup/code submit/attempt creation.

- You wrote "Docker"; what does it include?
  Answer: Multi-stage Next standalone app, compose app+mongo+redis.

## 20. Strong Prepared Answers

### Tell Me About Your Project

> Sir, Stax AI Tutor ek full-stack AI learning and interview prep platform hai. User subject choose karta hai, then theory, MCQ gate, coding/SQL/frontend challenge, assignment, and AI interview flows complete karta hai. Frontend Next.js App Router, TypeScript, Tailwind, Framer Motion, Monaco Editor se bana hai. Backend Next.js route handlers me hai, and newer code me controller-service-model architecture follow kiya hai. Auth NextAuth Credentials + bcrypt + JWT se hai. MongoDB me users, progress, attempts, submissions, contests, interview sessions store hote hain. Judge0 code execution ke liye, Gemini AI hints/assignments/interview followups ke liye, SQLite SQL practice ke liye use hua hai. Honest point: repo currently migration state me hai; some competition modules Supabase/localStorage se chal rahe hain. Isliye production hardening ke liye main server-side grading, one DB source of truth, payment verification, and stronger tests add karunga.

### Biggest Technical Challenge

> Biggest challenge tha different learning activities ko common evaluation and progress system me connect karna. MCQ, coding, SQL, written answer, frontend assignment sabka result shape alag hota hai. Maine Attempt model me flexible nested fields rakhe and evaluator service me discriminated union approach use ki. Coding/MCQ/SQL deterministic rubric se evaluate hote hain, written answers Gemini se grade hote hain with fallback. Isse dashboard, progress, weak topics, and next-step feedback ek common pipeline se aa sakte hain.

### Production Bug You Solved

> Ek realistic bug tha ki client-side attempts ka score/status directly save ho sakta tha. Isse leaderboard/progress manipulate hone ka risk tha. Maine newer attempt/evaluator path me client score ignore karke server-side evaluation add kiya: `/api/users/attempts` input normalize karta hai, evaluator score/status calculate karta hai, then Attempt save hota hai. Contest legacy route abhi same migration ka next target hai.

### How You Improved Performance

> Dashboard me independent DB queries sequential chalane ke bajay `Promise.all` and Mongo aggregations use kiye. Attempts/progress ke liye indexes add kiye: userId+createdAt, userId+type, userId+status, userId+subjectId/unitId, and progress unique composite index. DB connection caching bhi add hai to avoid connection storms in Next.js runtime. Next optimization Monaco lazy loading and precomputed dashboard analytics hoga.

## 21. 15-Minute Quick Revision

- Project type: Next.js 14 full-stack App Router.
- Backend path: `app/api` route handlers, newer logic in `src/controllers/services/models`.
- Auth: NextAuth Credentials, bcrypt, JWT session, middleware route protection.
- DB: MongoDB primary for newer modules; Supabase legacy competition/profile/interview modules.
- Code execution: Judge0, base64, polling, Python/C++/Java.
- SQL: in-memory SQLite, SELECT-only basic blocking.
- AI: Gemini for assignment/hints/interview followups; static DB for core theory/MCQ/coding problem routes.
- Evaluation: deterministic rubrics for MCQ/coding/SQL, Gemini/fallback for written.
- Progress: Mongo Progress exists, but journey locking still localStorage.
- Biggest weakness: client-trusted scores in legacy competitions/duels/standoffs.
- Payment: PayU checkout hash only; no webhook verification/subscription activation.
- Testing: 7 Jest suites, 23 tests pass; typecheck passes.
- CI: npm ci, lint non-blocking, typecheck, test; no build step.
- Docker: standalone Next image plus compose app/mongo/redis; Redis mismatch with Upstash rate limit.
- Best honest line: "Strong MVP with production patterns, but migration and hardening are still needed."

## 22. Backend + Frontend Integration Questions

### Q62. [HIGH PRIORITY] How does frontend save attempts?

Expected answer: Shared helper `lib/userAttempts.ts` calls `/api/users/attempts` and `/api/users/progress`. Components like `MCQGate`, `CodingChallenge`, `SQLChallenge`, `FrontendEditor`, and `PersonalizedAssignment` use it after user completes activity.

Follow-up: "Can frontend fake attempt data?"  
Answer: Payload is client-origin, but newer `createAttempt()` normalizes and re-evaluates many cases. Still, code execution paths that only send already-computed results are weaker than `/api/code/submit`.

Interviewer mindset: Trust boundary between UI and API.

### Q63. How does frontend handle authenticated user?

Expected answer: `AuthProvider` wraps app with NextAuth `SessionProvider`, `useAuth()` exposes session user, Navigation switches menu based on `isAuthenticated`. Legacy pages also call `ensureUserExists()` to map session/localStorage user to Supabase UUID.

Follow-up: "Problem with dual identity?"  
Answer: NextAuth Mongo user id and Supabase UUID can diverge; migration should remove duplicate identity mapping.

Interviewer mindset: Identity consistency.

### Q64. [HIGH PRIORITY] Why do some API calls send userId even though auth exists?

Expected answer: Legacy client pages pass `userId` to contest/marathon/duel APIs, but current route code often ignores body userId and uses `requireSessionDatabaseUserId()`. Some older pages still show userId in payload due MVP history.

Follow-up: "Should API ever trust body userId?"  
Answer: No. Authenticated user should come from session only.

Interviewer mindset: Authorization basics.

### Q65. How does dashboard integrate backend data?

Expected answer: Server component gets session using `getServerSession(authOptions)`, redirects if missing, calls `getDashboardStats(session.user.id)`, then renders stats, timeline, attempt mix, weak topics.

Follow-up: "Why good?"  
Answer: No client loading waterfall for dashboard; DB query happens server-side.

Interviewer mindset: Server-side data fetching.

### Q66. What happens if `/api/gemini/coding-problem` has no static problem?

Expected answer: It returns 404 with problem null and note that Gemini fallback is disabled. UI shows error/fallback path.

Follow-up: "Why test coverage matters?"  
Answer: `learning-question-coverage.test.ts` checks every basic/medium/hard route has matching practice question.

Interviewer mindset: Content completeness.

## 23. Deployment, DevOps, Monitoring, Logging

### Q67. [HIGH PRIORITY] What deployment setup is present?

Expected answer: `next.config.js` has standalone output, Dockerfile builds standalone server, docker-compose runs app with Mongo and Redis, README targets Vercel + MongoDB Atlas + Upstash. GitHub Actions CI exists.

Follow-up: "What is missing?"  
Answer: No actual deploy workflow file found, no build step in CI, no health check route, no production monitoring integration.

Interviewer mindset: DevOps realism.

### Q68. How is logging implemented?

Expected answer: `src/lib/logger.ts` creates Pino logger with env/app base fields and child loggers. Controllers/services like auth, code, evaluator, Judge0, rate limit log events.

Follow-up: "Weakness?"  
Answer: Many legacy routes still use `console.error`; no request id/correlation id, no centralized log middleware.

Interviewer mindset: Observability maturity.

### Q69. What monitoring would you add?

Expected answer: API latency by route, error rate, Judge0 latency/timeouts, Gemini quota/errors, Mongo query latency/connections, rate-limit hits, signup/login failures, payment callback failures, leaderboard update failures.

Follow-up: "Where to start?"  
Answer: Add request id and structured logs to all API routes, then integrate error tracking and metrics.

Interviewer mindset: Production readiness.

### Q70. [HIGH PRIORITY] How would you add health checks?

Expected answer: Add `/api/health` with app version, DB ping, optional Redis/Gemini/Judge0 shallow status. Keep external checks lightweight and timeout quickly.

Follow-up: "Should health call Gemini generate content?"  
Answer: No, too expensive and slow. Use config presence or very rare diagnostic endpoint.

Interviewer mindset: Deployment reliability.

### Q71. What should CI change?

Expected answer: Make lint blocking, add `npm run build`, maybe add coverage threshold for critical services, add Playwright E2E later, cache npm already present.

Follow-up: "Why build?"  
Answer: Typecheck can pass but Next build can fail due route/runtime/config issues.

Interviewer mindset: Release safety.

## 24. Cost Optimization Questions

### Q72. [HIGH PRIORITY] Where will cost increase first?

Expected answer: Gemini calls and Judge0 executions. Gemini assignment/hints/reteach can be spammed; Judge0 per testcase execution can multiply quickly, especially contests.

Follow-up: "Current protection?"  
Answer: Some rate limit helpers exist, but not all Gemini/Judge0 routes use them. Static content reduces AI cost for theory/MCQ/coding problems.

Interviewer mindset: Cost-aware engineering.

### Q73. How to reduce AI cost?

Expected answer: Cache generated assignment/hints by subject/unit/subtopic/user context where safe, use static DB for common content, rate-limit AI routes, degrade gracefully, and avoid AI when deterministic rubric exists.

Follow-up: "What not to cache?"  
Answer: User-specific sensitive interview conversations without user scoping.

Interviewer mindset: Data privacy plus cost.

### Q74. How to reduce Judge0 cost/latency?

Expected answer: Run visible examples first, hidden tests only on final submit, concurrency limits, per-user rate limit, avoid rerunning same code/testcase hash quickly, async queue for contests.

Follow-up: "Risk of caching code results?"  
Answer: Must include language, code hash, stdin, expected output, compiler version in cache key.

Interviewer mindset: Practical scaling.

## 25. Extra Debugging Questions

### Q75. User cannot login after signup. Debug.

Expected answer: Check signup response, password validation, Mongo user created with passwordHash hashed by pre-save, NextAuth Credentials authorize calling login, NEXTAUTH_SECRET set, cookies set, callback URL. Also note dev login defaults `abc@abc.com/12345678` may not match seeded user if not created.

Follow-up: "Which file?"  
Answer: `app/(auth)/signup/page.tsx`, `src/controllers/auth.controller.ts`, `src/lib/auth.ts`.

Interviewer mindset: End-to-end auth debugging.

### Q76. Code passes locally but fails in Judge0.

Expected answer: Check language template, stdin format, stdout exact trim comparison, JSON vs space-separated input, compile output, Judge0 language id, expected output formatting.

Follow-up: "Which comparison?"  
Answer: `stdout.trim() === expectedOutput.trim()`.

Interviewer mindset: Testcase I/O discipline.

### Q77. Dashboard shows zero attempts though user submitted.

Expected answer: Check if attempt save returned 401/false, authenticated session exists, `/api/users/attempts` used Mongo user id, component is using legacy localStorage/Supabase path instead, and Attempt collection has docs with correct userId ObjectId.

Follow-up: "Silent issue?"  
Answer: `saveUserAttempt()` returns false and only warns in console, UI may continue.

Interviewer mindset: Silent failure debugging.

### Q78. Contest page shows sample contests in production.

Expected answer: Supabase not configured or query failed. Page falls back to `getFallbackContests()`. Check `NEXT_PUBLIC_SUPABASE_URL`, anon key, service role, schema tables, and logs from `lib/supabase.ts`.

Follow-up: "Production change?"  
Answer: Show degraded/outage state, not fake contest data.

Interviewer mindset: Data integrity.

### Q79. Typecheck passes but runtime route fails with env error.

Expected answer: Some modules throw at import if env missing (`src/lib/db.ts` requires MONGODB_URI, `src/lib/jwt.ts` requires JWT_SECRET). Ensure env vars are set in deployment and tests.

Follow-up: "Why tests pass?"  
Answer: `tests/setup.ts` sets test env secrets.

Interviewer mindset: Environment management.

### Q80. User sees "Query executed successfully" for wrong SQL.

Expected answer: Current `SQLChallenge` treats successful execution as completion and saves score 100. It does not compare expected rows in that flow. Need expected row metadata and evaluator SQL rubric.

Follow-up: "Where is better logic?"  
Answer: `src/lib/rubrics/sql.rubric.ts`.

Interviewer mindset: Correctness vs execution.

## 26. API Design and System Design Discussions

### Q81. Design production contest submission API for this repo.

Expected answer: `POST /api/contests/:id/submissions` with body `{ problemId, language, code }`. UserId from session. Server verifies contest live and user joined, fetches problem/testcases, runs Judge0, stores Submission, updates Participation score with max, returns graded result. No client score/status.

Follow-up: "Idempotency?"  
Answer: Use submission id/code hash, avoid double updating same accepted solution if retried.

Interviewer mindset: API contract quality.

### Q82. Design enterprise leaderboard.

Expected answer: Separate participation collection/table, index contestId+score desc+updatedAt. Update score async after judging. Cache top N in Redis, invalidate on score update. Keep full leaderboard paginated by cursor.

Follow-up: "Tie-breaker?"  
Answer: Higher score, fewer submissions, earlier accepted time.

Interviewer mindset: Scalable ranking.

### Q83. Design AI interview persistence.

Expected answer: Use existing `InterviewSession` Mongo model. Start route creates session, respond route receives sessionId/answer, verifies ownership, appends messages, calls Gemini, saves assistant message. Do not trust client-sent engineState for production.

Follow-up: "Current issue?"  
Answer: Stax route reconstructs `InterviewEngine` and sends engineState from client; persisted controller exists but not wired.

Interviewer mindset: Stateful workflow design.

### Q84. Design progress source of truth.

Expected answer: Mongo Progress should be canonical. UI fetches progress on journey load, derives locks from phasesCompleted. localStorage can cache only for optimistic UI and sync after API success.

Follow-up: "Migration risk?"  
Answer: Existing localStorage users may lose progress unless one-time sync imports local state.

Interviewer mindset: Data migration planning.

## 27. Common Mistakes Candidates Make

- Claiming "fully production ready" when repo has known legacy Supabase/localStorage and client-trusted scoring.
- Saying Google OAuth is implemented because env vars exist, while auth config only has CredentialsProvider.
- Saying all AI content is Gemini-generated, while theory/MCQ/coding-problem routes mostly use static DB.
- Saying all progress is MongoDB, while journey unlock uses localStorage.
- Saying PayU payment is complete, while webhook/hash verification and subscription activation are missing.
- Saying Redis local container powers rate limiting, while helper expects Upstash REST env vars.
- Saying all APIs follow same response shape, while legacy routes have custom JSON.
- Ignoring `src/` layered backend and only talking about `app/api`.
- Ignoring old `lib/` helpers and pretending migration is complete.
- Not mentioning tests/typecheck evidence.

## 28. Ownership and Leadership Questions

### Q85. How would you explain tech debt to your manager?

Expected answer: Main user-facing MVP works, but I would call out 4 production blockers: client-trusted competition scores, payment verification, mixed DB identity, and missing E2E/build CI. I would prioritize them by business risk.

Follow-up: "What would you do in one sprint?"  
Answer: Migrate contest submit to server-side grading, add PayU verification skeleton, make progress Mongo-backed for one learning flow, add CI build.

Interviewer mindset: Prioritization.

### Q86. How would you onboard another developer?

Expected answer: Start with README, then `docs/01` vs `docs/06` to explain migration, then show auth flow, attempt/evaluator flow, and legacy competition flow. Mention where not to add new code: avoid adding more Supabase/localStorage paths unless migration strategy says so.

Follow-up: "First task?"  
Answer: Small task like add rate limit and response wrapper to one Gemini route.

Interviewer mindset: Collaboration.

### Q87. What would you refuse to ship?

Expected answer: Paid plan activation without PayU verification, public leaderboard trusting client scores, and iframe preview with sensitive same-origin access in a production paid app.

Follow-up: "How to communicate?"  
Answer: Explain user/business risk and propose minimal safe alternative.

Interviewer mindset: Senior judgment.

