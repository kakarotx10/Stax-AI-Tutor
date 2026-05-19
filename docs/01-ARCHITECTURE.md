# 01 - Architecture

## Project Type

This is a full-stack Next.js project.

There is no separate `frontend/` folder and no separate Express `backend/` folder.

Instead:

```text
Frontend pages       -> app/
Reusable components  -> components/
Backend APIs         -> app/api/
Shared services      -> lib/
Database schema      -> supabase/schema.sql
```

## High-Level Architecture

```text
User Browser
  |
  | clicks pages, writes code, answers MCQs
  v
Next.js Frontend
  |
  | calls API routes
  v
Next.js API Routes
  |
  | use helper services
  v
Supabase / Gemini / Judge0 / SQLite / PayU
```

## Main Technologies

| Technology | Where Used | Why |
|---|---|---|
| Next.js | `app/`, `app/api/` | Pages and backend APIs in one project |
| React | `components/` | Interactive UI |
| TypeScript | Most files | Safer code with types |
| Tailwind CSS | `app/globals.css`, `tailwind.config.ts` | Styling |
| Framer Motion | UI components | Animations |
| Monaco Editor | Coding components | Browser code editor |
| Supabase | `lib/supabase.ts`, `lib/database/*` | Database |
| Gemini | `lib/gemini.ts` | AI hints, assignments, interview help |
| Judge0 | `lib/judge0.ts` | Run code |
| SQLite | SQL API routes | SQL practice |
| PayU | payment API | Checkout flow |

## Important Folders

### `app/`

This folder contains routes.

Important examples:

- `app/page.tsx` - home page
- `app/layout.tsx` - root layout with navigation and toast provider
- `app/profile/page.tsx` - profile page
- `app/pricing/page.tsx` - pricing page
- `app/contests/page.tsx` - contests list
- `app/duels/page.tsx` - duels page
- `app/standoffs/page.tsx` - standoffs page
- `app/marathons/page.tsx` - marathons page
- `app/interviews/page.tsx` - interview resources
- `app/stax-interview/page.tsx` - AI interview start page

Dynamic learning routes:

```text
app/subject/[subjectId]/page.tsx
app/subject/[subjectId]/unit/[unitId]/journey/page.tsx
app/subject/[subjectId]/unit/[unitId]/subtopic/[subtopicId]/[phase]/page.tsx
```

These routes make the learning path dynamic.

### `app/api/`

This is the backend.

In Express, you might call files "controllers". In this project, the controller-like files are `route.ts` files.

Important API groups:

- `app/api/gemini/*` - AI learning APIs
- `app/api/judge0/execute` - code execution
- `app/api/sql/execute` - SQL execution
- `app/api/code/execute` - unified execution
- `app/api/contests/*` - contest APIs
- `app/api/duels/*` - duel APIs
- `app/api/standoffs/*` - standoff APIs
- `app/api/marathons/*` - marathon APIs
- `app/api/interviews/*` - interview content APIs
- `app/api/stax/interview/*` - AI interviewer APIs
- `app/api/payments/payu/checkout` - PayU checkout

### `components/`

Reusable UI and feature components.

Important files:

- `Navigation.tsx` - top navigation
- `JourneyMap.tsx` - domain and subject selection
- `GamifiedJourney.tsx` - phase journey UI
- `ConceptLearning.tsx` - theory screen
- `MCQGate.tsx` - MCQ quiz screen
- `CodingChallenge.tsx` - coding challenge screen
- `FrontendEditor.tsx` - HTML/CSS/JS/React editor
- `FrontendPreview.tsx` - iframe preview
- `SQLChallenge.tsx` - SQL practice screen
- `PersonalizedAssignment.tsx` - assignment screen
- `StaxInterviewer.tsx` - AI interview UI
- `YouTubeVideos.tsx` - embedded learning videos

### `lib/`

Shared logic lives here.

Important files:

- `lib/subjects.ts` - all domains, subjects, units, subtopics
- `lib/gemini.ts` - Gemini AI integration
- `lib/huggingface.ts` - DeepSeek/Hugging Face verification
- `lib/judge0.ts` - Judge0 code execution helper
- `lib/supabase.ts` - Supabase client
- `lib/theoryDatabase.ts` - theory content
- `lib/mcqDatabase.ts` - MCQ content
- `lib/codingProblemDatabase.ts` - coding questions
- `lib/sqlDatabase.ts` - SQL questions and schemas
- `lib/frontendBackendQuestions.ts` - frontend/backend tasks
- `lib/pricing.ts` - pricing plans
- `lib/interviewEngine.ts` - interview evaluation logic
- `lib/interviewQuestionnaire.ts` - interview question templates
- `lib/interviewAIHelper.ts` - AI interview helper

### `lib/database/`

Database service layer.

Important files:

- `userManagement.ts` - creates/ensures user ID
- `userStats.ts` - XP, streak, rank, solved problems
- `userProgress.ts` - learning progress
- `badges.ts` - user badges
- `contests.ts` - contest data
- `duels.ts` - duel data
- `standoffs.ts` - standoff data
- `marathons.ts` - marathon data
- `interviews.ts` - interview posts/articles
- `profileSync.ts` - sync profile-related data

### `lib/types/`

These are TypeScript model-like files.

Examples:

- `contests.ts`
- `interviews.ts`
- `standoffs.ts`

### `supabase/`

Database schema.

Important file:

- `supabase/schema.sql`

This file creates tables for users, progress, stats, badges, contests, duels, standoffs, and marathons.

## Main Data Source

The most important file for learning structure is:

```text
lib/subjects.ts
```

It defines:

- Domains
- Subjects
- Units
- Subtopics
- XP
- YouTube video IDs

The UI reads this file and builds the learning journey.

## Backend Style

The backend style is:

```text
Frontend Component
  -> fetch/axios API call
    -> app/api/.../route.ts
      -> lib helper
        -> external API or database
```

Example:

```text
CodingChallenge.tsx
  -> POST /api/judge0/execute
    -> app/api/judge0/execute/route.ts
      -> lib/judge0.ts
        -> Judge0 API
```

## Database Architecture

The project uses Supabase PostgreSQL.

Main tables from `supabase/schema.sql`:

- `users`
- `user_progress`
- `user_stats`
- `user_badges`
- `contests`
- `contest_problems`
- `contest_participants`
- `contest_submissions`
- `duels`
- `standoffs`
- `marathons`
- `marathon_participants`

Important honest point:

Some code expects database fields/tables that are not fully present in `schema.sql`.

Examples:

- Competition code expects `domain` fields.
- Interview code expects interview tables.

So the schema needs migration updates.

## Authentication Architecture

There is no real authentication.

Current user handling:

```text
localStorage userId
  -> ensureUserExists()
    -> Supabase users table
```

Missing:

- Login
- Signup
- Password hashing
- JWT/session
- Protected routes
- Role-based access

## Interview Explanation

Say this:

> The architecture is a full-stack Next.js MVP. The frontend is built with App Router pages and reusable React components. Backend logic is implemented through Next.js API routes. Shared integrations like Gemini, Judge0, Supabase, SQLite, and PayU are isolated in the `lib/` layer. The learning content is metadata-driven through `lib/subjects.ts`, so routes can dynamically render subjects, units, subtopics, and learning phases.

