# 02 - Important Flows

## 1. Home To Learning Journey Flow

Simple version:

User opens the app, picks what they want to learn, and enters a learning path.

Code flow:

```text
app/page.tsx
  -> components/JourneyMap.tsx
    -> lib/subjects.ts
      -> /subject/[subjectId]
        -> /unit/[unitId]/journey
```

What happens:

1. Home page renders `JourneyMap`.
2. `JourneyMap` reads domains and subjects from `lib/subjects.ts`.
3. User clicks a subject.
4. App navigates to the subject page.
5. User opens a unit journey.
6. `GamifiedJourney.tsx` shows phases.

Interview line:

> The learning path is metadata-driven. I used `lib/subjects.ts` as the source of truth and dynamic Next.js routes to render each subject and unit.

## 2. Phase Routing Flow

Simple version:

The app checks which phase the user opened and shows the correct screen.

Code flow:

```text
app/subject/[subjectId]/unit/[unitId]/subtopic/[subtopicId]/[phase]/page.tsx
  -> ConceptLearning / MCQGate / CodingChallenge / SQLChallenge / PersonalizedAssignment
```

Phase mapping:

- `theory` -> `ConceptLearning`
- `mcq` -> `MCQGate`
- `basic`, `medium`, `hard` -> `CodingChallenge`
- DBMS coding phases -> `SQLChallenge`
- `assignment` -> `PersonalizedAssignment`

What can go wrong:

- Progress is mostly saved in `localStorage`.
- If DB sync is expected, it is not fully wired into every learning flow.

## 3. Theory Flow

Simple version:

User reads a topic explanation.

Code flow:

```text
ConceptLearning.tsx
  -> POST /api/gemini/theory
    -> app/api/gemini/theory/route.ts
      -> lib/theoryDatabase.ts
```

Important truth:

Even though the API name says `gemini`, theory mainly comes from local/static theory helpers.

Interview line:

> I kept theory loading behind an API abstraction, so the content source can be static now and AI-generated later without changing the frontend.

## 4. MCQ Flow

Simple version:

User answers quiz questions and must pass.

Code flow:

```text
MCQGate.tsx
  -> POST /api/gemini/mcq
    -> lib/mcqDatabase.ts
```

Extra AI routes:

```text
POST /api/gemini/reinforcement-mcq
POST /api/gemini/reteach
```

What happens:

1. MCQs load.
2. User selects answers.
3. Score is calculated.
4. Passing threshold is 70%.
5. Wrong answers can trigger reinforcement or re-teaching.

What can go wrong:

- Some fallback MCQs are generic.
- Re-teaching response is not deeply shown in the UI.

## 5. Coding Challenge Flow

Simple version:

User writes code and runs it against test cases.

Code flow:

```text
CodingChallenge.tsx
  -> POST /api/gemini/coding-problem
    -> lib/codingProblemDatabase.ts

CodingChallenge.tsx
  -> POST /api/judge0/execute
    -> app/api/judge0/execute/route.ts
      -> lib/judge0.ts
        -> Judge0
```

What happens:

1. Problem loads.
2. User writes Python, C++, or Java.
3. Code goes to Judge0.
4. Judge0 returns output.
5. App compares output with expected output.

What can go wrong:

- Many coding questions are generic array problems.
- JavaScript appears in some UI areas but `/api/judge0/execute` only supports Python, C++, and Java.

## 6. Frontend Challenge Flow

Simple version:

User writes HTML, CSS, JS, or React and sees preview.

Code flow:

```text
CodingChallenge.tsx
  -> FrontendEditor.tsx
    -> FrontendPreview.tsx
```

What happens:

1. User writes frontend code in Monaco tabs.
2. Preview renders inside an iframe.
3. Submit checks that some code exists.

What can go wrong:

- It does not deeply verify whether the UI meets requirements.
- Difficulty mismatch exists: question data uses `Hard`, but some flow passes `Advanced`.

## 7. SQL Challenge Flow

Simple version:

User writes SQL and sees query results.

Code flow:

```text
SQLChallenge.tsx
  -> POST /api/sql/execute
    -> SQLite in-memory database
```

What happens:

1. API creates temporary SQLite database.
2. Schema and seed data are loaded.
3. User query runs.
4. Rows are returned.

Security:

`/api/sql/execute` blocks dangerous commands and allows only `SELECT`.

What can go wrong:

- The flow mainly checks whether the query runs, not whether the answer is exactly correct.

## 8. Contest Flow

Simple version:

User joins a contest and submits code.

Code flow:

```text
app/contests/page.tsx
  -> /api/contests
  -> app/contests/[id]/page.tsx
  -> /api/contests/[id]/join
  -> /api/contests/[id]/submit
```

What can go wrong:

- The submit API trusts client-sent status and score.
- For production, scoring should happen on the server.

Interview line:

> The contest module exists as an MVP. To make it production-ready, I would move scoring fully server-side and prevent clients from submitting their own score.

## 9. Duel Flow

Simple version:

User finds an opponent and competes.

Code flow:

```text
app/duels/page.tsx
  -> POST /api/duels/find-opponent
    -> lib/database/duels.ts
```

What can go wrong:

- Server-side `ensureUserExists()` can return `temp-user`.
- Duel score is random in the detail page, so this is prototype logic.

## 10. Stax AI Interview Flow

Simple version:

User practices interview questions with an AI-like interviewer.

Code flow:

```text
app/stax-interview/page.tsx
  -> components/StaxInterviewer.tsx
    -> POST /api/stax/interview/start
    -> POST /api/stax/interview/respond
    -> POST /api/stax/interview/submit-code
```

Supporting files:

```text
lib/interviewQuestionnaire.ts
lib/interviewEngine.ts
lib/interviewAIHelper.ts
```

What can go wrong:

- The respond API recreates the interview engine on each request.
- Backend and AI/ML interview templates reuse frontend template placeholders.

## 11. Payment Flow

Simple version:

User selects a plan and goes to PayU checkout.

Code flow:

```text
app/pricing/page.tsx
  -> POST /api/payments/payu/checkout
    -> PayU form params and hash
```

What can go wrong:

- User data is hardcoded as test data.
- Payment success is not verified server-side.
- Subscription is not saved in database.

