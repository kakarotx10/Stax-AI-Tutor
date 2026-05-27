import type { RubricScore } from '@/src/validators/evaluator.validator';
import { clampScore, weightedScore } from './shared';

export type CodingTestResult = {
  passed: boolean;
  input?: string;
  expected?: string;
  actual?: string;
  runtimeMs?: number;
  memoryKb?: number;
  edge?: boolean;
  status?: string;
  errorMessage?: string;
};

export type CodingRubricInput = {
  code: string;
  testResults: CodingTestResult[];
  expectedRuntimeMs?: number;
  edgeCaseFlags?: boolean[];
};

function hasCompileFailure(results: CodingTestResult[]) {
  return results.some((result) => {
    const text = [
      result.status,
      result.errorMessage,
      result.actual,
    ].filter(Boolean).join(' ').toLowerCase();
    return text.includes('compile') || text.includes('syntaxerror') || text.includes('compilation');
  });
}

function hasTimeout(results: CodingTestResult[]) {
  return results.some((result) => {
    const text = [result.status, result.errorMessage, result.actual].filter(Boolean).join(' ').toLowerCase();
    return text.includes('timeout') || text.includes('time limit');
  });
}

function scoreEfficiency(results: CodingTestResult[], expectedRuntimeMs?: number, correctness = 0) {
  const runtimes = results
    .map((result) => result.runtimeMs)
    .filter((runtime): runtime is number => typeof runtime === 'number' && runtime >= 0);

  if (runtimes.length === 0 || !expectedRuntimeMs || expectedRuntimeMs <= 0) {
    return hasTimeout(results) ? Math.min(correctness, 20) : correctness;
  }

  const avg = runtimes.reduce((sum, runtime) => sum + runtime, 0) / runtimes.length;
  if (avg <= expectedRuntimeMs) return 100;
  if (avg >= expectedRuntimeMs * 3) return 0;
  return clampScore(((expectedRuntimeMs * 3 - avg) / (expectedRuntimeMs * 2)) * 100);
}

function scoreCodeQuality(code: string, correctness: number) {
  if (correctness === 0) return 0;

  let score = 82;
  if (code.length > 3000) score -= 10;
  if (/\b(var|tmp|foo|bar|asdf)\b/.test(code)) score -= 8;
  if (/\bconsole\.log\(|System\.out\.println\(|print\(/.test(code) && !/\breturn\b/.test(code)) score -= 6;
  if (/TODO|debugger|pass\s*(#|$)/i.test(code)) score -= 10;
  if (/\b[a-z]\b/.test(code)) score -= 4;
  return clampScore(score);
}

function edgeScore(results: CodingTestResult[], edgeCaseFlags?: boolean[], correctness = 0) {
  const edgeResults = results.filter((result, index) => result.edge || edgeCaseFlags?.[index]);
  if (edgeResults.length === 0) return correctness;
  return clampScore((edgeResults.filter((result) => result.passed).length / edgeResults.length) * 100);
}

export function evaluateCodingRubric(input: CodingRubricInput) {
  const total = input.testResults.length;
  const passed = input.testResults.filter((result) => result.passed).length;
  const compileFailure = passed === 0 && hasCompileFailure(input.testResults);

  if (total === 0 || compileFailure) {
    const comment = compileFailure ? 'Code compile nahi hua, isliye score 0 hai.' : 'No judge results available.';
    const rubric: RubricScore[] = [
      { criterion: 'Correctness', weight: 0.6, score: 0, comment },
      { criterion: 'Edge cases', weight: 0.15, score: 0, comment },
      { criterion: 'Efficiency', weight: 0.15, score: 0, comment },
      { criterion: 'Code quality', weight: 0.1, score: 0, comment },
    ];
    return {
      score: 0,
      status: 'failed' as const,
      rubric,
      strengths: [],
      improvements: ['Pehle code compile/run karao, phir same test suite submit karo.'],
      summary: compileFailure
        ? 'Code compile nahi hua, so evaluation fail hai. Syntax/import issue fix karke retry karo.'
        : 'Judge result missing hai, score calculate nahi ho saka.',
    };
  }

  const correctness = clampScore((passed / total) * 100);
  const edges = edgeScore(input.testResults, input.edgeCaseFlags, correctness);
  const efficiency = scoreEfficiency(input.testResults, input.expectedRuntimeMs, correctness);
  const quality = passed === 0 ? 0 : scoreCodeQuality(input.code, correctness);
  const rubric: RubricScore[] = [
    {
      criterion: 'Correctness',
      weight: 0.6,
      score: correctness,
      comment: `${passed}/${total} test cases pass hue.`,
    },
    {
      criterion: 'Edge cases',
      weight: 0.15,
      score: edges,
      comment:
        input.testResults.some((result) => result.edge) || input.edgeCaseFlags?.some(Boolean)
          ? 'Tagged edge cases ke basis par score nikla.'
          : 'Tagged edge cases nahi mile, overall pass rate use hua.',
    },
    {
      criterion: 'Efficiency',
      weight: 0.15,
      score: efficiency,
      comment: hasTimeout(input.testResults)
        ? 'At least one case timeout hua.'
        : 'Runtime judge data ke basis par score nikla.',
    },
    {
      criterion: 'Code quality',
      weight: 0.1,
      score: quality,
      comment: passed === 0 ? 'All tests fail hue, quality grading skip ki.' : 'Readable naming and dead-code checks apply hue.',
    },
  ];
  const score = passed === 0 ? 0 : weightedScore(rubric);
  const allPassed = passed === total;

  return {
    score,
    status: score >= 90 && allPassed ? 'accepted' as const : score >= 50 ? 'partial' as const : 'failed' as const,
    rubric,
    strengths: [
      passed > 0 ? `${passed} test case pass hue` : '',
      allPassed ? 'All visible judge cases clear hain' : '',
    ].filter(Boolean),
    improvements:
      score < 100
        ? [
            hasTimeout(input.testResults)
              ? 'Nested loop/slow section ko optimize karo; hashmap, sorting, ya prefix logic check karo.'
              : 'Failing case ka input manually dry-run karo aur expected output se first mismatch locate karo.',
          ]
        : [],
    summary: allPassed
      ? 'All tests pass ho gaye. Code quality bhi acceptable hai.'
      : `${passed}/${total} tests pass hue. Logic close hai, but failing cases ko dry-run karke fix chahiye.`,
  };
}
