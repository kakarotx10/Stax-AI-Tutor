/**
 * Coding Problem Database — Stax AI Tutor
 *
 * Hand-authored, LeetCode-grade problems. Each problem ships with:
 *  - Clean problem statement (intent, not just operation)
 *  - 2-3 examples with explanation
 *  - 5+ test cases covering edges (empty, single, negative, large)
 *  - Realistic constraints (n bounds, value ranges)
 *  - Progressive hints: brute force → optimization → final
 *
 * Problem keys are referenced by `getCodingProblem` below — preserve them.
 */

export interface CodingProblem {
  title: string
  description: string
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  testCases: Array<{
    input: string
    output: string
    description: string
  }>
  constraints: string[]
  hints: string[]
}

const codingProblemDatabase: Record<string, CodingProblem> = {
  // ─────────────────────────────────────────────────────────────
  // BASIC
  // ─────────────────────────────────────────────────────────────
  'basic-find-maximum': {
    title: 'Find Maximum Element',
    description:
      'Given a non-empty array of integers `nums`, return the largest value. Solve in a single pass — O(n) time, O(1) extra space. Avoid sorting; it is asymptotically worse.',
    examples: [
      {
        input: 'nums = [1, 5, 3, 9, 2]',
        output: '9',
        explanation: 'Walk the array, holding the running max. After visiting 9, no later element exceeds it.',
      },
      {
        input: 'nums = [-10, -5, -20, -1]',
        output: '-1',
        explanation: 'All values are negative. -1 is the largest (closest to zero).',
      },
      {
        input: 'nums = [42]',
        output: '42',
        explanation: 'Single-element array — the only element is the maximum.',
      },
    ],
    testCases: [
      { input: '[1, 5, 3, 9, 2]', output: '9', description: 'Mixed positives' },
      { input: '[-10, -5, -20, -1]', output: '-1', description: 'All negatives' },
      { input: '[42]', output: '42', description: 'Single element' },
      { input: '[7, 7, 7, 7]', output: '7', description: 'All duplicates' },
      { input: '[0, -1, -2, -3]', output: '0', description: 'Zero is the max' },
      { input: '[1000000, -1000000, 0]', output: '1000000', description: 'Boundary values' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^6 <= nums[i] <= 10^6'],
    hints: [
      'You only need one variable to track the running maximum.',
      'Initialize the max with `nums[0]`, then iterate from index 1.',
      'Sorting works but is O(n log n) — overkill when a linear pass suffices.',
    ],
  },

  'basic-count-elements': {
    title: 'Count Even Numbers',
    description:
      'Given an integer array `nums`, return the number of elements that are even. An integer is even iff `n % 2 === 0`. Handle negative numbers and zero correctly.',
    examples: [
      {
        input: 'nums = [1, 2, 3, 4, 5, 6]',
        output: '3',
        explanation: 'The even values are 2, 4, 6 — three in total.',
      },
      {
        input: 'nums = [-4, -3, 0, 7]',
        output: '2',
        explanation: '-4 and 0 are even. -3 and 7 are odd.',
      },
    ],
    testCases: [
      { input: '[1, 2, 3, 4, 5, 6]', output: '3', description: 'Mixed odd/even' },
      { input: '[-4, -3, 0, 7]', output: '2', description: 'Negatives + zero' },
      { input: '[]', output: '0', description: 'Empty array' },
      { input: '[1, 3, 5, 7]', output: '0', description: 'All odd' },
      { input: '[2, 4, 6, 8]', output: '4', description: 'All even' },
      { input: '[0]', output: '1', description: 'Zero alone' },
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^6 <= nums[i] <= 10^6'],
    hints: [
      'Zero is even — make sure your check handles it.',
      'Many languages return a negative number for `%` on negatives; using `=== 0` (or `== 0`) is portable.',
      'Bit trick: `(n & 1) === 0` is even (works for non-negative integers).',
    ],
  },

  'basic-fizzbuzz': {
    title: 'FizzBuzz',
    description:
      'Given an integer `n`, return an array of strings of length `n` where, for 1-indexed position `i`:\n  - `"FizzBuzz"` if `i` is divisible by both 3 and 5\n  - `"Fizz"` if only by 3\n  - `"Buzz"` if only by 5\n  - the string form of `i` otherwise.',
    examples: [
      {
        input: 'n = 5',
        output: '["1", "2", "Fizz", "4", "Buzz"]',
        explanation: 'Only index 3 is a multiple of 3, only index 5 is a multiple of 5.',
      },
      {
        input: 'n = 15',
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
        explanation: '15 is divisible by both 3 and 5, so position 15 is "FizzBuzz".',
      },
    ],
    testCases: [
      { input: '5', output: '["1","2","Fizz","4","Buzz"]', description: 'Small range' },
      { input: '3', output: '["1","2","Fizz"]', description: 'First Fizz' },
      { input: '15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', description: 'First FizzBuzz' },
      { input: '1', output: '["1"]', description: 'Single element' },
    ],
    constraints: ['1 <= n <= 10^4'],
    hints: [
      'Check the divisible-by-15 case first, otherwise it gets shadowed by the 3 and 5 cases.',
      'Use template strings or a builder pattern rather than repeated concatenation.',
      'Bonus: solve without using `%` — track three counters that reset.',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // MEDIUM
  // ─────────────────────────────────────────────────────────────
  'medium-two-sum': {
    title: 'Two Sum',
    description:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. You may assume exactly one solution exists, and you may not use the same element twice. Aim for O(n) time — the naive O(n²) double loop will time out at the upper bound.',
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9. Return their indices.',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6. Index 0 (3) cannot be paired with itself.',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'Duplicate values are allowed — they are at different indices.',
      },
    ],
    testCases: [
      { input: 'nums=[2,7,11,15], target=9', output: '[0,1]', description: 'Basic pair' },
      { input: 'nums=[3,2,4], target=6', output: '[1,2]', description: 'Skip first element' },
      { input: 'nums=[3,3], target=6', output: '[0,1]', description: 'Duplicate values' },
      { input: 'nums=[-1,-2,-3,-4,-5], target=-8', output: '[2,4]', description: 'All negatives' },
      { input: 'nums=[0,4,3,0], target=0', output: '[0,3]', description: 'Two zeros' },
      { input: 'nums=[1,2,3,4,5,6,7,8,9,10], target=19', output: '[8,9]', description: 'Pair at end' },
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Exactly one valid pair is guaranteed.',
    ],
    hints: [
      'Brute force: nested loops — O(n²). Will time out at the upper bound.',
      'Trade space for time: a hash map keyed by value → index lets you do single-pass lookup.',
      'For each `x`, ask the map for `target - x`. If found, you have your pair. Otherwise, store `x` and continue.',
    ],
  },

  'medium-reverse-array': {
    title: 'Reverse an Array In-Place',
    description:
      'Reverse a non-empty array of integers without allocating a second array. Modify the input in place and return it. Aim for O(n) time and O(1) extra space.',
    examples: [
      {
        input: 'nums = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'Swap pairs from outside in: (1,5), (2,4). The middle element (3) stays.',
      },
      {
        input: 'nums = [1, 2]',
        output: '[2, 1]',
        explanation: 'Single swap.',
      },
    ],
    testCases: [
      { input: '[1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', description: 'Odd length' },
      { input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]', description: 'Even length' },
      { input: '[42]', output: '[42]', description: 'Single element — unchanged' },
      { input: '[1, 1, 1, 1]', output: '[1, 1, 1, 1]', description: 'All duplicates' },
      { input: '[-1, 0, 1]', output: '[1, 0, -1]', description: 'Negatives and zero' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    hints: [
      'Use two pointers — one at each end — and swap inward.',
      'Stop when the pointers meet or cross.',
      'Languages that allow tuple swap (`a, b = b, a` in Python) make this a one-liner inside the loop.',
    ],
  },

  'medium-valid-parentheses': {
    title: 'Valid Parentheses',
    description:
      'Given a string `s` containing only the characters `()[]{}`, determine if it is well-balanced. Each opening bracket must be closed by the same type, in the correct order.',
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'Every opener has a matching closer in the right order.',
      },
      {
        input: 's = "([)]"',
        output: 'false',
        explanation: 'The brackets cross — `[` is closed by `)` before `(` is closed.',
      },
      {
        input: 's = "{[]}"',
        output: 'true',
        explanation: 'Nested brackets close in reverse order, which is correct.',
      },
    ],
    testCases: [
      { input: '"()[]{}"', output: 'true', description: 'Three independent pairs' },
      { input: '"([)]"', output: 'false', description: 'Interleaved — invalid' },
      { input: '"{[]}"', output: 'true', description: 'Nested' },
      { input: '""', output: 'true', description: 'Empty string is trivially valid' },
      { input: '"("', output: 'false', description: 'Unclosed opener' },
      { input: '")("', output: 'false', description: 'Wrong order' },
      { input: '"((((((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))))))))))))"', output: 'true', description: 'Deeply nested' },
    ],
    constraints: ['0 <= s.length <= 10^4', 's consists only of `(`, `)`, `[`, `]`, `{`, `}`.'],
    hints: [
      'A stack is the natural data structure — push openers, pop on closer.',
      'On each closer, the stack must be non-empty AND its top must match the opener of that closer.',
      'At the end, the stack must be empty (otherwise there are unmatched openers).',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // HARD / ADVANCED
  // ─────────────────────────────────────────────────────────────
  'hard-maximum-subarray': {
    title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    description:
      'Given an integer array `nums`, find the contiguous subarray with the largest sum, and return that sum. The subarray must contain at least one element. Aim for O(n) — the brute-force O(n²) over all subarrays will time out at the upper bound.',
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] sums to 6, which is the maximum.',
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'Single element — it is its own best subarray.',
      },
      {
        input: 'nums = [-3, -1, -2]',
        output: '-1',
        explanation: 'All negatives — pick the least-negative single element.',
      },
    ],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', description: 'Classic case' },
      { input: '[1]', output: '1', description: 'Single element' },
      { input: '[-3,-1,-2]', output: '-1', description: 'All negatives' },
      { input: '[5,4,-1,7,8]', output: '23', description: 'Mostly positive' },
      { input: '[-1,-2,-3,-4,-5]', output: '-1', description: 'Strictly decreasing negatives' },
      { input: '[0,0,0,0]', output: '0', description: 'All zeros' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      'At each index, the best subarray ending here is either: the current element alone, or the current element extending the previous best.',
      'Maintain `current = max(num, current + num)` and `best = max(best, current)`.',
      'This is Kadane\'s algorithm — a one-pass DP with O(1) state.',
    ],
  },

  'hard-find-duplicate': {
    title: 'Find the Duplicate Number',
    description:
      'You are given an array `nums` of `n + 1` integers, each in the range `[1, n]`. Exactly one value appears more than once (possibly multiple times). Return that duplicate.\n\nFollow-ups: solve without modifying the array, in O(1) extra space.',
    examples: [
      {
        input: 'nums = [1, 3, 4, 2, 2]',
        output: '2',
        explanation: '2 appears twice; every other value appears once.',
      },
      {
        input: 'nums = [3, 1, 3, 4, 2]',
        output: '3',
        explanation: '3 appears at indices 0 and 2.',
      },
      {
        input: 'nums = [1, 1]',
        output: '1',
        explanation: 'Smallest possible input — n=1, two elements, both 1.',
      },
    ],
    testCases: [
      { input: '[1, 3, 4, 2, 2]', output: '2', description: 'Duplicate in middle' },
      { input: '[3, 1, 3, 4, 2]', output: '3', description: 'Duplicate at start and middle' },
      { input: '[1, 1]', output: '1', description: 'Smallest input' },
      { input: '[1, 4, 4, 4, 4, 4, 2, 3]', output: '4', description: 'Multiple occurrences' },
      { input: '[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]', output: '9', description: 'Triple occurrence' },
    ],
    constraints: [
      '1 <= n <= 10^5',
      'nums.length === n + 1',
      '1 <= nums[i] <= n',
      'Exactly one value is repeated, all others appear once.',
    ],
    hints: [
      'Hash set: O(n) time, O(n) space — easy first solution.',
      'Sort then scan: O(n log n) — but mutates the array.',
      'Optimal: treat the array as a linked list (`i -> nums[i]`) and apply Floyd\'s cycle detection (tortoise and hare). The duplicate is the start of the cycle. O(n) time, O(1) space, no mutation.',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────

/**
 * Pick a problem for the (subject, unit, subtopic, difficulty) combo.
 *
 * The selection is deterministic: a stable hash of the request keys picks
 * one of the curated problems for that difficulty bucket. SQL/DBMS routes
 * return null — those flows are handled by the SQL challenge engine.
 */
export function getCodingProblem(
  subject: string,
  unit: string,
  subtopic: string,
  difficulty: 'Basic' | 'Medium' | 'Advanced'
): CodingProblem | null {
  const normalizedSubject = subject.toLowerCase()
  if (
    normalizedSubject.includes('database') ||
    normalizedSubject.includes('dbms') ||
    normalizedSubject.includes('sql')
  ) {
    return null
  }

  const pools: Record<string, string[]> = {
    Basic: ['basic-find-maximum', 'basic-count-elements', 'basic-fizzbuzz'],
    Medium: ['medium-two-sum', 'medium-reverse-array', 'medium-valid-parentheses'],
    Advanced: ['hard-maximum-subarray', 'hard-find-duplicate'],
  }

  const pool = pools[difficulty] ?? pools.Basic
  const seed = `${subject}-${unit}-${subtopic}`
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const idx = Math.abs(seed) % pool.length
  return codingProblemDatabase[pool[idx]] ?? null
}

/** Whether a curated problem exists for the request. */
export function hasCodingProblem(
  subject: string,
  unit: string,
  subtopic: string,
  difficulty: 'Basic' | 'Medium' | 'Advanced'
): boolean {
  return getCodingProblem(subject, unit, subtopic, difficulty) !== null
}
