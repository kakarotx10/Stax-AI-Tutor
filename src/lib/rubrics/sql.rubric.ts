import type { RubricScore } from '@/src/validators/evaluator.validator';
import { clampScore, weightedScore } from './shared';

export type SqlRubricInput = {
  query: string;
  expectedRows: Array<Record<string, unknown>>;
  actualRows: Array<Record<string, unknown>>;
  orderSensitive: boolean;
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function rowsEqual(expected: Array<Record<string, unknown>>, actual: Array<Record<string, unknown>>, orderSensitive: boolean) {
  if (orderSensitive) {
    if (expected.length !== actual.length) return false;
    return expected.every((row, index) => stableStringify(row) === stableStringify(actual[index]));
  }

  const expectedSet = new Set(expected.map(stableStringify));
  const actualSet = new Set(actual.map(stableStringify));
  if (expectedSet.size !== actualSet.size) return false;
  return [...expectedSet].every((row) => actualSet.has(row));
}

function scoreQueryQuality(query: string) {
  const normalized = query.replace(/\s+/g, ' ').trim().toLowerCase();
  let score = 90;
  if (/select\s+\*/i.test(query)) score -= 25;
  if (/from\s+[^;,\s]+,\s*[^;]+/i.test(query)) score -= 25;
  if (/join\s+[^;]+(where|group by|order by|$)/i.test(normalized) && !/\sjoin\s+.+\son\s+/i.test(normalized)) {
    score -= 20;
  }
  if (!/\bwhere\b|\bjoin\b|\bgroup by\b|\border by\b|\blimit\b/i.test(query)) score -= 5;
  return clampScore(score);
}

export function evaluateSqlRubric(input: SqlRubricInput) {
  const correct = rowsEqual(input.expectedRows, input.actualRows, input.orderSensitive);
  const correctness = correct ? 100 : 0;
  const quality = scoreQueryQuality(input.query);
  const rubric: RubricScore[] = [
    {
      criterion: 'Correctness',
      weight: 0.85,
      score: correctness,
      comment: correct ? 'Result rows expected output se match karte hain.' : 'Result rows expected output se match nahi karte.',
    },
    {
      criterion: 'Query quality',
      weight: 0.15,
      score: quality,
      comment: 'SELECT *, cartesian joins, aur avoidable query patterns check hue.',
    },
  ];
  const score = weightedScore(rubric);

  return {
    score,
    status: score >= 90 ? 'accepted' as const : score >= 50 ? 'partial' as const : 'failed' as const,
    rubric,
    strengths: correct ? ['Result set correct hai'] : [],
    improvements:
      score < 100
        ? ['Expected columns aur filters ko compare karo; SELECT * avoid karke exact columns select karo.']
        : [],
    summary: correct
      ? 'SQL output correct hai. Query quality bhi acceptable hai.'
      : 'SQL result expected rows se match nahi hua. Filter/join condition ko dobara verify karo.',
  };
}
