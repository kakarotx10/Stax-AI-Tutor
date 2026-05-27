import { evaluateCodingRubric } from '@/src/lib/rubrics/coding.rubric';
import { evaluateMcqRubric } from '@/src/lib/rubrics/mcq.rubric';
import { evaluateSqlRubric } from '@/src/lib/rubrics/sql.rubric';
import { evaluateWrittenRubric } from '@/src/lib/rubrics/written.rubric';

describe('evaluator rubrics', () => {
  it('scores a correct MCQ deterministically', () => {
    const result = evaluateMcqRubric({
      selectedOptionId: 'b',
      correctOptionId: 'b',
      timeTakenMs: 10_000,
    });

    expect(result.score).toBe(100);
    expect(result.status).toBe('accepted');
    expect(result.rubric).toHaveLength(2);
  });

  it('scores all-failing coding submissions as failed with zero score', () => {
    const result = evaluateCodingRubric({
      code: 'def solve():\n  return None',
      testResults: Array.from({ length: 5 }, (_, index) => ({
        passed: false,
        input: String(index),
        expected: '1',
        actual: '0',
      })),
    });

    expect(result.score).toBe(0);
    expect(result.status).toBe('failed');
    expect(result.improvements[0]).toContain('Failing case');
  });

  it('compares SQL result sets without order when orderSensitive is false', () => {
    const result = evaluateSqlRubric({
      query: 'SELECT id, name FROM users WHERE active = 1',
      expectedRows: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
      actualRows: [
        { name: 'B', id: 2 },
        { name: 'A', id: 1 },
      ],
      orderSensitive: false,
    });

    expect(result.status).toBe('accepted');
    expect(result.rubric[0].score).toBe(100);
  });

  it('builds the written rubric from structured grades', () => {
    const result = evaluateWrittenRubric({
      accuracy: 70,
      completeness: 60,
      clarity: 80,
      structure: 75,
      examples: 50,
      strengths: ['Definition mostly sahi hai'],
      improvements: ['Example add karo'],
      summaryHinglish: 'Answer decent hai, but examples missing hain.',
    });

    expect(result.score).toBe(68);
    expect(result.status).toBe('partial');
    expect(result.rubric).toHaveLength(5);
  });
});
