# 03 - Interview Guide

## 30-Second Answer

Stax AI Tutor is a full-stack Next.js learning platform for CS and interview preparation. Users choose domains like placement, frontend, backend, or AI/ML, then complete theory, MCQs, coding challenges, SQL practice, and assignments. It uses React, TypeScript, Tailwind, Supabase, Gemini, Judge0, SQLite, Monaco Editor, and PayU.

## 1-Minute Architecture Answer

The project uses Next.js App Router as a full-stack framework. Frontend routes are inside `app/`, reusable UI components are inside `components/`, backend APIs are inside `app/api/`, and shared services are inside `lib/`. The learning content is driven by `lib/subjects.ts`, which defines domains, subjects, units, and subtopics. The frontend calls API routes for theory, MCQs, coding problems, code execution, SQL execution, contests, payments, and AI interviews. External integrations like Gemini, Judge0, Supabase, SQLite, Hugging Face, and PayU are wrapped in helper files.

## Deep Technical Answer

When a user opens the app, `app/page.tsx` renders `JourneyMap`. `JourneyMap` reads domain and subject data from `lib/subjects.ts`. When the user chooses a subject and unit, dynamic routes render the learning journey. `GamifiedJourney.tsx` shows phases like theory, MCQ, coding, and assignment.

For theory, `ConceptLearning.tsx` calls `/api/gemini/theory`. For MCQs, `MCQGate.tsx` calls `/api/gemini/mcq`. For coding, `CodingChallenge.tsx` loads problems and sends code to `/api/judge0/execute`, which uses `lib/judge0.ts`. SQL practice calls `/api/sql/execute`, which creates an in-memory SQLite database. Supabase utilities exist for users, progress, stats, badges, and competition data.

I would call this a feature-rich MVP because the learning, AI, coding, SQL, and competition flows are implemented, but real auth, payment verification, and some validation flows still need production hardening.

## My Contribution Answer

My role was full-stack implementation and integration. I worked across the Next.js pages, reusable React components, API routes, Supabase utility layer, coding execution flow, AI-assisted learning features, and competition/interview modules. I can explain the complete flow from UI to API to database or external service. I would honestly describe the project as an MVP with strong feature coverage, while also acknowledging the parts that need production cleanup.

## Easy Questions

### What is this project?

It is a gamified AI learning platform for coding and interview preparation.

### Which framework is used?

Next.js with App Router and TypeScript.

### Where is the frontend?

Frontend pages are in `app/`, and reusable components are in `components/`.

### Where is the backend?

Backend APIs are implemented as Next.js route handlers inside `app/api/`.

### What is the most important file for learning structure?

`lib/subjects.ts`, because it defines domains, subjects, units, and subtopics.

## Medium Questions

### How does the learning flow work?

The user selects a domain and subject. The app reads metadata from `lib/subjects.ts`, opens a unit journey, and renders different phase components like theory, MCQ, coding, SQL, or assignment.

### How does code execution work?

The user writes code in Monaco Editor. The frontend sends the code to `/api/judge0/execute`. That API calls `lib/judge0.ts`, which sends the code to Judge0 and returns the result.

### How does SQL execution work?

The SQL API creates a temporary SQLite database, loads schema and sample data, runs the user's SELECT query, and returns rows.

### How is AI used?

Gemini is used for hints, assignments, re-teaching, reinforcement MCQs, and interview-related feedback. Some content still comes from local static databases.

### How is database access organized?

Supabase access is wrapped in `lib/database/*` files, such as `userStats.ts`, `userProgress.ts`, `contests.ts`, and `duels.ts`.

## Advanced Questions

### Why did you use Next.js API routes instead of Express?

Because this app is built as a full-stack Next.js MVP. API routes allow backend logic and frontend routes to live in the same project, which simplifies deployment and development.

### What are the weak points in the current project?

There is no real authentication, some progress is localStorage-based, the database schema is behind the code, payment verification is incomplete, and some validation is prototype-level.

### How would you make contest submissions secure?

I would never trust client-submitted status or score. The server should run the code, calculate score, save the submission, and update the leaderboard.

### How would you improve progress tracking?

I would make Supabase the source of truth for learning progress and use localStorage only as a temporary cache.

### How would you make the AI content reliable?

I would validate AI responses with schemas, cache generated content, add fallbacks, and store approved content in the database.

## Scenario-Based Questions

### If Judge0 is down, what happens?

Code execution fails. I would show a clear error, add retry logic, and optionally queue submissions for later execution.

### If a user refreshes the journey page and progress disappears, why?

Because progress is not consistently hydrated from Supabase/localStorage in every journey component.

### If PayU says payment succeeded, should we trust the frontend?

No. The backend should verify the payment using PayU response/hash/webhook before unlocking a plan.

### If two users submit contest code at the same time, how would you handle it?

I would store each submission separately, calculate score server-side, and use database ordering by score and time for leaderboard ranking.

## Debugging Questions

### Why can frontend hard challenges fail?

Because some code uses `Advanced` as difficulty, while the frontend/backend question database uses `Hard`.

### Why can duel scoring be wrong?

The duel detail page uses random score logic, so it is not a real execution-based score.

### Why can interview questions repeat?

The `/api/stax/interview/respond` route recreates the interview engine instead of restoring full previous state.

### Why can some Supabase queries fail?

The code expects some schema fields/tables that are not present in `supabase/schema.sql`.

## HR Questions

### Did you build everything yourself?

I understand the complete codebase and worked across the full-stack flow. I would describe it honestly as an MVP with multiple integrated modules, and I can explain both the implemented parts and the parts that need production hardening.

### What was the hardest part?

Connecting many different modules into one learning journey: subject metadata, dynamic routes, AI APIs, code execution, SQL execution, and progress tracking.

### What did you learn?

I learned how to structure a full-stack Next.js app, integrate external APIs, design reusable learning components, and identify the difference between MVP logic and production-ready logic.

## Best Interview Closing Line

> The strongest part of this project is the end-to-end learning experience. The honest improvement area is production hardening: real auth, server-side grading, schema migrations, payment verification, and better tests.

