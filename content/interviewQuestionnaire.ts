/**
 * Interview Questionnaire — Stax AI Tutor
 *
 * Structured question banks with rubrics. Each question carries:
 *  - a sharp prompt in a senior-engineer voice (no filler, no "let me…")
 *  - a rubric with observable expectedPoints, concrete redFlags, and goodIndicators
 *  - branching: `nextQuestionIfGood/Weak/Ok` for adaptive flow
 *
 * IDs are stable — the StaxInterviewer state machine references them.
 */

export type InterviewTemplate = 'sde-placement' | 'frontend-sde' | 'backend-sde' | 'aiml-engineer'
export type QuestionSection = 'intro' | 'resume' | 'dsa' | 'cs-fundamentals' | 'system-design' | 'closing'
export type QuestionLevel = 'easy' | 'medium' | 'hard'
export type AnswerQuality = 'weak' | 'ok' | 'strong'

export interface QuestionRubric {
  expectedPoints: string[]
  redFlags: string[]
  goodIndicators: string[]
  minPointsForStrong: number
}

export interface Question {
  id: string
  section: QuestionSection
  topic: string
  prompt: string
  rubric: QuestionRubric
  level: QuestionLevel
  nextQuestionIfGood?: string
  nextQuestionIfWeak?: string
  nextQuestionIfOk?: string
  drillDownQuestions?: string[]
  isCoding?: boolean
  codingChallenge?: {
    problem: string
    constraints: string[]
    expectedApproach?: string[]
    commonPitfalls?: string[]
    testCases?: Array<{ input: string; output: string }>
  }
}

export interface InterviewTemplateConfig {
  id: InterviewTemplate
  name: string
  domain: 'placement' | 'frontend' | 'backend' | 'aiml'
  description: string
  questions: Question[]
  startQuestionId: string
}

export interface AnswerEvaluation {
  quality: AnswerQuality
  score: number
  matchedPoints: string[]
  missingPoints: string[]
  redFlagsFound: string[]
  feedback: string
}

// ─────────────────────────────────────────────────────────────────────
// SDE PLACEMENT — primary placement-prep template
// ─────────────────────────────────────────────────────────────────────

export const SDE_PLACEMENT_TEMPLATE: InterviewTemplateConfig = {
  id: 'sde-placement',
  name: 'SDE Placement Interview',
  domain: 'placement',
  description:
    'End-to-end placement loop covering self-intro, project deep-dive, DSA coding, and CS fundamentals (OS, DB, networking, OOP).',
  startQuestionId: 'intro-1',
  questions: [
    // ──────────── INTRO ────────────
    {
      id: 'intro-1',
      section: 'intro',
      topic: 'self-introduction',
      prompt:
        "Walk me through your background — education, what you've built, and one technical area you'd say you're strongest in. Keep it under 90 seconds.",
      rubric: {
        expectedPoints: [
          'education and current year',
          'one or two concrete projects',
          'named technologies (not buzzwords)',
          'clear self-identified strength',
        ],
        redFlags: [
          'memorized speech with no specifics',
          'lists 10+ technologies with no project tying them together',
          'starts with personal history before technical context',
        ],
        goodIndicators: [
          'leads with one strong project',
          'comfortable naming trade-offs',
          'time-boxed answer under 90 seconds',
        ],
        minPointsForStrong: 3,
      },
      level: 'easy',
      nextQuestionIfGood: 'intro-2',
      nextQuestionIfOk: 'intro-2',
      nextQuestionIfWeak: 'intro-1-followup',
    },
    {
      id: 'intro-1-followup',
      section: 'intro',
      topic: 'self-introduction-clarification',
      prompt:
        "Pick the single project you're most proud of. What was the problem, what did *you* build, and how would you measure whether it worked?",
      rubric: {
        expectedPoints: ['well-defined problem', 'their actual contribution (not team)', 'a measurable outcome'],
        redFlags: ['speaks in "we" without separating their work', 'no observable success metric'],
        goodIndicators: ['names a specific bug, feature, or system', 'mentions users / performance / correctness'],
        minPointsForStrong: 2,
      },
      level: 'easy',
      nextQuestionIfGood: 'intro-2',
      nextQuestionIfOk: 'intro-2',
      nextQuestionIfWeak: 'intro-2',
    },
    {
      id: 'intro-2',
      section: 'intro',
      topic: 'why-this-role',
      prompt:
        'What kind of engineering work pulls you in — systems, product, infra, ML, frontend? Pick one and tell me what about it interests you specifically.',
      rubric: {
        expectedPoints: [
          'picks a specific domain rather than "anything"',
          'reasoning rooted in past work or curiosity',
          'awareness of what the day-to-day looks like',
        ],
        redFlags: ['"I am open to anything"', 'reasoning is purely compensation- or prestige-driven'],
        goodIndicators: ['concrete recent technical encounter', 'self-aware about gaps'],
        minPointsForStrong: 2,
      },
      level: 'easy',
      nextQuestionIfGood: 'resume-1',
      nextQuestionIfOk: 'resume-1',
      nextQuestionIfWeak: 'resume-1',
    },

    // ──────────── RESUME DEEP DIVE ────────────
    {
      id: 'resume-1',
      section: 'resume',
      topic: 'project-overview',
      prompt:
        'Take your most technically interesting project. Tell me: the problem, the architecture you landed on, one trade-off you made, and what you would change today with hindsight.',
      rubric: {
        expectedPoints: [
          'problem framed in user/business terms, not features',
          'architecture sketched at component level (services, DB, queues)',
          'a named trade-off (e.g. consistency vs latency)',
          'self-critique grounded in operational experience',
        ],
        redFlags: [
          'narrates resume bullets verbatim',
          'every choice was "best practice"; no real trade-off named',
          'no awareness of how it would fail under load',
        ],
        goodIndicators: ['names a tool and an alternative they rejected', 'discusses a bug that taught them'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'resume-2',
      nextQuestionIfOk: 'resume-2',
      nextQuestionIfWeak: 'resume-1-followup',
      drillDownQuestions: ['resume-1-tech', 'resume-1-challenge'],
    },
    {
      id: 'resume-1-followup',
      section: 'resume',
      topic: 'project-clarification',
      prompt:
        'Zoom in. Name the single most technically tricky thing *you* implemented in that project — a function, a query, a config — and walk me through it.',
      rubric: {
        expectedPoints: ['identifies a specific code-level contribution', 'explains the why, not just the what'],
        redFlags: ['stays at architecture-diagram level', 'cannot identify their own commits'],
        goodIndicators: ['references a file/function/PR they can describe in detail'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'resume-2',
      nextQuestionIfOk: 'resume-2',
      nextQuestionIfWeak: 'resume-2',
    },
    {
      id: 'resume-1-tech',
      section: 'resume',
      topic: 'technical-deep-dive',
      prompt:
        'You picked [TECHNOLOGY] for that project. Why that one and not the closest alternative? Be honest if the answer is "it was already in the stack".',
      rubric: {
        expectedPoints: [
          'names a concrete alternative they considered',
          'cites a non-trivial property of the choice (perf, ecosystem, ops)',
          'acknowledges if the decision was inherited',
        ],
        redFlags: ['"it was the most popular"', 'invents a trade-off that does not apply to the tool'],
        goodIndicators: ['can name a failure mode of their pick'],
        minPointsForStrong: 2,
      },
      level: 'hard',
      nextQuestionIfGood: 'resume-2',
      nextQuestionIfOk: 'resume-2',
      nextQuestionIfWeak: 'resume-2',
    },
    {
      id: 'resume-1-challenge',
      section: 'resume',
      topic: 'challenges-overcome',
      prompt:
        'What was the longest you spent stuck on one bug or design problem in that project? How did you eventually unblock — debugging approach, who you asked, what changed?',
      rubric: {
        expectedPoints: ['narrates a real debugging sequence', 'names a hypothesis they ruled out', 'reflects on what would have been faster'],
        redFlags: ['"I just googled it"', 'no structured approach'],
        goodIndicators: ['mentions reading logs, bisecting, or reproducing minimally'],
        minPointsForStrong: 2,
      },
      level: 'medium',
      nextQuestionIfGood: 'resume-2',
      nextQuestionIfOk: 'resume-2',
      nextQuestionIfWeak: 'resume-2',
    },
    {
      id: 'resume-2',
      section: 'resume',
      topic: 'experience-discussion',
      prompt:
        'Tell me about your most recent internship or work experience. What was the codebase like on day one, and what was the single biggest thing you learned that you would never have picked up from coursework?',
      rubric: {
        expectedPoints: [
          'description of the codebase shape (size, language, tooling)',
          'a real lesson learned, not a generic platitude',
          'mention of process (PRs, code review, ops)',
        ],
        redFlags: ['stays purely at task-list level', 'no engagement with code quality or process'],
        goodIndicators: ['contrasts coursework with industrial realities'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'dsa-1',
      nextQuestionIfOk: 'dsa-1',
      nextQuestionIfWeak: 'dsa-1',
    },

    // ──────────── DSA ────────────
    {
      id: 'dsa-1',
      section: 'dsa',
      topic: 'arrays-two-sum',
      prompt:
        "Coding question — Two Sum. Given an int array `nums` and target `t`, return indices of the two values that sum to `t`. Start with the brute force, then optimize, and tell me time and space complexity for each.",
      rubric: {
        expectedPoints: [
          'states brute force O(n²) explicitly',
          'identifies hash map gives O(1) average lookup',
          'arrives at O(n) time / O(n) space',
          'handles "same element twice" edge case',
        ],
        redFlags: [
          'jumps to code without stating approach',
          'claims hash map is "always O(1)" with no nuance',
          'forgets to return indices (returns values)',
        ],
        goodIndicators: ['catches the single-pass build-and-check variant', 'asks clarifying questions about duplicates'],
        minPointsForStrong: 3,
      },
      level: 'easy',
      isCoding: true,
      codingChallenge: {
        problem:
          'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. Assume exactly one solution exists; cannot use the same element twice.',
        constraints: [
          '2 <= nums.length <= 10^5',
          '-10^9 <= nums[i], target <= 10^9',
          'Exactly one valid pair exists.',
        ],
        expectedApproach: [
          'Brute force: nested loops, O(n²) time, O(1) space.',
          'Optimized: single pass with hash map keyed value→index, O(n) time, O(n) space.',
        ],
        commonPitfalls: [
          'Pairing an element with itself (must check distinct indices).',
          'Returning values instead of indices.',
          'Not handling negative numbers or zero.',
        ],
        testCases: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
          { input: 'nums = [3,3], target = 6', output: '[0,1]' },
        ],
      },
      nextQuestionIfGood: 'dsa-2',
      nextQuestionIfOk: 'dsa-2',
      nextQuestionIfWeak: 'dsa-1-followup',
    },
    {
      id: 'dsa-1-followup',
      section: 'dsa',
      topic: 'arrays-hint',
      prompt:
        'Suppose I told you the lookup `does this complement exist?` could be O(1) instead of O(n). What data structure gets you there, and how does that change the overall time complexity?',
      rubric: {
        expectedPoints: ['hash map / hash table / dictionary by name', 'connects O(1) lookup to O(n) total time'],
        redFlags: ['cannot identify the structure even after the hint'],
        goodIndicators: ['mentions amortized cost or hash collision risk unprompted'],
        minPointsForStrong: 1,
      },
      level: 'easy',
      nextQuestionIfGood: 'dsa-2',
      nextQuestionIfOk: 'dsa-2',
      nextQuestionIfWeak: 'dsa-2',
    },
    {
      id: 'dsa-2',
      section: 'dsa',
      topic: 'linked-list-reverse',
      prompt:
        'Reverse a singly linked list in place. Walk me through the pointer choreography out loud — what pointers do you hold, in what order do you move them, and what is the loop invariant?',
      rubric: {
        expectedPoints: [
          'three pointers: prev, curr, next',
          'order matters: save next BEFORE rewiring curr.next',
          'O(n) time, O(1) space iterative; or O(n) stack recursive',
          'mentions handling the empty / single-node case',
        ],
        redFlags: [
          'loses reference to the rest of the list',
          'says "O(1) recursive"',
          'confuses singly vs doubly linked list',
        ],
        goodIndicators: ['articulates an explicit loop invariant', 'discusses head pointer return at the end'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      isCoding: true,
      codingChallenge: {
        problem: 'Given the head of a singly linked list, reverse the list in place and return the new head.',
        constraints: ['0 <= number of nodes <= 5000', '-5000 <= node.val <= 5000'],
        expectedApproach: [
          'Iterative: `prev = null`, walk forward saving `next = curr.next`, set `curr.next = prev`, advance.',
          'Recursive: reverse the tail, then point the second node back at the head.',
        ],
        commonPitfalls: [
          'Forgetting to save `curr.next` before rewriting it — drops the rest of the list.',
          'Returning `head` instead of `prev` at the end.',
          'Not handling head=null.',
        ],
        testCases: [
          { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]' },
          { input: '[1,2]', output: '[2,1]' },
          { input: '[]', output: '[]' },
        ],
      },
      nextQuestionIfGood: 'dsa-3',
      nextQuestionIfOk: 'dsa-3',
      nextQuestionIfWeak: 'dsa-2-followup',
    },
    {
      id: 'dsa-2-followup',
      section: 'dsa',
      topic: 'linked-list-hint',
      prompt:
        'Think of it as rewiring two adjacent nodes at a time. At any step you hold three things: what came before, where you are now, and what comes next. Why do you need all three?',
      rubric: {
        expectedPoints: ['needs prev for the rewire target', 'needs next to avoid losing the rest of the list'],
        redFlags: ['still thinks two pointers suffice'],
        goodIndicators: ['re-states the invariant cleanly'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'dsa-3',
      nextQuestionIfOk: 'dsa-3',
      nextQuestionIfWeak: 'cs-1',
    },
    {
      id: 'dsa-3',
      section: 'dsa',
      topic: 'binary-tree-traversal',
      prompt:
        'BFS vs DFS on a binary tree — pick one and tell me a concrete scenario where the other one would be wrong. Bonus: what is the memory cost of each on a balanced vs skewed tree?',
      rubric: {
        expectedPoints: [
          'BFS = queue, level-order; DFS = stack/recursion, pre/in/post-order',
          'BFS for shortest path on unweighted graphs / level-by-level work',
          'DFS for path enumeration, topological sort, cycle detection',
          'memory: BFS = O(width) ≈ O(n/2) at bottom; DFS = O(depth) ≈ O(log n) balanced, O(n) skewed',
        ],
        redFlags: ['"DFS is always faster"', 'cannot explain why memory cost differs'],
        goodIndicators: ['discusses iterative DFS to avoid stack overflow on skewed trees'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-1',
      nextQuestionIfOk: 'cs-1',
      nextQuestionIfWeak: 'cs-1',
      drillDownQuestions: ['dsa-3-implementation'],
    },
    {
      id: 'dsa-3-implementation',
      section: 'dsa',
      topic: 'dfs-implementation',
      prompt:
        'Implement preorder DFS of a binary tree twice — once recursive, once iterative with an explicit stack. Tell me why the iterative version pushes right child *before* left.',
      rubric: {
        expectedPoints: [
          'recursive base case + visit + recurse(left) + recurse(right)',
          'iterative with explicit stack',
          'pushes right child first so left pops next (preorder order)',
        ],
        redFlags: ['iterative version produces postorder by accident', 'forgets null checks'],
        goodIndicators: ['articulates that stack reverses order'],
        minPointsForStrong: 2,
      },
      level: 'hard',
      isCoding: true,
      codingChallenge: {
        problem: 'Given the root of a binary tree, return the preorder traversal (root, left, right) of its node values.',
        constraints: ['0 <= number of nodes <= 100', '-100 <= node.val <= 100'],
        expectedApproach: [
          'Recursive: visit, recurse(left), recurse(right). Base case: null → return.',
          'Iterative: stack, push root, while non-empty pop+visit, push right then left.',
        ],
        commonPitfalls: [
          'Pushing left first → produces wrong order.',
          'Skipping the null check before pushing children.',
          'Allocating the result list inside recursion in languages where it is costly.',
        ],
        testCases: [
          { input: 'root = [1,null,2,3]', output: '[1,2,3]' },
          { input: 'root = []', output: '[]' },
          { input: 'root = [1,2,3,4,5]', output: '[1,2,4,5,3]' },
        ],
      },
      nextQuestionIfGood: 'cs-1',
      nextQuestionIfOk: 'cs-1',
      nextQuestionIfWeak: 'cs-1',
    },

    // ──────────── CS FUNDAMENTALS ────────────
    {
      id: 'cs-1',
      section: 'cs-fundamentals',
      topic: 'operating-systems-processes-threads',
      prompt:
        'Process vs thread — what does the OS actually give each one, and where do they share state? Give me one scenario where multithreading is wrong and you would reach for multiple processes instead.',
      rubric: {
        expectedPoints: [
          'processes have isolated virtual address spaces',
          'threads share the address space and file descriptors of their process',
          'thread switch is cheaper than process switch; IPC vs shared memory',
          'scenario for processes: fault isolation, security boundary, GIL workaround in Python',
        ],
        redFlags: [
          '"threads are lightweight processes" with no further detail',
          'no mention of memory sharing semantics',
        ],
        goodIndicators: ['names a real product that uses multi-process for crash isolation (Chrome, Postgres)'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-2',
      nextQuestionIfOk: 'cs-2',
      nextQuestionIfWeak: 'cs-1-followup',
      drillDownQuestions: ['cs-1-deadlock'],
    },
    {
      id: 'cs-1-followup',
      section: 'cs-fundamentals',
      topic: 'process-thread-clarification',
      prompt:
        "Think of it this way: a process is the OS's unit of isolation, a thread is its unit of scheduling. Given that — when would you spin up two threads versus two processes for a CPU-bound task in Python?",
      rubric: {
        expectedPoints: [
          'mentions the GIL preventing true CPU parallelism on threads',
          'multiprocessing or subprocesses for parallel CPU work',
        ],
        redFlags: ['still says "use threads for CPU work in Python"'],
        goodIndicators: ['mentions PEP 703 / sub-interpreters / no-GIL builds'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-2',
      nextQuestionIfOk: 'cs-2',
      nextQuestionIfWeak: 'cs-2',
    },
    {
      id: 'cs-1-deadlock',
      section: 'cs-fundamentals',
      topic: 'deadlock',
      prompt:
        'Name the four Coffman conditions for deadlock. Then pick one and tell me a practical way to break it in an application that needs multiple locks.',
      rubric: {
        expectedPoints: [
          'mutual exclusion',
          'hold and wait',
          'no preemption',
          'circular wait',
          'practical mitigation: lock ordering, try-lock with timeout, deadlock detection',
        ],
        redFlags: ['lists conditions but cannot mitigate', 'invents extra conditions'],
        goodIndicators: ['proposes a deterministic lock-acquisition order'],
        minPointsForStrong: 4,
      },
      level: 'hard',
      nextQuestionIfGood: 'cs-2',
      nextQuestionIfOk: 'cs-2',
      nextQuestionIfWeak: 'cs-2',
    },
    {
      id: 'cs-2',
      section: 'cs-fundamentals',
      topic: 'database-acid',
      prompt:
        'Walk me through ACID — not just the words, but what each letter buys the application. Then tell me one property that NoSQL stores typically weaken, and why that trade buys them scale.',
      rubric: {
        expectedPoints: [
          'Atomicity — all-or-nothing transaction',
          'Consistency — invariants/constraints preserved across the transaction',
          'Isolation — concurrent transactions appear sequential',
          'Durability — committed data survives a crash',
          'NoSQL often weakens isolation or consistency for horizontal scale',
        ],
        redFlags: ['mixes up Consistency (ACID) with Consistency in CAP', 'cannot give an example of a transaction'],
        goodIndicators: ['names an isolation level (READ COMMITTED, SERIALIZABLE) and a known anomaly'],
        minPointsForStrong: 4,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-3',
      nextQuestionIfOk: 'cs-3',
      nextQuestionIfWeak: 'cs-2-followup',
    },
    {
      id: 'cs-2-followup',
      section: 'cs-fundamentals',
      topic: 'acid-clarification',
      prompt:
        'Suppose a bank transfer transaction debits account A and crashes before crediting B. Which ACID property kicks in, and what mechanism does the database use to enforce it?',
      rubric: {
        expectedPoints: ['Atomicity', 'write-ahead log / undo log / rollback'],
        redFlags: ['says the money is "lost"'],
        goodIndicators: ['mentions WAL or transaction log by name'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-3',
      nextQuestionIfOk: 'cs-3',
      nextQuestionIfWeak: 'cs-3',
    },
    {
      id: 'cs-3',
      section: 'cs-fundamentals',
      topic: 'networking-tcp-udp',
      prompt:
        'TCP vs UDP — what does each give you and what does each refuse to give you? Then tell me which one a multiplayer game would use for player position updates and why.',
      rubric: {
        expectedPoints: [
          'TCP: ordered, reliable, congestion-controlled, connection-oriented',
          'UDP: unreliable, unordered, connectionless, lower latency',
          'TCP for HTTP/SSH/email; UDP for DNS/VoIP/games/real-time',
          'game positions on UDP because stale data is worthless — drop it, send the next one',
        ],
        redFlags: ['"UDP has no use cases anymore"', 'thinks HTTP/3 is "TCP-based"'],
        goodIndicators: ['mentions HTTP/3 / QUIC running on UDP'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-4',
      nextQuestionIfOk: 'cs-4',
      nextQuestionIfWeak: 'cs-3-followup',
    },
    {
      id: 'cs-3-followup',
      section: 'cs-fundamentals',
      topic: 'tcp-udp-clarification',
      prompt:
        'For a live video call: you can either retransmit a lost packet (and play it late), or drop it and continue with the next frame. Which choice maps to TCP vs UDP, and which one wins for video?',
      rubric: {
        expectedPoints: ['retransmit → TCP behaviour', 'drop and continue → UDP behaviour', 'video chooses drop'],
        redFlags: ['picks TCP for live video citing "reliability"'],
        goodIndicators: ['mentions buffer / jitter / playback deadline'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'cs-4',
      nextQuestionIfOk: 'cs-4',
      nextQuestionIfWeak: 'cs-4',
    },
    {
      id: 'cs-4',
      section: 'cs-fundamentals',
      topic: 'oops-polymorphism',
      prompt:
        'Compile-time vs runtime polymorphism — give me one concrete code-level example of each in a language of your choice, and tell me which one is dispatched via a vtable.',
      rubric: {
        expectedPoints: [
          'compile-time = method/function overloading or templates/generics',
          'runtime = virtual dispatch via base-class pointer/reference',
          'runtime polymorphism uses the vtable',
          'gives concrete code (class hierarchy or template) — not just words',
        ],
        redFlags: ['confuses overloading with overriding', 'cannot name vtable'],
        goodIndicators: ['mentions language-specific keyword (`virtual`, `override`, `abstract`)'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'closing-1',
      nextQuestionIfOk: 'closing-1',
      nextQuestionIfWeak: 'cs-4-followup',
    },
    {
      id: 'cs-4-followup',
      section: 'cs-fundamentals',
      topic: 'polymorphism-clarification',
      prompt:
        'Picture a base class `Shape` with a virtual `area()` and two subclasses `Circle` and `Square`. When I call `area()` on a `Shape*` pointer, how does the runtime know which version to invoke?',
      rubric: {
        expectedPoints: ['each polymorphic object stores a pointer to its class\'s vtable', 'the vtable holds function pointers for virtual methods'],
        redFlags: ['cannot name vtable or vptr', '"the compiler figures it out"'],
        goodIndicators: ['mentions the cost (one extra indirection per virtual call)'],
        minPointsForStrong: 1,
      },
      level: 'medium',
      nextQuestionIfGood: 'closing-1',
      nextQuestionIfOk: 'closing-1',
      nextQuestionIfWeak: 'closing-1',
    },

    // ──────────── CLOSING ────────────
    {
      id: 'closing-1',
      section: 'closing',
      topic: 'questions-for-interviewer',
      prompt:
        "We're at time. What questions do you have for me — about the team, the code, the on-call rotation, anything?",
      rubric: {
        expectedPoints: ['asks one specific question grounded in something discussed'],
        redFlags: ['no questions', 'asks about salary/perks as the first thing', 'questions that are answered on the careers page'],
        goodIndicators: ['questions about engineering process, code review, on-call, growth'],
        minPointsForStrong: 1,
      },
      level: 'easy',
      nextQuestionIfGood: 'closing-2',
      nextQuestionIfOk: 'closing-2',
      nextQuestionIfWeak: 'closing-2',
    },
    {
      id: 'closing-2',
      section: 'closing',
      topic: 'final-thoughts',
      prompt:
        'Anything you want to add — something you wish I had asked, a project you did not get to mention, or a clarification on an earlier answer?',
      rubric: {
        expectedPoints: ['uses the time deliberately if they have a strong point to add'],
        redFlags: [],
        goodIndicators: ['concise, no padding'],
        minPointsForStrong: 0,
      },
      level: 'easy',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────
// FRONTEND SDE
// ─────────────────────────────────────────────────────────────────────

export const FRONTEND_SDE_TEMPLATE: InterviewTemplateConfig = {
  id: 'frontend-sde',
  name: 'Frontend SDE Interview',
  domain: 'frontend',
  description: 'Frontend-focused loop: JS internals, React mental model, performance, and one component-build question.',
  startQuestionId: 'intro-1',
  questions: [
    {
      id: 'intro-1',
      section: 'intro',
      topic: 'self-introduction',
      prompt:
        'Tell me about your frontend background. Which framework do you reach for first, and what is one quirk of it you have personally been bitten by?',
      rubric: {
        expectedPoints: ['names a primary framework with experience', 'a concrete quirk or footgun they hit', 'optional: comparison to alternatives'],
        redFlags: ['lists 6 frameworks with no depth', '"I just know HTML and CSS" for an SDE role'],
        goodIndicators: ['anecdote tied to a real bug or PR'],
        minPointsForStrong: 2,
      },
      level: 'easy',
      nextQuestionIfGood: 'frontend-1',
      nextQuestionIfOk: 'frontend-1',
      nextQuestionIfWeak: 'frontend-1',
    },
    {
      id: 'frontend-1',
      section: 'cs-fundamentals',
      topic: 'javascript-closure',
      prompt:
        'Define a closure in JavaScript. Then show me a one-liner where a closure causes a memory leak — what is held alive, and how would you fix it?',
      rubric: {
        expectedPoints: [
          'function + lexical environment definition',
          'a leak example: a long-lived callback closing over a large object',
          'fix: null out the reference, restructure the closure, weak references',
        ],
        redFlags: ['"a closure is a function" with no scope mention', 'cannot construct a leak example'],
        goodIndicators: ['mentions DevTools heap snapshot'],
        minPointsForStrong: 2,
      },
      level: 'medium',
      nextQuestionIfGood: 'frontend-2',
      nextQuestionIfOk: 'frontend-2',
      nextQuestionIfWeak: 'frontend-2',
    },
    {
      id: 'frontend-2',
      section: 'cs-fundamentals',
      topic: 'react-hooks',
      prompt:
        '`useState` vs `useEffect` vs `useMemo` — give me one sentence per hook on what it is for. Then: why does React enforce that hooks be called in the same order on every render?',
      rubric: {
        expectedPoints: [
          'useState — local component state',
          'useEffect — synchronization with external systems / side effects',
          'useMemo — cached derived value to avoid recomputation',
          'hooks identified by call order; conditional calls break the index→hook mapping',
        ],
        redFlags: ['useEffect "runs on every render" with no nuance', 'cannot explain the order constraint'],
        goodIndicators: ['mentions React\'s internal fiber linked list / `useReducer` for complex state'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'frontend-3',
      nextQuestionIfOk: 'frontend-3',
      nextQuestionIfWeak: 'frontend-3',
    },
    {
      id: 'frontend-3',
      section: 'cs-fundamentals',
      topic: 'react-rendering',
      prompt:
        'A parent component re-renders. What determines whether its children re-render? Tell me what `React.memo`, `useMemo`, and `useCallback` actually solve — and when each is a *premature* optimization.',
      rubric: {
        expectedPoints: [
          'children re-render by default when parent renders',
          '`React.memo` skips re-render if props are shallow-equal',
          '`useMemo`/`useCallback` stabilize references for memoized children',
          'premature: tiny components, primitive props, no measured perf problem',
        ],
        redFlags: ['"always wrap everything in useMemo"', 'cannot explain shallow equality'],
        goodIndicators: ['mentions Profiler tab or React DevTools highlighting'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'frontend-4',
      nextQuestionIfOk: 'frontend-4',
      nextQuestionIfWeak: 'frontend-4',
    },
    {
      id: 'frontend-4',
      section: 'dsa',
      topic: 'debounce-implementation',
      prompt:
        'Write a `debounce(fn, delayMs)` utility in vanilla JavaScript. After implementation, tell me how it differs from `throttle`, and which one you would use for a search input.',
      rubric: {
        expectedPoints: [
          'closure over a timer id',
          'clearTimeout + setTimeout on each call',
          'difference: debounce delays until silence; throttle fires at most once per window',
          'search input → debounce',
        ],
        redFlags: ['conflates debounce and throttle', 'forgets to clear the previous timer'],
        goodIndicators: ['handles `this` and arguments correctly', 'optional leading/trailing flag'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      isCoding: true,
      codingChallenge: {
        problem: 'Implement `debounce(fn, delayMs)`. The returned function delays calling `fn` until `delayMs` milliseconds have elapsed since the last invocation.',
        constraints: ['Vanilla JS, no libraries.', 'Preserve `this` and pass through arguments.'],
        expectedApproach: [
          'Closure holds a timer id.',
          'On each call: clear the pending timer, schedule a new one.',
          'Inside the timer, invoke `fn` with the latest arguments and correct `this`.',
        ],
        commonPitfalls: [
          'Using arrow function and losing `this` binding.',
          'Not clearing the previous timeout — produces throttle-like behavior.',
          'Capturing arguments from the wrong call.',
        ],
        testCases: [
          { input: 'debounce(() => count++, 100); call 5 times in 50ms; wait 200ms', output: 'count === 1' },
        ],
      },
      nextQuestionIfGood: 'closing-1',
      nextQuestionIfOk: 'closing-1',
      nextQuestionIfWeak: 'closing-1',
    },
    {
      id: 'closing-1',
      section: 'closing',
      topic: 'final-thoughts',
      prompt: "We're at time. Any questions for me about the team, the codebase, or the stack?",
      rubric: {
        expectedPoints: [],
        redFlags: ['no questions at all'],
        goodIndicators: ['questions about CI, design system, or product roadmap'],
        minPointsForStrong: 0,
      },
      level: 'easy',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────
// BACKEND SDE
// ─────────────────────────────────────────────────────────────────────

export const BACKEND_SDE_TEMPLATE: InterviewTemplateConfig = {
  id: 'backend-sde',
  name: 'Backend SDE Interview',
  domain: 'backend',
  description: 'Backend-focused loop: APIs, databases, concurrency, caching, and one design question.',
  startQuestionId: 'intro-1',
  questions: [
    {
      id: 'intro-1',
      section: 'intro',
      topic: 'self-introduction',
      prompt:
        'Walk me through your backend background. Which language and which storage system do you reach for first, and what is the largest dataset / RPS you have personally operated against?',
      rubric: {
        expectedPoints: ['primary language', 'primary database', 'a real production scale anchor (rows, QPS, latency target)'],
        redFlags: ['scale claims with no numbers', 'never operated a live service'],
        goodIndicators: ['mentions latency budget, error rate, or on-call experience'],
        minPointsForStrong: 2,
      },
      level: 'easy',
      nextQuestionIfGood: 'backend-1',
      nextQuestionIfOk: 'backend-1',
      nextQuestionIfWeak: 'backend-1',
    },
    {
      id: 'backend-1',
      section: 'cs-fundamentals',
      topic: 'rest-api-design',
      prompt:
        'Design the REST endpoints for a simple "todo" service supporting list, get-one, create, update, and delete. Then tell me which of those is *not* idempotent and what that implies for retries.',
      rubric: {
        expectedPoints: [
          'GET /todos, GET /todos/:id, POST /todos, PUT /todos/:id, DELETE /todos/:id',
          'POST is not idempotent — retries can duplicate',
          'idempotency keys or upsert-by-client-id pattern for safe retries',
        ],
        redFlags: ['uses verbs in URLs (`/getTodos`)', 'thinks all HTTP methods are idempotent'],
        goodIndicators: ['mentions PATCH for partial updates', 'discusses status codes (201, 204, 409)'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'backend-2',
      nextQuestionIfOk: 'backend-2',
      nextQuestionIfWeak: 'backend-2',
    },
    {
      id: 'backend-2',
      section: 'cs-fundamentals',
      topic: 'database-indexes',
      prompt:
        'You have a `users` table with 50M rows. Queries that filter by `(country, email)` are slow. Where would you put the index, what kind, and what happens if you reverse the column order?',
      rubric: {
        expectedPoints: [
          'composite B-tree index on (country, email)',
          'prefix property: index supports filters on `country` alone or `country, email`',
          'reversing to (email, country) supports `email` lookups but not `country`-only',
          'mentions index size / write amplification cost',
        ],
        redFlags: ['"just add an index on every column"', 'thinks index always helps writes'],
        goodIndicators: ['mentions partial / covering indexes', 'EXPLAIN ANALYZE awareness'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'backend-3',
      nextQuestionIfOk: 'backend-3',
      nextQuestionIfWeak: 'backend-3',
    },
    {
      id: 'backend-3',
      section: 'cs-fundamentals',
      topic: 'caching-strategies',
      prompt:
        'You put Redis in front of a slow read-mostly endpoint. A week later users report stale data. Diagnose: what are the three most likely root causes, and how would you fix each?',
      rubric: {
        expectedPoints: [
          'invalidation missed on writes — fix: write-through or explicit invalidate',
          'TTL too long — fix: shorten TTL or stale-while-revalidate',
          'stampede on cache miss — fix: request coalescing / single-flight',
        ],
        redFlags: ['"reinstall Redis"', 'no understanding of invalidation patterns'],
        goodIndicators: ['names a real pattern: cache-aside, write-through, write-behind'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'backend-4',
      nextQuestionIfOk: 'backend-4',
      nextQuestionIfWeak: 'backend-4',
    },
    {
      id: 'backend-4',
      section: 'system-design',
      topic: 'url-shortener',
      prompt:
        'Design a URL shortener like bit.ly. Walk me through: the data model, how you generate short codes at scale, the read/write ratio, and where caching helps.',
      rubric: {
        expectedPoints: [
          'data model: short_code → long_url + metadata',
          'short-code generation: base62 of an autoincrement id, or hash + collision check',
          'read-heavy workload, cache layer in front',
          'mentions analytics / click counts as a separate write path',
        ],
        redFlags: ['uses UUID-as-short-code (too long)', 'no discussion of read/write split'],
        goodIndicators: ['mentions custom short codes, expiration, abuse detection'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'closing-1',
      nextQuestionIfOk: 'closing-1',
      nextQuestionIfWeak: 'closing-1',
    },
    {
      id: 'closing-1',
      section: 'closing',
      topic: 'final-thoughts',
      prompt: "We're at time. Questions for me about the team, the deploy pipeline, or the on-call setup?",
      rubric: {
        expectedPoints: [],
        redFlags: ['no questions'],
        goodIndicators: ['operational questions (on-call, observability, deploy cadence)'],
        minPointsForStrong: 0,
      },
      level: 'easy',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────
// AI/ML ENGINEER
// ─────────────────────────────────────────────────────────────────────

export const AIML_ENGINEER_TEMPLATE: InterviewTemplateConfig = {
  id: 'aiml-engineer',
  name: 'AI/ML Engineer Interview',
  domain: 'aiml',
  description: 'ML loop: data + modelling fundamentals, one applied scenario, and a production pitfall.',
  startQuestionId: 'intro-1',
  questions: [
    {
      id: 'intro-1',
      section: 'intro',
      topic: 'self-introduction',
      prompt:
        'Tell me about your ML background. What is the largest model you have personally trained or fine-tuned, and what did the deployment path look like?',
      rubric: {
        expectedPoints: ['model class (regression, classification, transformer, ...)', 'dataset size', 'whether they shipped it (or only ran in notebook)'],
        redFlags: ['only Kaggle notebook experience claimed as "production"', 'cannot quantify model or data scale'],
        goodIndicators: ['mentions evaluation strategy, monitoring, or drift'],
        minPointsForStrong: 2,
      },
      level: 'easy',
      nextQuestionIfGood: 'aiml-1',
      nextQuestionIfOk: 'aiml-1',
      nextQuestionIfWeak: 'aiml-1',
    },
    {
      id: 'aiml-1',
      section: 'cs-fundamentals',
      topic: 'overfitting',
      prompt:
        'A model gets 99% accuracy on the train set and 60% on the validation set. Diagnose: what is happening, name three concrete mitigation strategies, and how would you decide which to try first?',
      rubric: {
        expectedPoints: [
          'overfitting diagnosis',
          'mitigations: more data, regularization (L1/L2/dropout), early stopping, simpler model, data augmentation',
          'decision rule: cheap fixes first (early stopping, regularization), then data, then architecture',
        ],
        redFlags: ['"increase the learning rate"', 'cannot name three distinct mitigations'],
        goodIndicators: ['mentions cross-validation, learning curves'],
        minPointsForStrong: 3,
      },
      level: 'medium',
      nextQuestionIfGood: 'aiml-2',
      nextQuestionIfOk: 'aiml-2',
      nextQuestionIfWeak: 'aiml-2',
    },
    {
      id: 'aiml-2',
      section: 'cs-fundamentals',
      topic: 'bias-variance',
      prompt:
        'Explain the bias-variance trade-off in concrete terms. Where does a deep neural network with millions of parameters sit on that spectrum, and what does that imply for how much data you need?',
      rubric: {
        expectedPoints: [
          'bias = systematic error from model simplicity',
          'variance = sensitivity to training data',
          'deep NN: very low bias, high variance without regularization',
          'requires large data or strong regularization to generalize',
        ],
        redFlags: ['confuses bias-variance with the statistical bias of an estimator'],
        goodIndicators: ['mentions double-descent phenomenon for modern over-parameterized models'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'aiml-3',
      nextQuestionIfOk: 'aiml-3',
      nextQuestionIfWeak: 'aiml-3',
    },
    {
      id: 'aiml-3',
      section: 'cs-fundamentals',
      topic: 'evaluation-metrics',
      prompt:
        'A spam classifier gets 99% accuracy. Why might that be useless? Walk me through precision, recall, and F1, and tell me which one you would optimize for a fraud-detection system.',
      rubric: {
        expectedPoints: [
          'class imbalance: 99% accuracy can be matched by predicting "not spam" always',
          'precision = TP / (TP + FP), recall = TP / (TP + FN), F1 = harmonic mean',
          'fraud detection: recall-heavy (missing fraud is expensive) — or precision-heavy depending on cost of false positives',
          'discuss precision-recall trade-off via threshold',
        ],
        redFlags: ['"accuracy is always the right metric"', 'confuses precision and recall'],
        goodIndicators: ['mentions PR-AUC vs ROC-AUC, calibration, business cost matrix'],
        minPointsForStrong: 3,
      },
      level: 'hard',
      nextQuestionIfGood: 'aiml-4',
      nextQuestionIfOk: 'aiml-4',
      nextQuestionIfWeak: 'aiml-4',
    },
    {
      id: 'aiml-4',
      section: 'system-design',
      topic: 'model-serving',
      prompt:
        'You trained a model offline that needs to serve 1,000 predictions per second with a p99 latency budget of 100ms. Walk me through how you would deploy it — runtime, hardware, caching, monitoring.',
      rubric: {
        expectedPoints: [
          'inference runtime: ONNX / TensorRT / vLLM / TorchServe',
          'batching strategy (dynamic batching vs latency budget)',
          'GPU vs CPU trade-off',
          'caching frequent inputs, A/B and shadow deployments',
          'monitoring: latency, throughput, drift, input distribution',
        ],
        redFlags: ['"just put it behind a Flask endpoint"', 'no monitoring story'],
        goodIndicators: ['mentions model quantization, KV cache, autoscaling on GPU'],
        minPointsForStrong: 4,
      },
      level: 'hard',
      nextQuestionIfGood: 'closing-1',
      nextQuestionIfOk: 'closing-1',
      nextQuestionIfWeak: 'closing-1',
    },
    {
      id: 'closing-1',
      section: 'closing',
      topic: 'final-thoughts',
      prompt: "We're at time. Questions for me about the team's ML platform, data pipeline, or research direction?",
      rubric: {
        expectedPoints: [],
        redFlags: ['no questions'],
        goodIndicators: ['questions about data tooling, eval infra, model lifecycle'],
        minPointsForStrong: 0,
      },
      level: 'easy',
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────
// Registry + helpers
// ─────────────────────────────────────────────────────────────────────

export const INTERVIEW_TEMPLATES: Record<InterviewTemplate, InterviewTemplateConfig> = {
  'sde-placement': SDE_PLACEMENT_TEMPLATE,
  'frontend-sde': FRONTEND_SDE_TEMPLATE,
  'backend-sde': BACKEND_SDE_TEMPLATE,
  'aiml-engineer': AIML_ENGINEER_TEMPLATE,
}

export function getTemplateByDomain(
  domain: 'placement' | 'frontend' | 'backend' | 'aiml'
): InterviewTemplateConfig {
  const templateMap: Record<string, InterviewTemplate> = {
    placement: 'sde-placement',
    frontend: 'frontend-sde',
    backend: 'backend-sde',
    aiml: 'aiml-engineer',
  }
  return INTERVIEW_TEMPLATES[templateMap[domain] || 'sde-placement']
}

export function getQuestionById(
  template: InterviewTemplateConfig,
  questionId: string
): Question | undefined {
  return template.questions.find((q) => q.id === questionId)
}
