// Static contest/marathon problems - same 2 questions for all active contests/marathons

export interface ContestProblemData {
  title: string
  description: string
  difficulty: 'Advanced'
  points: number
  testCases: {
    examples: Array<{
      input: string
      output: string
      explanation: string
    }>
    constraints: string[]
    testCases: Array<{
      input: string
      output: string
      description: string
    }>
  }
}

export const CONTEST_PROBLEMS: ContestProblemData[] = [
  {
    title: 'Advanced: Maximum Subarray Sum',
    description: `Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

This is a classic dynamic programming problem. A subarray is a contiguous part of an array. For example, in the array [1, -3, 4, -1, 2, 1, -5, 4], the subarray [4, -1, 2, 1] has the largest sum of 6.

Your task is to implement an efficient solution that finds the maximum sum of any contiguous subarray. The solution should handle arrays with both positive and negative numbers, and should be optimal in terms of time complexity.

Think about how you can solve this problem by keeping track of the maximum sum ending at each position.`,
    difficulty: 'Advanced',
    points: 200,
    testCases: {
      examples: [
        {
          input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
          output: '6',
          explanation: 'The subarray [4, -1, 2, 1] has the maximum sum of 6.'
        },
        {
          input: '[1]',
          output: '1',
          explanation: 'The array has only one element, so the maximum sum is 1.'
        },
        {
          input: '[5, 4, -1, 7, 8]',
          output: '23',
          explanation: 'The entire array [5, 4, -1, 7, 8] has the maximum sum of 23.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4'
      ],
      testCases: [
        {
          input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
          output: '6',
          description: 'Standard test case with mixed positive and negative numbers'
        },
        {
          input: '[1]',
          output: '1',
          description: 'Single element array'
        },
        {
          input: '[5, 4, -1, 7, 8]',
          output: '23',
          description: 'All positive numbers'
        },
        {
          input: '[-1, -2, -3]',
          output: '-1',
          description: 'All negative numbers - return the least negative'
        }
      ]
    }
  },
  {
    title: 'Advanced: Longest Increasing Subsequence',
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.

A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements. For example, [3, 6, 2, 7] is a subsequence of [0, 3, 1, 6, 2, 2, 7].

For the array [10, 9, 2, 5, 3, 7, 101, 18], the longest increasing subsequence is [2, 3, 7, 18] or [2, 5, 7, 18], both of length 4.

Your solution should efficiently find the length of the longest increasing subsequence. This problem requires careful consideration of dynamic programming or binary search approaches to achieve optimal time complexity.

Think about maintaining a list where each position represents the smallest tail element of all increasing subsequences of that length.`,
    difficulty: 'Advanced',
    points: 200,
    testCases: {
      examples: [
        {
          input: '[10, 9, 2, 5, 3, 7, 101, 18]',
          output: '4',
          explanation: 'The longest increasing subsequence is [2, 3, 7, 18] or [2, 5, 7, 18], both of length 4.'
        },
        {
          input: '[0, 1, 0, 3, 2, 3]',
          output: '4',
          explanation: 'The longest increasing subsequence is [0, 1, 2, 3] of length 4.'
        },
        {
          input: '[7, 7, 7, 7, 7, 7, 7]',
          output: '1',
          explanation: 'All elements are the same, so the longest increasing subsequence has length 1.'
        }
      ],
      constraints: [
        '1 <= nums.length <= 2500',
        '-10^4 <= nums[i] <= 10^4'
      ],
      testCases: [
        {
          input: '[10, 9, 2, 5, 3, 7, 101, 18]',
          output: '4',
          description: 'Standard test case'
        },
        {
          input: '[0, 1, 0, 3, 2, 3]',
          output: '4',
          description: 'Test case with duplicates'
        },
        {
          input: '[7, 7, 7, 7, 7, 7, 7]',
          output: '1',
          description: 'All elements are the same'
        },
        {
          input: '[1, 3, 6, 7, 9, 4, 10, 5, 6]',
          output: '6',
          description: 'Complex test case'
        }
      ]
    }
  }
]




