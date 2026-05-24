import { ExternalServiceError, ValidationError } from '@/src/lib/errors';
import { childLogger } from '@/src/lib/logger';
import { MAX_CODE_LENGTH } from '@/src/lib/constants';

const log = childLogger('judge0');

const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL ??
  process.env.NEXT_PUBLIC_JUDGE0_API_URL ??
  'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY =
  process.env.JUDGE0_API_KEY ?? process.env.JUDGE0_RAPIDAPI_KEY ?? '';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST ?? 'judge0-ce.p.rapidapi.com';

export const JUDGE0_LANGUAGES = {
  python: 92,
  cpp: 54,
  java: 91,
} as const;

export type Judge0Language = keyof typeof JUDGE0_LANGUAGES;

const STATUS_QUEUE = 1;
const STATUS_PROCESSING = 2;
const STATUS_ACCEPTED = 3;

interface RawResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  statusId: number;
  timeSec: string | null;
  memoryKb: number | null;
  passed: boolean;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] = JUDGE0_API_HOST;
  }
  return headers;
}

function decodeBase64(str: string | null): string {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
        continue;
      }
      throw new ExternalServiceError('Judge0', `HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    }
  }
  throw lastErr instanceof Error
    ? new ExternalServiceError('Judge0', lastErr.message)
    : new ExternalServiceError('Judge0');
}

async function submitCode(
  code: string,
  language: Judge0Language,
  stdin?: string,
  expectedOutput?: string
): Promise<string> {
  if (code.length > MAX_CODE_LENGTH) {
    throw new ValidationError(`Code exceeds ${MAX_CODE_LENGTH} char limit`);
  }
  if (!(language in JUDGE0_LANGUAGES)) {
    throw new ValidationError(`Unsupported language: ${language}`);
  }

  const body = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: JUDGE0_LANGUAGES[language],
    stdin: stdin ? Buffer.from(stdin).toString('base64') : undefined,
    expected_output: expectedOutput
      ? Buffer.from(expectedOutput).toString('base64')
      : undefined,
  };

  const res = await fetchWithRetry(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }
  );
  const data = (await res.json()) as { token: string };
  return data.token;
}

async function getResult(token: string): Promise<RawResult> {
  const res = await fetchWithRetry(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
    { headers: authHeaders() }
  );
  return (await res.json()) as RawResult;
}

async function pollUntilDone(
  token: string,
  timeoutMs = 30_000,
  intervalMs = 1000
): Promise<RawResult> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await getResult(token);
    if (result.status.id !== STATUS_QUEUE && result.status.id !== STATUS_PROCESSING) {
      return result;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new ExternalServiceError('Judge0', 'Execution timeout');
}

export async function executeCode(
  code: string,
  language: Judge0Language,
  stdin?: string,
  expectedOutput?: string
): Promise<ExecutionResult> {
  log.debug({ language, codeLen: code.length }, 'submitting code');
  const token = await submitCode(code, language, stdin, expectedOutput);
  const raw = await pollUntilDone(token);

  const stdout = decodeBase64(raw.stdout);
  const stderr = decodeBase64(raw.stderr);
  const compileOutput = decodeBase64(raw.compile_output);

  const passed =
    raw.status.id === STATUS_ACCEPTED &&
    (!expectedOutput || stdout.trim() === expectedOutput.trim());

  log.info(
    { statusId: raw.status.id, passed, time: raw.time },
    'execution complete'
  );

  return {
    stdout,
    stderr,
    compileOutput,
    status: raw.status.description,
    statusId: raw.status.id,
    timeSec: raw.time,
    memoryKb: raw.memory,
    passed,
  };
}
