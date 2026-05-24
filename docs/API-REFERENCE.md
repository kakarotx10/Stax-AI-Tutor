# API Reference — Stax AI Tutor

Base URL: `http://localhost:3000` (dev) / `https://your-app.vercel.app` (prod)

## Response Shape (Standard)

**Success:**
```json
{ "success": true, "data": <T> }
```

**Error:**
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} }
}
```

## Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal error |
| 502 | External service unavailable |

---

## Authentication

All `Authorization: Bearer <jwt>` OR `Cookie: next-auth.session-token=...`. Cookie set automatically by NextAuth.

### POST /api/auth/signup
**Rate limit:** 5/min per IP

**Body:**
```json
{
  "name": "Shivam Sharma",
  "email": "shivam@example.com",
  "password": "Pass@1234"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "65a...",
    "email": "shivam@example.com",
    "name": "Shivam Sharma",
    "role": "student"
  }
}
```

### POST /api/auth/callback/credentials
Handled by NextAuth. Use `signIn('credentials', { email, password })` in frontend.

### GET /api/auth/session
NextAuth provided. Returns current session or empty object.

### POST /api/auth/signout
NextAuth provided.

---

## Users

### GET /api/users/me
**Auth required**

**Response 200:**
```json
{ "success": true, "data": { "_id": "...", "email": "...", "name": "...", "stats": {...} } }
```

### GET /api/users/dashboard
**Auth required**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "role": "student",
      "loginCount": 7,
      "lastLoginAt": "2026-05-22T10:00:00.000Z",
      "lastActiveAt": "2026-05-22T10:10:00.000Z",
      "stats": {}
    },
    "perSubject": [
      { "_id": "dsa", "totalSubtopics": 30, "completed": 12, "avgMcqScore": 78.5 }
    ],
    "totals": {
      "totalSubtopics": 100,
      "completed": 25,
      "totalAttempts": 42,
      "successfulAttempts": 31,
      "failedAttempts": 9,
      "partialAttempts": 2
    },
    "attempts": {
      "summary": { "total": 42, "successful": 31, "failed": 9, "averageScore": 76 },
      "byType": [{ "type": "coding", "count": 20, "averageScore": 81 }],
      "byStatus": [{ "status": "accepted", "count": 18 }],
      "recent": [{ "id": "...", "type": "coding", "problemTitle": "Two Sum", "score": 100 }],
      "timeline": [{ "date": "2026-05-22", "attempts": 4, "averageScore": 75 }],
      "weakTopics": [{ "subjectId": "dsa", "subtopicId": "arrays", "failedCount": 3 }]
    }
  }
}
```

### GET /api/users/attempts
**Auth required**

Returns only the current user's saved attempts. Supports optional `type`, `status`, `subjectId`, `limit`, and `cursor`.

**Example:** `/api/users/attempts?type=coding&limit=20`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "userId": "...",
        "type": "coding",
        "subjectId": "dsa",
        "unitId": "arrays",
        "subtopicId": "two-sum",
        "phase": "basic",
        "problemTitle": "Two Sum",
        "language": "python",
        "status": "partial",
        "score": 50,
        "passedCount": 1,
        "totalCount": 2,
        "testResults": [
          { "passed": false, "input": "[1,2]", "expected": "2", "actual": "1" }
        ],
        "createdAt": "2026-05-22T10:10:00.000Z"
      }
    ],
    "nextCursor": null
  }
}
```

### POST /api/users/attempts
**Auth required**

Saves a MCQ, coding, SQL, assignment, or contest attempt for the current user. Client never sends `userId`; API uses the NextAuth session.

**Body:**
```json
{
  "type": "coding",
  "subjectId": "dsa",
  "unitId": "arrays",
  "subtopicId": "two-sum",
  "phase": "basic",
  "problemTitle": "Two Sum",
  "language": "python",
  "code": "print(1)",
  "status": "partial",
  "score": 50,
  "passedCount": 1,
  "totalCount": 2,
  "testResults": [
    { "passed": true, "input": "[1,2]", "expected": "2", "actual": "2" }
  ]
}
```

**Response 201:** saved Attempt doc.

### POST /api/users/progress
**Auth required**

**Body:**
```json
{
  "subjectId": "dsa",
  "unitId": "arrays",
  "subtopicId": "two-sum",
  "phase": "mcq",
  "mcqScore": 80
}
```

**Response 200:** updated Progress doc

---

## Code Execution

### POST /api/code/submit
**Auth required, rate limit:** 20/min per user

**Body:**
```json
{
  "problemId": "two-sum",
  "code": "def solve(): ...",
  "language": "python",
  "contestId": "65a..." // optional
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "submissionId": "65b...",
    "score": 100,
    "passed": 5,
    "total": 5,
    "status": "accepted",
    "testResults": [
      { "passed": true, "runtimeMs": 12, "expected": "...", "actual": "..." }
    ]
  }
}
```

**Key:** server runs every test case, score calculated server-side.

---

## Contests

### GET /api/v2/contests?status=live
**Auth required**

### POST /api/contests/{id}/join (legacy + v2)
**Body:** `{ "contestId": "..." }`

### POST /api/contests/{id}/submit
Server-graded via code controller. Updates participant.score atomically with `$max`.

---

## Interview (AI-powered)

### POST /api/stax/interview/start
**Body:**
```json
{ "type": "frontend", "topic": "react", "difficulty": "medium" }
```
**Response:** `{ sessionId, type, status }`

### POST /api/stax/interview/respond
**Body:** `{ sessionId, answer }`
**Response:** `{ sessionId, assistantMessage, feedback }`

Session persisted in Mongo `InterviewSession` collection — context preserved across requests.

---

## Learning (AI Content)

### POST /api/gemini/theory
**Rate limit:** 10/min per user
**Body:** `{ subject, unit }`

### POST /api/gemini/mcq
**Body:** `{ subject, unit, concept }`

### POST /api/gemini/reinforcement-mcq
**Body:** `{ concept, subject }`

---

## Error Codes

| Code | Meaning | HTTP |
|---|---|---|
| `VALIDATION_ERROR` | Zod parse failed | 400 |
| `AUTH_ERROR` | Not authenticated | 401 |
| `FORBIDDEN` | Authenticated but disallowed | 403 |
| `NOT_FOUND` | Resource missing | 404 |
| `CONFLICT` | Duplicate (e.g. email) | 409 |
| `RATE_LIMIT` | Too many requests | 429 |
| `EXTERNAL_SERVICE_ERROR` | Gemini/Judge0/HF down | 502 |
| `INTERNAL_ERROR` | Unhandled | 500 |

---

## Postman / curl Examples

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Shivam","email":"s@x.com","password":"Pass@1234"}'
```

### Login (NextAuth)
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=s@x.com&password=Pass@1234&csrfToken=..." \
  --cookie-jar cookies.txt
```

### Get dashboard (uses cookie from login)
```bash
curl http://localhost:3000/api/users/dashboard --cookie cookies.txt
```
