# Interview Prep — Stax AI Tutor

> Daily prep for Shivam. Service-based company target (TCS/Infy/Wipro/Accenture/Cognizant).

---

## 30-Second Pitch (Memorize verbatim)

> "Sir, maine ek fullstack AI-powered learning platform banaya — Stax AI Tutor. Yeh students ke liye hai jo coding interviews aur placements ki preparation karte hain. Built with **Next.js 14 App Router, TypeScript, MongoDB with Mongoose, and Google Gemini AI**. Features include gamified learning journeys, MCQ quizzes, code execution via Judge0, SQL practice, AI-powered interview simulator, and contests. Authentication NextAuth.js + JWT + bcrypt. Rate limiting Redis se. Deployment Vercel pe with MongoDB Atlas."

## 1-Minute Architecture Pitch

> "Architecture **layered hai** — middleware → routes → controllers → services → models.
>
> - **Routes** (`app/api/`) — Next.js route handlers, thin HTTP plumbing
> - **Controllers** (`src/controllers/`) — business logic, validation, orchestration
> - **Services** (`src/services/`) — external integrations: Gemini, Judge0, Redis. Vendor swap kabhi karna ho — sirf service file change
> - **Models** (`src/models/`) — Mongoose schemas with indexes, validation, pre-save hooks
> - **Middleware** — auth (`requireAuth`), rate limit (`checkRateLimit`), error handler (`withErrorHandler`)
> - **Validators** (`src/validators/`) — Zod schemas, runtime type-safe
>
> Frontend Next.js App Router with React 18 — Server Components by default, Client Components selective (Monaco editor, forms). State: **Zustand** for global UI, **TanStack Query** for server state.
>
> Cross-cutting: **Pino** structured logger, **Upstash Redis** rate limiting, **JWT in HttpOnly cookie** session."

---

## Section 1: Next.js Deep Dive

### Q: Server Components vs Client Components?
> Server Components RSC — server pe render hote, JS client ko nahi jaata. Default in App Router. Data fetching directly server me — DB call, file read, env vars sab safe. Client Components `'use client'` directive se mark karte — useState, useEffect, browser API chahiye ho. Memorize: "Server by default, client when interactive."

### Q: App Router vs Pages Router?
> App Router (Next 13+) — folder structure routes, layouts nested, Server Components by default, streaming SSR, parallel routes, route groups. Pages Router old — `getStaticProps`/`getServerSideProps`, no streaming. Maine App Router use kiya — modern, RSC support, better TypeScript inference.

### Q: Route groups kya hain?
> Parentheses folder — `app/(auth)/login` URL `/login` banta, parens skip. Use case: same prefix wale routes alag layout share kare. Maine 3 groups banaye — `(auth)` centered card layout, `(dashboard)` sidebar layout, `(marketing)` public hero layout.

### Q: middleware.ts kya karta?
> Edge runtime me chalta — V8 isolate, sub-10ms cold start. Har request pe pehle yahi run hota. Maine use kiya route protection ke liye — `getToken()` se JWT cookie verify, no token → redirect `/login`. Matcher config se filter — static assets exclude.

### Q: Server Actions kya hain?
> Form submit ya mutation directly server function call kar sakte without explicit API route. `'use server'` directive. Maine selective use kiya — most flows me API routes hi rakhi for clarity + REST contract.

### Q: ISR / SSG / SSR?
> - **SSG** — build time pre-render (about page)
> - **ISR** — revalidate after N seconds (`revalidate: 60`)
> - **SSR** — every request (default for dynamic data)
> - **CSR** — client only (`'use client'` + fetch)
> Mera project — mostly SSR + CSR for dashboard, SSG for marketing pages.

### Q: Caching strategies?
> Next.js 4-layer cache:
> 1. **Router cache** — client-side, navigation
> 2. **Full Route Cache** — server, builds page once
> 3. **Data Cache** — `fetch()` deduplication + persistence
> 4. **Request Memoization** — same request in single render = 1 fetch
> Mera code TanStack Query se override karta for dynamic data.

---

## Section 2: MongoDB / Mongoose

### Q: Why MongoDB over SQL?
> Sir, data model document-shaped — user progress me nested `phasesCompleted` array, interview session me nested messages, submission me nested testResults. SQL me 5 tables banane padte, JOINs slow. Mongoose flexible schemas, indexes + validation, aggregation pipeline native.

### Q: Mongoose schema patterns?
> - **Required** fields, default values, enum constraints
> - **Pre-save hooks** — auto-hash password before insert
> - **toJSON transform** — strip sensitive fields from response
> - **Methods** — instance methods like `user.comparePassword(plain)`
> - **Statics** — model-level helpers
> - **Indexes** — single + compound, unique, sparse
> - **Virtuals** — derived fields not stored

### Q: Connection in serverless?
> Cold start har request pe naya connection = pool exhaustion. Maine `globalThis` me cache kiya — promise + connection dono. Hot-reload dev mode + Vercel serverless dono survive karte. Pattern:
> ```ts
> if (cached.conn) return cached.conn;
> if (!cached.promise) cached.promise = mongoose.connect(URI);
> cached.conn = await cached.promise;
> ```

### Q: Indexes kahaan lagaye?
> Query patterns ke hisab se:
> - **User.email** unique — login lookup
> - **Progress** compound `(userId, subjectId, unitId, subtopicId)` unique — duplicate prevent + dashboard fast
> - **Submission** `(userId, problemId, createdAt -1)` — history; `(contestId, score -1)` — leaderboard
> - **Contest** `startAt`, `endAt`, `(status, startAt)`
> - **User.stats.xp** desc — global leaderboard
>
> **Compound order:** equality fields pehle, range fields baad. Mongo ESR rule — Equality, Sort, Range.

### Q: Aggregation pipeline?
> Maine contest leaderboard pipeline use ki:
> ```js
> Contest.aggregate([
>   { $match: { _id } },
>   { $unwind: '$participants' },
>   { $sort: { 'participants.score': -1 } },
>   { $limit: 50 },
>   { $lookup: { from: 'users', localField: 'participants.userId', foreignField: '_id', as: 'user' } },
>   { $unwind: '$user' },
>   { $project: { ... } }
> ])
> ```
> Single round-trip, full data, indexed.

### Q: Embedding vs Referencing?
> - **Embed** when read together always, bounded size, < 16MB
> - **Reference** when independent updates, cross-entity access, unbounded
> Mera Contest me participants embedded (typical < 1000), but `userId` ref to User collection — denormalize name/avatar from user docs at query time via $lookup.

### Q: Transactions in Mongo?
> Replica set required. Maine atomic operators use kiye instead — `$inc`, `$max`, `$addToSet`, `findOneAndUpdate` with `upsert: true`. Race-condition safe without full transaction overhead.

---

## Section 3: Authentication & Security

### Q: Authentication flow end-to-end?
> 1. User signup → POST /api/auth/signup → controller validates Zod → User.create() → pre-save hook bcrypt hash
> 2. Auto signIn('credentials') → NextAuth authorize() callback → login controller → compare bcrypt
> 3. NextAuth signs JWT → HttpOnly cookie set
> 4. Subsequent request → middleware.ts getToken() decrypts cookie → token present → next()
> 5. API: requireAuth() → getServerSession() → user attached or 401

### Q: JWT vs Session-based?
> JWT — stateless, scalable, no DB hit per request, signed not encrypted (don't put secrets in payload). Session — DB hit per request, but easy invalidate. Maine NextAuth JWT strategy use ki — serverless friendly, no session store needed.

### Q: HttpOnly cookie kyun?
> JavaScript se cookie read nahi kar sakta → XSS attack me token chori nahi hoti. localStorage me token store = XSS vulnerable. SameSite=Lax → CSRF protection.

### Q: bcrypt kyun, kitne rounds?
> 12 rounds — current 2026 industry standard. Rainbow table proof (salt unique per password), slow-by-design (2^12 iterations) = brute force impractical. Higher rounds = slower login, balance security vs UX.

### Q: Password requirements?
> Zod schema — min 8, mixed case, digit. Bcrypt 72-char max. NIST guidelines — length > complexity (max 72 enforced). Future: HaveIBeenPwned API check.

### Q: Rate limiting strategy?
> Upstash Redis sliding window algorithm. Different limits per endpoint type — AI 10/min, code exec 20/min, auth 5/min. Key strategy — userId logged-in, IP anonymous. Sliding window vs fixed window — edge burst prevent.

### Q: CSRF protection?
> NextAuth built-in CSRF token — har state-changing request pe verify hota. SameSite=Lax cookie additional layer.

### Q: SQL injection / NoSQL injection?
> Mongoose typed schema — string field me `{ $ne: null }` operator inject nahi ho sakta unless explicitly allowed. Maine direct user input never use kiya as query operator — Zod validate, then Mongoose query.

### Q: What is OWASP Top 10 you addressed?
> - **A01 Broken Access** — requireAuth + role check
> - **A02 Crypto Failures** — bcrypt 12 rounds, JWT signed, HTTPS only
> - **A03 Injection** — Zod validation, parameterized queries via Mongoose
> - **A05 Misconfig** — `.env.example`, secrets gitignored
> - **A07 Auth Failures** — strong password policy, rate limit on /login

---

## Section 4: System Design (Light, Service-Based Friendly)

### Q: How would you scale this to 100K users?
> 1. **DB** — MongoDB Atlas M10+, read replicas for leaderboard queries
> 2. **CDN** — Vercel Edge / CloudFront for static + ISR pages
> 3. **Cache** — Redis for AI responses (semantic cache), session, leaderboard top-100
> 4. **Queue** — code submissions to BullMQ → workers process in background, frontend polls
> 5. **Sharding** — by userId if reach M40+
> 6. **Observability** — Datadog/Grafana, request tracing, AI cost dashboard

### Q: AI cost optimization?
> 1. Cache common questions (theory, MCQs) in Redis 24h
> 2. Semantic cache via embedding similarity for near-duplicate prompts
> 3. Use cheaper model (Gemini Flash) for simple tasks
> 4. Stream responses → user sees progress, abandons cheaper
> 5. Token budget per user per day

### Q: Code execution at scale?
> Self-host Judge0 cluster instead of RapidAPI — cost predictable. Queue submissions via BullMQ. Sandbox isolation — Docker per submission, network disabled, CPU/memory limits. Cleanup post-execution.

---

## Section 5: Project-Specific (Story telling)

### Q: Biggest challenge in this project?
> "Sir, jab project shuru kiya Supabase use kar raha tha. Halfway me realize hua MongoDB better fit hai — data document-shaped. Big-bang migration risky tha 80+ files. Maine **phased migration** approach liya:
> 1. Foundation layer — new folder structure, path aliases
> 2. DB layer — Mongoose models alongside old code
> 3. Auth replace — NextAuth + JWT
> 4. Services wrap — facade pattern around 928-LOC legacy gemini file
> 5. Controllers progressive — one feature at a time
> 6. Old code shimmed — backward compat
>
> Result — zero breaking change at each phase, typecheck green throughout. Mile signal — incremental refactor production me kaise kiya jaata."

### Q: What did you learn?
> 1. **Next.js App Router internals** — RSC, route groups, middleware Edge runtime
> 2. **Service-oriented architecture in monolith** — separation of concerns without microservices overhead
> 3. **MongoDB schema design** — when to embed vs reference, index design
> 4. **AI integration patterns** — wrapping + error handling + future caching
> 5. **Migration without downtime** — shim pattern, parallel implementations

### Q: What would you do differently?
> 1. Tests first — TDD for controllers would have caught edge cases earlier
> 2. OpenAPI spec from day 1 — frontend-backend contract
> 3. Feature flags — gradual rollout of new auth
> 4. Observability earlier — Sentry + Datadog from start

### Q: Why service-based companies?
> "Sir, abhi mera focus stack mastery hai — Next.js, Mongo, full backend lifecycle. Service company me diverse clients ke saath kaam mil jata, projects rotate. Foundation strong ho jayegi. Long-term product company shift kar sakta hu confidence ke saath."

---

## Section 6: Behavioral / HR

### Q: Tell me about a conflict.
> "Sir, ek bar feature deadline tight thi, lead chahta tha hardcoded fix. Maine respectfully suggest kiya — 'Sir, 2 ghante extra dena, proper fix ho jayega, tech debt nahi banegi.' Initially reluctant but maine breakdown share kiya — kitne future hours save honge. Agreed. Sikhа — technical decisions ko business value se justify karna."

### Q: Why this company?
> Customize per company. Template:
> "Sir, TCS/Infy/etc ka **client diversity** mujhe attractive lagi — banking, healthcare, e-commerce alag domain mil jate. Mera Stax project bhi cross-domain hai — content + payments + AI + competitions. Mujhe rotation se polish chahiye."

### Q: Strengths / Weaknesses?
> Strength — **Quick learner**. Angular se Next.js shift kiya 2 mahine me end-to-end project bana liya. Weakness — **Perfectionist tendency**, kabhi code refactor karte time-box bhul jaata. Counter — Pomodoro use karta, hard deadlines lagata kaam ko.

### Q: 5 years from now?
> Mid-level fullstack → tech lead → architect path. Specialize karna chahta scalable AI applications me. Companies ko AI-product launch karne me help karna.

---

## Section 7: Live Coding (Common Asks)

### Reverse a string
```js
function reverse(s) {
  return s.split('').reverse().join('');
  // or two-pointer for in-place
}
```

### Fibonacci memoized
```js
const memo = {};
function fib(n) {
  if (n < 2) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fib(n-1) + fib(n-2);
}
```

### Debounce
```js
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
```

### Promise.all polyfill
```js
function myAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(v => {
        results[i] = v;
        if (++done === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}
```

---

## Section 8: Quick-Fire Round (Memorize)

| Q | A |
|---|---|
| HTTP status 401 vs 403 | 401 = unauthenticated, 403 = authenticated but not allowed |
| GET vs POST | GET idempotent + cacheable, POST mutation |
| REST principles | Stateless, cacheable, uniform interface, layered, client-server |
| CORS | Cross-Origin Resource Sharing — browser security, preflight OPTIONS |
| useEffect vs useLayoutEffect | useEffect async after paint, useLayoutEffect sync before paint |
| key prop in lists | React reconciliation — stable identity for list items |
| Why immutable state in React | Reference equality === for re-render decision |
| async/await vs promises | Syntactic sugar, same Promise underneath |
| Closure | Function retains access to enclosing scope |
| Hoisting | var declarations hoisted, let/const TDZ |

---

## Daily Drill (30 min/day)

1. **5 min:** Recite 30-sec pitch out loud
2. **10 min:** Pick 3 random Qs from sections, answer aloud
3. **10 min:** Open one file from src/, explain line-by-line
4. **5 min:** Quick-fire round

---

## Common Pitfalls (DON'T do)

- ❌ Don't say "AI ne likha hai" — confidence death
- ❌ Don't memorize entire answer — sound robotic
- ❌ Don't claim production-grade — say MVP/showcase
- ❌ Don't say "I don't know" without offering reasoning — "I haven't used X but I'd start with..."
- ❌ Don't argue with interviewer
- ❌ Don't ramble — pause, structure answer

---

## Recovery phrases (when stuck)

- "Sir, let me think through this..."
- "I'd approach it by..."
- "Honestly, I haven't worked with X directly, but I know it's used for Y, so I'd..."
- "Can I think aloud here?"
