'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Play, Loader2, Trophy, RotateCcw, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { CONTEST_PROBLEMS } from '@/lib/contestProblems'
import MonacoEditor from '@/components/MonacoEditor'

export default function MarathonSolvePage() {
  const params = useParams()
  const router = useRouter()
  const marathonId = params.id as string
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [executing, setExecuting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Use static problems
  const problems = CONTEST_PROBLEMS.map((p, idx) => ({
    id: `problem-${idx}`,
    ...p
  }))

  useEffect(() => {
    const initUser = async () => {
      if (typeof window === 'undefined') return
      const { ensureUserExists } = await import('@/lib/database/userManagement')
      const dbUserId = await ensureUserExists()
      setUserId(dbUserId)
    }
    initUser()
    setCode(getLanguageTemplate(language))
    setLoading(false)
  }, [])

  const getLanguageTemplate = (lang: string): string => {
    const templates: Record<string, string> = {
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
result = 0

# Print the result
print(result)
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    
    // Parse input
    vector<int> arr;
    stringstream ss(line);
    string token;
    while (ss >> token) {
        arr.push_back(stoi(token));
    }
    
    // Your solution here
    int result = 0;
    
    // Print result
    cout << result << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        
        // Parse input
        String[] parts = line.split(" ");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i]);
        }
        
        // Your solution here
        int result = 0;
        
        // Print result
        System.out.println(result);
    }
}
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    // Parse input
    const arr = line.split(' ').map(Number);
    
    // Your solution here
    let result = 0;
    
    // Print result
    console.log(result);
    rl.close();
});
`
    }
    return templates[lang] || templates.python
  }

  const currentProblem = problems[currentProblemIndex]

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    setExecuting(true)
    setTestResults([])

    try {
      const testCases = currentProblem.testCases.testCases || currentProblem.testCases.examples || []
      
      if (testCases.length === 0) {
        toast.error('No test cases available')
        setExecuting(false)
        return
      }

      toast.loading(`Running ${testCases.length} test cases...`, { id: 'test-run' })

      const results = await Promise.all(
        testCases.map(async (testCase: any) => {
          try {
            const response = await axios.post('/api/judge0/execute', {
              code,
              language,
              stdin: testCase.input,
              expectedOutput: testCase.output
            })

            const result = response.data.result
            const passed = result.passed || (result.stdout?.trim() === testCase.output.trim())
            
            return {
              passed,
              input: testCase.input,
              expected: testCase.output,
              got: result.stdout || result.stderr || '',
              status: result.status,
              error: result.stderr || result.compileOutput || null
            }
          } catch (error: any) {
            return {
              passed: false,
              input: testCase.input,
              expected: testCase.output,
              got: error.response?.data?.error || 'Execution error',
              status: 'Error',
              error: 'Failed to execute'
            }
          }
        })
      )

      toast.dismiss('test-run')
      setTestResults(results)

      const allPassed = results.every(r => r.passed)
      if (allPassed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('All tests passed! 🎉')
        setSolvedProblems(new Set([...solvedProblems, currentProblemIndex]))
      } else {
        const passedCount = results.filter(r => r.passed).length
        toast.error(`${passedCount}/${results.length} tests passed`)
      }
    } catch (error: any) {
      toast.dismiss('test-run')
      toast.error('Code execution failed')
      console.error('Error running code:', error)
    } finally {
      setExecuting(false)
    }
  }

  const handleComplete = async () => {
    if (!userId) {
      toast.error('User not initialized')
      return
    }

    // Check if all problems are solved
    const allSolved = problems.every((_, idx) => solvedProblems.has(idx))
    
    if (!allSolved) {
      toast.error('Please solve all problems before completing!')
      return
    }

    // Redirect to completion page
    router.push(`/marathons/${marathonId}/complete`)
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    setCode(getLanguageTemplate(newLang))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-warning border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marathon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Marathon Problems</h1>
          <div className="flex gap-4">
            <button
              onClick={handleComplete}
              disabled={problems.some((_, idx) => !solvedProblems.has(idx))}
              className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="w-5 h-5" />
              Complete Marathon
            </button>
          </div>
        </div>

        {/* Problem Toggle */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-2">
            {problems.map((problem, index) => (
              <button
                key={problem.id}
                onClick={() => {
                  setCurrentProblemIndex(index)
                  setCode(getLanguageTemplate(language))
                  setTestResults([])
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentProblemIndex === index
                    ? 'bg-warning text-primary-foreground font-bold'
                    : 'bg-card hover:bg-card/80'
                } ${solvedProblems.has(index) ? 'border-2 border-success' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {solvedProblems.has(index) && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  Problem {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Problem Details */}
        {currentProblem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Description */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{currentProblem.title}</h2>
                {solvedProblems.has(currentProblemIndex) && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold">Solved!</span>
                  </div>
                )}
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <div className="text-foreground/80 mb-6 whitespace-pre-wrap leading-relaxed">
                  {currentProblem.description}
                </div>

                {currentProblem.testCases.examples && currentProblem.testCases.examples.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">Examples:</h3>
                    {currentProblem.testCases.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 bg-card rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-bold text-primary">Input:</span>{' '}
                          <code className="text-foreground bg-background px-2 py-1 rounded">{ex.input}</code>
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-bold text-success">Output:</span>{' '}
                          <code className="text-foreground bg-background px-2 py-1 rounded">{ex.output}</code>
                        </p>
                        {ex.explanation && (
                          <p className="text-sm text-muted-foreground/80 mt-2 italic">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentProblem.testCases.constraints && currentProblem.testCases.constraints.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">Constraints:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {currentProblem.testCases.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="text-foreground/80">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor */}
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <button
                  onClick={() => setCode(getLanguageTemplate(language))}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <MonacoEditor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />

              <div className="mt-4">
                <button
                  onClick={handleRun}
                  disabled={executing || !code.trim()}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Tests
                    </>
                  )}
                </button>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-bold mb-2">Test Results:</h3>
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        result.passed
                          ? 'bg-success/10 border-success'
                          : 'bg-red-500/10 border-red-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-bold">
                          Test {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Input: <code className="text-foreground">{result.input}</code></p>
                        <p>Expected: <code className="text-foreground">{result.expected}</code></p>
                        {!result.passed && (
                          <p>Got: <code className="text-foreground">{result.got}</code></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




