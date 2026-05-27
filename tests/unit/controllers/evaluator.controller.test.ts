import { Types } from 'mongoose';
import { evaluateAttemptForUser } from '@/src/controllers/evaluator.controller';
import { Attempt, Progress } from '@/src/models';

jest.mock('@/src/lib/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/src/models', () => ({
  Progress: {
    findOne: jest.fn(),
  },
  Attempt: {
    find: jest.fn(),
  },
}));

const mockedProgress = Progress as jest.Mocked<typeof Progress>;
const mockedAttempt = Attempt as jest.Mocked<typeof Attempt>;

function mockEvaluationContext() {
  const progressQuery = {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(null),
  };
  const attemptQuery = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  };

  mockedProgress.findOne.mockReturnValue(progressQuery as never);
  mockedAttempt.find.mockReturnValue(attemptQuery as never);
}

describe('evaluator controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEvaluationContext();
  });

  it('records frontend editor assignments as completed manual submissions', async () => {
    const result = await evaluateAttemptForUser(new Types.ObjectId().toString(), {
      type: 'assignment',
      subjectId: 'html',
      subjectName: 'HTML',
      unitId: 'intro',
      unitName: 'Introduction to HTML',
      subtopicId: 'first-page',
      subtopicName: 'Create Your First HTML Page',
      phase: 'assignment',
      difficulty: 'Basic',
      problemTitle: 'Create Your First HTML Page',
      language: 'html/css/javascript',
      code: JSON.stringify({ html: '<h1>Hello</h1>', css: '', javascript: '', react: '' }),
      status: 'completed',
      score: 100,
      passedCount: 1,
      totalCount: 1,
      metadata: {
        category: 'frontend',
        requirements: ['Create a heading'],
      },
    });

    expect(result.evaluation.status).toBe('completed');
    expect(result.evaluation.score).toBe(100);
    expect(result.evaluation.rubric[0].criterion).toBe('Frontend editor submission');
    expect(result.attempt.status).toBeUndefined();
    expect(result.attempt.score).toBeUndefined();
  });

  it('keeps judged assignment submissions on the coding rubric path', async () => {
    const result = await evaluateAttemptForUser(new Types.ObjectId().toString(), {
      type: 'assignment',
      subjectId: 'dsa',
      unitId: 'arrays',
      subtopicId: 'two-sum',
      phase: 'assignment',
      difficulty: 'Medium',
      problemTitle: 'Two Sum',
      language: 'python',
      code: 'def solve():\n  return []',
      status: 'partial',
      score: 50,
      passedCount: 1,
      totalCount: 2,
      testResults: [
        {
          passed: true,
          input: '[2,7,11,15], 9',
          expected: '[0,1]',
          actual: '[0,1]',
        },
        {
          passed: false,
          input: '[3,2,4], 6',
          expected: '[1,2]',
          actual: '[]',
        },
      ],
    });

    expect(result.evaluation.status).toBe('partial');
    expect(result.evaluation.score).toBeLessThan(100);
    expect(result.evaluation.rubric[0].criterion).toBe('Correctness');
  });
});
