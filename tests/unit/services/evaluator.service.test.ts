import { evaluatorService } from '@/src/services/evaluator.service';
import { geminiService } from '@/src/services/gemini.service';

jest.mock('@/src/services/gemini.service', () => ({
  geminiService: {
    generateResponse: jest.fn(),
  },
}));

const mockedGemini = geminiService as jest.Mocked<typeof geminiService>;

describe('evaluator service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('grades written answers through the LLM path without a reference answer', async () => {
    mockedGemini.generateResponse.mockResolvedValueOnce(JSON.stringify({
      accuracy: 62,
      completeness: 58,
      clarity: 70,
      structure: 65,
      examples: 40,
      strengths: ['Basic idea cover hua'],
      improvements: ['One concrete example add karo'],
      summaryHinglish: 'Answer average hai, but example missing hai.',
    }));

    const result = await evaluatorService.evaluate({
      type: 'written',
      prompt: 'What is normalization?',
      answer: 'Normalization reduces redundancy in database tables.',
      context: {
        subjectId: 'dbms',
        phase: 'theory',
        difficulty: 'easy',
      },
    });

    expect(result.meta.deterministic).toBe(false);
    expect(result.rubric).toHaveLength(5);
    expect(result.feedback.improvements[0]).toContain('example');
  });

  it('retries malformed Gemini JSON once, then falls back with degraded metadata', async () => {
    mockedGemini.generateResponse
      .mockResolvedValueOnce('not json')
      .mockResolvedValueOnce('still not json');

    const result = await evaluatorService.evaluate({
      type: 'written',
      prompt: 'Explain primary key.',
      answer: 'Primary key uniquely identifies a row in a table.',
      rubricHints: ['unique', 'not null', 'identifier'],
      context: {
        subjectId: 'dbms',
        phase: 'interview',
        difficulty: 'easy',
      },
    });

    expect(mockedGemini.generateResponse).toHaveBeenCalledTimes(2);
    expect(result.meta.deterministic).toBe(false);
    expect(result.meta.degraded).toBe(true);
    expect(result.feedback.improvements.length).toBeGreaterThan(0);
  });

  it('routes zero-pass coding submissions to theory review', async () => {
    const result = await evaluatorService.evaluate({
      type: 'coding',
      subjectId: 'dsa',
      unitId: 'arrays',
      subtopicId: 'two-sum',
      problemId: 'two-sum',
      language: 'python',
      code: 'def solve():\n  return []',
      difficulty: 'easy',
      testResults: Array.from({ length: 5 }, () => ({
        passed: false,
        input: '[1,2]',
        expected: '[0,1]',
        actual: '[]',
      })),
    });

    expect(result.score).toBe(0);
    expect(result.status).toBe('failed');
    expect(result.feedback.nextStep).toEqual({
      action: 'review_theory',
      subtopicId: 'two-sum',
    });
  });
});
