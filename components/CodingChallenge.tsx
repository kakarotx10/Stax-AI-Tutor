'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Play, Loader2, AlertCircle, Lightbulb, Trophy, ArrowRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { DOMAINS } from '@/lib/subjects'
import { saveUserAttempt, saveUserProgress } from '@/lib/userAttempts'
import FrontendEditor from './FrontendEditor'
import MonacoEditor from './MonacoEditor'

/**
 * Render text that contains backtick-wrapped inline code (`like this`) into
 * <code> spans. Plain segments are returned as text. Newlines preserved by
 * `whitespace-pre-line` on the parent.
 *
 * Cheap alternative to pulling in react-markdown for problem descriptions.
 */
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code
            key={i}
            className="rounded-[4px] border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

interface CodingProblem {
  title: string
  description: string
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  testCases?: Array<{
    input: string
    output: string
    description: string
  }>
  constraints: string[]
  hints: string[]
}

interface Hint {
  problematicLine: number
  concept: string
  explanation: string
  hint: string
  reviewConcept: string
}

interface CodingChallengeProps {
  subject: string
  unit: string
  subtopic?: string
  subjectId?: string
  unitId?: string
  subtopicId?: string
  phase?: string
  difficulty?: 'Basic' | 'Medium' | 'Advanced'
  onComplete: () => void
}

type Difficulty = 'Basic' | 'Medium' | 'Advanced'

// Check if subject is in frontend or backend domain
function isFrontendOrBackendSubject(subject: string): boolean {
  const frontendSubjects = DOMAINS.frontend.subjects
  const backendSubjects = DOMAINS.backend.subjects
  const subjectLower = subject.toLowerCase()
  
  return frontendSubjects.some(s => s.toLowerCase() === subjectLower) ||
         backendSubjects.some(s => s.toLowerCase() === subjectLower)
}

export default function CodingChallenge({
  subject,
  unit,
  subtopic,
  subjectId,
  unitId,
  subtopicId,
  phase,
  difficulty: propDifficulty,
  onComplete,
}: CodingChallengeProps) {
  const [problem, setProblem] = useState<CodingProblem | null>(null)
  const [frontendQuestion, setFrontendQuestion] = useState<any>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>(propDifficulty || 'Basic')
  const [isFrontendBackend, setIsFrontendBackend] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [hint, setHint] = useState<Hint | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Array<{ 
    passed: boolean
    input: string
    expected: string
    got: string
    status?: string
    error?: string | null
  }>>([])

  // Language templates with input reading
  const languageTemplates: Record<string, string> = {
    python: `# Read input from stdin
import sys
import json

# Read the input line
input_line = sys.stdin.readline().strip()

# Parse the input (assuming it's a JSON array like "[1, 2, 3]")
try:
    arr = json.loads(input_line)
except:
    # If not JSON, try to parse as space-separated values
    arr = list(map(int, input_line.split()))

# Your solution here
# Example: process the array and store result in 'result'
result = []

# Print the result (as JSON array format)
print(json.dumps(result))
`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    string line;
    getline(cin, line);
    
    // Remove brackets and parse
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    
    vector<int> arr;
    stringstream ss(line);
    string token;
    
    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            arr.push_back(stoi(token));
        }
    }
    
    // Your solution here
    vector<int> result;
    
    // Print result
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]";
    
    return 0;
}`,
    java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine().trim();
        
        // Remove brackets and parse
        line = line.replaceAll("[\\[\\]]", "");
        String[] parts = line.split(",");
        
        List<Integer> arr = new ArrayList<>();
        for (String part : parts) {
            if (!part.trim().isEmpty()) {
                arr.add(Integer.parseInt(part.trim()));
            }
        }
        
        // Your solution here
        List<Integer> result = new ArrayList<>();
        
        // Print result
        System.out.print("[");
        for (int i = 0; i < result.size(); i++) {
            System.out.print(result.get(i));
            if (i < result.size() - 1) System.out.print(",");
        }
        System.out.print("]");
    }
}`,
  }

  const [language, setLanguage] = useState('python')

  useEffect(() => {
    const isFrontendBackend = isFrontendOrBackendSubject(subject)
    setIsFrontendBackend(isFrontendBackend)
    
    if (isFrontendBackend) {
      fetchFrontendBackendQuestion()
    } else {
      fetchProblem()
      setCode(languageTemplates[language])
    }
  }, [difficulty, subject, unit, subtopic])

  const fetchFrontendBackendQuestion = async () => {
    try {
      setLoading(true)
      const subtopicName = subtopic || 'intro'
      
      console.log('💻 Fetching frontend/backend question:', { subject, unit, subtopic: subtopicName, difficulty })
      
      const response = await axios.get('/api/questions/frontend-backend', {
        params: {
          subject,
          unit,
          subtopic: subtopicName,
          difficulty,
          random: 'true'
        }
      })
      
      if (response.data && response.data.question) {
        console.log('✅ Received question:', response.data.question.title)
        setFrontendQuestion(response.data.question)
        setError(null)
      } else {
        throw new Error('No question found')
      }
    } catch (error: any) {
      console.error('Error fetching question:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load question'
      toast.error(errorMsg)
      setFrontendQuestion(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchProblem = async () => {
    try {
      setLoading(true)
      // Use subtopic prop if provided, otherwise default to 'intro'
      const subtopicName = subtopic || 'intro'
      
      console.log('💻 Fetching coding problem:', { subject, unit, subtopic: subtopicName, difficulty })
      
      const response = await axios.post('/api/gemini/coding-problem', {
        subject,
        unit,
        subtopic: subtopicName,
        difficulty,
      })
      
      if (response.data) {
        if (response.data.problem) {
          console.log('✅ Received coding problem:', response.data.problem.title)
          setProblem(response.data.problem)
          setCode(languageTemplates[language])
          setError(null)
          setTestResults([])
          setHint(null)
          setShowHint(false)
          setCurrentHintIndex(0)
          
          if (response.data.error) {
            toast(response.data.error)
          }
        } else if (response.data.error) {
          throw new Error(response.data.error)
        } else {
          throw new Error('No problem in response')
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Error fetching problem:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load problem'
      toast.error(errorMsg)
      setProblem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    if (!problem || problem.examples.length === 0) {
      toast.error('No test cases available')
      return
    }

    setExecuting(true)
    setError(null)
    setTestResults([])

    try {
      // Execute code against all test cases
      const results = await Promise.all(
        problem.examples.map(async (ex) => {
          try {
            const response = await axios.post('/api/judge0/execute', {
              code,
              language,
              stdin: ex.input,
              expectedOutput: ex.output,
            })

            const executionResult = response.data.result

            return {
              passed: executionResult.passed,
              input: ex.input,
              expected: ex.output,
              got: executionResult.stdout || executionResult.stderr || executionResult.compileOutput || 'No output',
              status: executionResult.status,
              error: executionResult.stderr || executionResult.compileOutput || null,
            }
          } catch (err: any) {
            return {
              passed: false,
              input: ex.input,
              expected: ex.output,
              got: err.response?.data?.error || 'Execution error',
              status: 'Error',
              error: err.response?.data?.error || 'Failed to execute',
            }
          }
        })
      )

      setTestResults(results)

      const allPassed = results.every(r => r.passed)
      const passedCount = results.filter(r => r.passed).length
      const score = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0
      const failedStatus = results.find(r => !r.passed)?.status?.toLowerCase() ?? ''
      const status = allPassed
        ? 'accepted'
        : passedCount > 0
        ? 'partial'
        : failedStatus.includes('compile')
        ? 'compile_error'
        : failedStatus.includes('runtime')
        ? 'runtime_error'
        : 'wrong_answer'

      await saveUserAttempt({
        type: 'coding',
        subjectId,
        subjectName: subject,
        unitId,
        unitName: unit,
        subtopicId,
        subtopicName: subtopic,
        phase: phase ?? difficulty.toLowerCase(),
        difficulty,
        problemTitle: problem.title,
        prompt: problem.description,
        language,
        code,
        status,
        score,
        passedCount,
        totalCount: results.length,
        testResults: results.map((result) => ({
          passed: result.passed,
          input: result.input,
          expected: result.expected,
          actual: result.got,
          status: result.status,
          errorMessage: result.error ?? undefined,
        })),
      })

      if (allPassed) {
        await saveUserProgress({
          subjectId,
          unitId,
          subtopicId,
          phase: phase ?? difficulty.toLowerCase(),
          codingScore: score,
        })
        setCompleted(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        toast.success('All tests passed! 🎉')
      } else {
        toast.error(`${passedCount}/${results.length} tests passed. Keep trying!`)
      }
    } catch (err: any) {
      setError(err.message || 'Execution error')
      toast.error('Code execution failed. Check your Judge0 API configuration.')
    } finally {
      setExecuting(false)
    }
  }

  const handleGetHint = async () => {
    if (!code.trim()) {
      toast.error('Write some code first')
      return
    }

    setHintLoading(true)
    try {
      const response = await axios.post('/api/gemini/hint', {
        code,
        error: error || 'Incorrect output or logic error',
        subject,
        unit,
      })
      
      if (response.data && response.data.hint) {
        setHint(response.data.hint)
        setShowHint(true)
        if (response.data.error) {
          toast(response.data.error)
        }
      } else {
        throw new Error('No hint in response')
      }
    } catch (err: any) {
      console.error('Error fetching hint:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Failed to get hint'
      toast.error(errorMsg)
      
      // Set fallback hint so user still gets help
      if (err.response?.data?.hint) {
        setHint(err.response.data.hint)
        setShowHint(true)
      }
    } finally {
      setHintLoading(false)
    }
  }

  const handleNextDifficulty = () => {
    const difficulties: Difficulty[] = ['Basic', 'Medium', 'Advanced']
    const currentIdx = difficulties.indexOf(difficulty)
    if (currentIdx < difficulties.length - 1) {
      setDifficulty(difficulties[currentIdx + 1])
      setCompleted(false)
    } else {
      // All difficulties completed
      onComplete()
    }
  }

  const handleNextHint = () => {
    if (problem && currentHintIndex < problem.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1)
    }
  }

  // Show FrontendEditor for frontend/backend subjects
  if (isFrontendBackend) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      )
    }

    if (!frontendQuestion) {
      return (
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">Failed to load question</p>
          <button onClick={fetchFrontendBackendQuestion} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      )
    }

    return (
      <FrontendEditor
        subject={subject}
        unit={unit}
        subtopic={subtopic || 'intro'}
        subjectId={subjectId}
        unitId={unitId}
        subtopicId={subtopicId}
        phase={phase ?? difficulty.toLowerCase()}
        difficulty={difficulty}
        question={frontendQuestion}
        onComplete={onComplete}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-body-sm text-destructive">Failed to load problem.</p>
        <button onClick={fetchProblem} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-h3 font-semibold tracking-tight text-foreground">
            {problem.title}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={
                difficulty === 'Basic'
                  ? 'inline-flex items-center rounded-md border border-success/25 bg-success/12 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-success'
                  : difficulty === 'Medium'
                  ? 'inline-flex items-center rounded-md border border-warning/25 bg-warning/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-warning'
                  : 'inline-flex items-center rounded-md border border-destructive/25 bg-destructive/12 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-destructive'
              }
            >
              {difficulty}
            </span>
            <span className="text-caption text-muted-foreground">{unit}</span>
          </div>
        </div>
        <button
          onClick={() =>
            setDifficulty(
              difficulty === 'Basic' ? 'Medium' : difficulty === 'Medium' ? 'Advanced' : 'Basic'
            )
          }
          className="btn-secondary"
        >
          Change difficulty
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Problem Description */}
        <div className="min-w-0 space-y-6">
          <section className="surface-card p-6">
            <h3 className="mb-3 text-h4 font-semibold tracking-tight text-foreground">
              Problem description
            </h3>
            <p className="whitespace-pre-line text-body-sm leading-relaxed text-muted-foreground">
              <InlineMarkdown text={problem.description} />
            </p>
          </section>

          {/* Examples */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="surface-card p-6"
          >
            <h3 className="mb-4 text-h4 font-semibold tracking-tight text-foreground">
              Examples
            </h3>
            <div className="space-y-3">
              {problem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-[8px] border border-border bg-surface-1 p-4"
                >
                  <p className="mb-1 text-eyebrow uppercase text-muted-foreground">
                    Example {idx + 1}
                  </p>
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                        Input
                      </p>
                      <pre className="mt-1 overflow-x-auto rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                        {ex.input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                        Output
                      </p>
                      <pre className="mt-1 overflow-x-auto rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                        {ex.output}
                      </pre>
                    </div>
                    <div>
                      <p className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                        Explanation
                      </p>
                      <p className="mt-1 text-body-sm leading-relaxed text-muted-foreground">
                        <InlineMarkdown text={ex.explanation} />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Test Cases */}
          {problem.testCases && problem.testCases.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="surface-card p-6"
            >
              <h3 className="mb-4 text-h4 font-semibold tracking-tight text-foreground">
                Test cases
              </h3>
              <div className="space-y-3">
                {problem.testCases.map((testCase, idx) => (
                  <div
                    key={idx}
                    className="rounded-[8px] border border-border bg-surface-1 p-4"
                  >
                    <p className="mb-2 flex items-center gap-2 text-eyebrow uppercase text-muted-foreground">
                      <span>Case {String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-foreground-subtle">·</span>
                      <span className="normal-case tracking-normal text-muted-foreground">
                        {testCase.description}
                      </span>
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div>
                        <p className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                          Input
                        </p>
                        <pre className="mt-1 overflow-x-auto rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                          Expected
                        </p>
                        <pre className="mt-1 overflow-x-auto rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                          {testCase.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Constraints */}
          <section className="surface-card p-6">
            <h3 className="mb-4 text-h4 font-semibold tracking-tight text-foreground">
              Constraints
            </h3>
            <ul className="space-y-1.5">
              {problem.constraints.map((constraint, idx) => (
                <li
                  key={idx}
                  className="border-l-2 border-border pl-3 text-body-sm leading-relaxed text-muted-foreground"
                >
                  <InlineMarkdown text={constraint} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Code Editor */}
        <div className="min-w-0 space-y-6">
          {/* Language Selector + Hint */}
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                setCode(languageTemplates[e.target.value])
              }}
              className="h-10 rounded-md border border-border bg-surface-1 px-3 text-body-sm text-foreground shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Select language"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={handleGetHint}
              disabled={hintLoading}
              className="btn-secondary"
            >
              {hintLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              Get AI hint
            </button>
          </div>

          {/* Editor */}
          <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-card">
            <MonacoEditor
              height="500px"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* AI Hint Display */}
          <AnimatePresence>
            {showHint && hint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-6 border border-neon-cyan/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-neon-cyan" />
                  <h3 className="text-xl font-bold">AI Hint</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Problematic Line:</span>
                    <span className="ml-2 text-neon-cyan font-bold">Line {hint.problematicLine}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Concept:</span>
                    <span className="ml-2">{hint.concept}</span>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-foreground/80">{hint.explanation}</p>
                  </div>
                  <div className="bg-neon-cyan/10 p-4 rounded-lg border border-neon-cyan/30">
                    <p className="text-neon-cyan font-bold">💡 Hint: {hint.hint}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Review: <span className="text-neon-purple">{hint.reviewConcept}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progressive Hints */}
          {problem.hints.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progressive Hints</span>
                <span className="text-xs text-muted-foreground/80">
                  {currentHintIndex + 1} / {problem.hints.length}
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg mb-2">
                <p className="text-sm text-foreground/80">{problem.hints[currentHintIndex]}</p>
              </div>
              {currentHintIndex < problem.hints.length - 1 && (
                <button
                  onClick={handleNextHint}
                  className="text-sm text-neon-cyan hover:underline"
                >
                  Show next hint →
                </button>
              )}
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={executing || !code.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50"
          >
            {executing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Code
              </>
            )}
          </button>

          {/* Test Results */}
          <AnimatePresence>
            {testResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="surface-card overflow-hidden p-6"
              >
                <h3 className="mb-4 text-h4 font-semibold tracking-tight text-foreground">
                  Test results
                </h3>
                <div className="space-y-3">
                  {testResults.map((result, idx) => {
                    const tone = result.passed
                      ? 'border-success/25 bg-success/8'
                      : 'border-destructive/25 bg-destructive/8'
                    const accent = result.passed ? 'text-success' : 'text-destructive'
                    return (
                      <div
                        key={idx}
                        className={`min-w-0 overflow-hidden rounded-[8px] border p-4 ${tone}`}
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] ${
                              result.passed
                                ? 'border-success/30 bg-success/15 text-success'
                                : 'border-destructive/30 bg-destructive/15 text-destructive'
                            }`}
                          >
                            {result.passed ? 'Pass' : 'Fail'}
                          </span>
                          <span className="text-body-sm font-medium text-foreground">
                            Test {String(idx + 1).padStart(2, '0')}
                          </span>
                          {result.status && (
                            <span className="text-caption text-muted-foreground">
                              · {result.status}
                            </span>
                          )}
                        </div>

                        <dl className="space-y-2 text-body-sm">
                          <div className="min-w-0">
                            <dt className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                              Input
                            </dt>
                            <dd>
                              <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                                {result.input}
                              </pre>
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-caption font-medium uppercase tracking-[0.04em] text-muted-foreground">
                              Expected
                            </dt>
                            <dd>
                              <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-[6px] border border-border bg-background px-3 py-2 font-mono text-caption text-foreground">
                                {result.expected}
                              </pre>
                            </dd>
                          </div>
                          {!result.passed && (
                            <div className="min-w-0">
                              <dt className={`text-caption font-medium uppercase tracking-[0.04em] ${accent}`}>
                                Got
                              </dt>
                              <dd>
                                <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-[6px] border border-destructive/25 bg-destructive/8 px-3 py-2 font-mono text-caption text-destructive">
                                  {result.got}
                                </pre>
                              </dd>
                            </div>
                          )}
                          {!result.passed && result.error && (
                            <div className="min-w-0 rounded-[6px] border border-destructive/25 bg-destructive/8 p-3">
                              <p className={`text-caption font-medium uppercase tracking-[0.04em] ${accent}`}>
                                Error
                              </p>
                              <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-caption text-destructive">
                                {result.error}
                              </pre>
                            </div>
                          )}
                        </dl>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Completion */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 border-2 border-neon-green"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-neon-green" />
                <h3 className="text-2xl font-bold text-neon-green">Challenge Complete!</h3>
              </div>
              <p className="text-foreground/80 mb-4">
                Great job! You've mastered the {difficulty} level for {unit}.
              </p>
              <button
                onClick={handleNextDifficulty}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {difficulty === 'Advanced' ? 'Complete Unit' : `Try ${difficulty === 'Basic' ? 'Medium' : 'Advanced'} Level`}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
