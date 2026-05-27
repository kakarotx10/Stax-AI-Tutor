import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { Attempt, Submission, type TestResult } from '@/src/models';
import { applyEvaluationBookkeeping } from '@/src/controllers/attempt.controller';
import { evaluatorService } from '@/src/services/evaluator.service';
import { executeCode, type Judge0Language } from '@/src/services/judge0.service';
import { executeSchema, submitSchema } from '@/src/validators/code.validator';
import { ValidationError, NotFoundError } from '@/src/lib/errors';
import { ATTEMPT_TYPES, SUBMISSION_STATUS } from '@/src/lib/constants';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('code.controller');

interface TestCase {
  stdin: string;
  expectedOutput: string;
}

/**
 * In a real system this would fetch from a Problem collection.
 * For now, content/codingProblems holds the source data.
 */
async function getProblemTestCases(problemId: string): Promise<TestCase[]> {
  const mod = await import('@/content/codingProblems');
  const lookup = (mod as { getProblemById?: (id: string) => unknown }).getProblemById;
  if (!lookup) return [];
  const problem = lookup(problemId) as { testCases?: TestCase[] } | undefined;
  return problem?.testCases ?? [];
}

export async function execute(input: unknown) {
  const parsed = executeSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid execute payload', parsed.error.flatten());
  }
  const { code, language, stdin } = parsed.data;
  return executeCode(code, language as Judge0Language, stdin);
}

export async function submit(userId: string, input: unknown) {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid submit payload', parsed.error.flatten());
  }
  const dto = parsed.data;

  const testCases = await getProblemTestCases(dto.problemId);
  if (testCases.length === 0) {
    throw new NotFoundError(`Problem ${dto.problemId} or test cases`);
  }

  await connectDB();

  const results: TestResult[] = [];
  let totalRuntimeMs = 0;
  for (const tc of testCases) {
    const r = await executeCode(
      dto.code,
      dto.language as Judge0Language,
      tc.stdin,
      tc.expectedOutput
    );
    results.push({
      passed: r.passed,
      runtimeMs: r.timeSec ? Math.round(parseFloat(r.timeSec) * 1000) : undefined,
      memoryKb: r.memoryKb ?? undefined,
      expected: tc.expectedOutput,
      actual: r.stdout,
      errorMessage: r.stderr || r.compileOutput || undefined,
    });
    totalRuntimeMs += r.timeSec ? parseFloat(r.timeSec) * 1000 : 0;
  }

  const passed = results.filter((r) => r.passed).length;
  const score = Math.round((passed / results.length) * 100);
  const allPassed = passed === results.length;
  const difficulty = normalizeDifficulty(dto.difficulty);
  const evaluationTestResults = results.map((result, index) => ({
    passed: result.passed,
    input: testCases[index]?.stdin ?? '',
    expected: result.expected ?? '',
    actual: result.actual ?? result.errorMessage ?? '',
    runtimeMs: result.runtimeMs,
    memoryKb: result.memoryKb,
    errorMessage: result.errorMessage,
  }));
  const evaluation = dto.subjectId && dto.unitId && dto.subtopicId
    ? await evaluatorService.evaluate({
        type: 'coding',
        subjectId: dto.subjectId,
        unitId: dto.unitId,
        subtopicId: dto.subtopicId,
        problemId: dto.problemId,
        language: dto.language,
        code: dto.code,
        testResults: evaluationTestResults,
        difficulty,
      })
    : null;

  const submission = await Submission.create({
    userId: new Types.ObjectId(userId),
    problemId: dto.problemId,
    contestId: dto.contestId ? new Types.ObjectId(dto.contestId) : undefined,
    language: dto.language,
    code: dto.code,
    status: allPassed
      ? SUBMISSION_STATUS.ACCEPTED
      : SUBMISSION_STATUS.WRONG_ANSWER,
    score,
    testResults: results,
    totalRuntimeMs: Math.round(totalRuntimeMs),
  });

  if (evaluation && dto.subjectId && dto.unitId && dto.subtopicId) {
    const userObjId = new Types.ObjectId(userId);
    const attemptInput = {
      type: ATTEMPT_TYPES.CODING,
      subjectId: dto.subjectId,
      unitId: dto.unitId,
      subtopicId: dto.subtopicId,
      phase: difficulty === 'easy' ? 'basic' : difficulty,
      difficulty,
      problemId: dto.problemId,
      problemTitle: dto.problemId,
      language: dto.language,
      code: dto.code,
      status: evaluation.status,
      score: evaluation.score,
      level: evaluation.level,
      rubric: evaluation.rubric,
      feedback: evaluation.feedback,
      evaluatorVersion: evaluation.meta.evaluatorVersion,
      meta: evaluation.meta,
      passedCount: passed,
      totalCount: results.length,
      testResults: evaluationTestResults,
      completedAt: new Date(),
    };

    await Attempt.create({
      ...attemptInput,
      userId: userObjId,
    });
    await applyEvaluationBookkeeping(userObjId, attemptInput, evaluation);
  }

  log.info(
    { userId, problemId: dto.problemId, score, passed: `${passed}/${results.length}` },
    'submission graded server-side'
  );

  return {
    submissionId: submission._id?.toString(),
    score: evaluation?.score ?? score,
    passed,
    total: results.length,
    status: evaluation?.status ?? submission.status,
    testResults: results,
    evaluation,
  };
}

function normalizeDifficulty(value?: string): 'easy' | 'medium' | 'hard' {
  const normalized = value?.toLowerCase();
  if (normalized === 'advanced' || normalized === 'hard') return 'hard';
  if (normalized === 'medium') return 'medium';
  return 'easy';
}
