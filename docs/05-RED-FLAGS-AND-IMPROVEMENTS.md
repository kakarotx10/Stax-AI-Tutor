# 05 - Red Flags And Improvements

## Be Honest About These Points

This project is impressive as an MVP, but it is not fully production-ready.

You should confidently explain what exists, but avoid overclaiming.

## Red Flags

### 1. No Real Authentication

The project does not have login/signup.

Current flow:

```text
localStorage userId
  -> ensureUserExists()
  -> Supabase users table
```

Missing:

- Password hashing flow
- JWT/session
- Protected routes
- Role-based access

Do not claim:

> I implemented secure authentication.

Safe claim:

> The current MVP uses anonymous user tracking with Supabase utilities, and real authentication is a planned improvement.

### 2. Some Profile Data Is Demo Data

`app/profile/page.tsx` sets some hardcoded values like solved problems, streak, average time, and contest wins.

Do not claim:

> The profile dashboard shows fully accurate analytics.

Safe claim:

> The profile UI and sync structure exist, but some demo values should be replaced with real database-driven analytics.

### 3. Supabase Schema Needs Updates

`supabase/schema.sql` does not fully match the latest code.

Examples:

- Some competition code expects `domain` columns.
- Interview resources expect interview tables.

Safe claim:

> Supabase schema exists for core tables, but migrations need to be updated for all newer modules.

### 4. Contest Submission Is Not Fully Secure

Some contest APIs accept score/status from the client.

Problem:

```text
Client says: my score is 100
Server saves it
```

Production fix:

```text
Client sends code
Server runs code
Server calculates score
Server saves result
```

### 5. SQL Practice Checks Execution More Than Correctness

SQL execution works, but correctness validation is not deep enough.

Improvement:

- Compare result rows with expected rows.
- Compare edge cases.
- Add hidden SQL tests.

### 6. Frontend Challenges Are Weakly Validated

`FrontendEditor.tsx` mostly checks whether code exists.

Improvement:

- Use DOM tests.
- Check required elements.
- Check CSS behavior.
- Check React component output.

### 7. Duel Scoring Is Prototype Logic

Duel detail flow uses random score.

Do not claim:

> Duels have production-grade automated judging.

Safe claim:

> Duel UI and data flow exist, but scoring should be connected to Judge0 server-side.

### 8. Payment Flow Is Incomplete

PayU checkout hash generation exists.

Missing:

- Server-side payment verification
- Webhook/callback validation
- Plan activation in database

Safe claim:

> PayU checkout integration was added at the API level, but payment verification and subscription persistence remain future work.

### 9. Build Was Not Verified In Current Environment

`npm run build` failed because dependencies were not installed:

```text
sh: next: command not found
```

Fix:

```bash
npm install
npm run build
```

## Quick Improvements

Do these first:

1. Run `npm install`.
2. Run `npm run build`.
3. Add `.env.example`.
4. Fix frontend difficulty mismatch from `Advanced` to `Hard`.
5. Replace fake profile stats with Supabase values.
6. Sync learning progress to Supabase instead of only localStorage.
7. Remove unused dependencies.

## Frontend Improvements

- Add better loading skeletons.
- Improve mobile responsiveness.
- Make progress locking consistent.
- Add better error screens.
- Add real frontend challenge validation.

## Backend Improvements

- Add Zod validation to all API request bodies.
- Move contest scoring fully server-side.
- Add centralized API error handling.
- Add database migrations for missing fields/tables.
- Cache AI-generated content.

## Security Improvements

- Add Supabase Auth.
- Protect user-specific routes.
- Verify PayU payments server-side.
- Never trust client-submitted score/status.
- Add rate limiting for AI and code execution APIs.

## Performance Improvements

- Cache static learning content.
- Lazy-load Monaco Editor.
- Reduce large client bundles.
- Avoid unnecessary polling where Supabase realtime is enough.

## Testing Improvements

- Add unit tests for `lib/` helpers.
- Add API route tests.
- Add Playwright tests for learning flow.
- Add test cases for SQL validation.
- Add contest submission tests.

## Best Honest Interview Line

> The project is a strong full-stack MVP. I can explain the complete architecture and flows, and I also know exactly what needs to be improved before production: authentication, server-side grading, schema migrations, payment verification, and tests.

