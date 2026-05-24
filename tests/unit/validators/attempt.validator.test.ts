import { createAttemptSchema, listAttemptsQuerySchema } from '@/src/validators/attempt.validator';

describe('attempt validator', () => {
  it('accepts a coding attempt with wrong/right test details', () => {
    const result = createAttemptSchema.safeParse({
      type: 'coding',
      subjectId: 'dsa',
      unitId: 'arrays',
      subtopicId: 'intro',
      phase: 'basic',
      problemTitle: 'Find Maximum Element',
      language: 'python',
      code: 'print(1)',
      status: 'partial',
      score: 50,
      passedCount: 1,
      totalCount: 2,
      testResults: [
        {
          passed: true,
          input: '[1,2]',
          expected: '2',
          actual: '2',
        },
        {
          passed: false,
          input: '[3,4]',
          expected: '4',
          actual: '3',
          errorMessage: 'Wrong answer',
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects attempts without a problem title', () => {
    const result = createAttemptSchema.safeParse({
      type: 'mcq',
      status: 'completed',
      score: 100,
    });

    expect(result.success).toBe(false);
  });

  it('coerces list query limits and caps invalid large limits', () => {
    const valid = listAttemptsQuerySchema.safeParse({
      type: 'coding',
      limit: '25',
    });
    const invalid = listAttemptsQuerySchema.safeParse({
      limit: '500',
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.limit).toBe(25);
    }
    expect(invalid.success).toBe(false);
  });
});
