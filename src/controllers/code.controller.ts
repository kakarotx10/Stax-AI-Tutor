import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { Submission, type TestResult } from '@/src/models';
import { executeCode, type Judge0Language } from '@/src/services/judge0.service';
import { executeSchema, submitSchema } from '@/src/validators/code.validator';
import { ValidationError, NotFoundError } from '@/src/lib/errors';
import { SUBMISSION_STATUS } from '@/src/lib/constants';
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

  log.info(
    { userId, problemId: dto.problemId, score, passed: `${passed}/${results.length}` },
    'submission graded server-side'
  );

  return {
    submissionId: submission._id?.toString(),
    score,
    passed,
    total: results.length,
    status: submission.status,
    testResults: results,
  };
}
