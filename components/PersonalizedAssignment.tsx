'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Play, Loader2, AlertCircle, Lightbulb, CheckCircle2, Sparkles, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import FrontendPreview from './FrontendPreview'
import FrontendEditor from './FrontendEditor'
import { DOMAINS } from '@/lib/subjects'
import { saveUserAttempt, saveUserProgress } from '@/lib/userAttempts'
import MonacoEditor from './MonacoEditor'

interface Assignment {
  title: string
  description: string
  targetDifficulty: 'Basic' | 'Medium' | 'Advanced'
  personalizedNote: string
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  testCases: Array<{
    input: string
    output: string
    description: string
  }>
  constraints: string[]
  hints: string[]
  learningObjectives: string[]
  verified?: boolean
  verificationFeedback?: string
  verificationIssues?: string[]
  verificationSuggestions?: string[]
}

interface PersonalizedAssignmentProps {
  subject: string
  unit: string
  subtopic: string
  subjectId?: string
  unitId?: string
  subtopicId?: string
  phase?: string
  onComplete: () => void
}

export default function PersonalizedAssignment({
  subject,
  unit,
  subtopic,
  subjectId,
  unitId,
  subtopicId,
  phase,
  onComplete,
}: PersonalizedAssignmentProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
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
  const [sqlResults, setSqlResults] = useState<any[]>([])
  const [sqlRowCount, setSqlRowCount] = useState(0)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [frontendPreview, setFrontendPreview] = useState<{ html?: string; css?: string; javascript?: string; react?: string; language: string } | null>(null)

  // Check if subject is DBMS/SQL
  const isDBMS = subject.toLowerCase().includes('database') || 
                 subject.toLowerCase().includes('dbms') || 
                 subject.toLowerCase().includes('sql')

  // Check if subject is in frontend or backend domain
  const isFrontendBackend = (() => {
    const frontendSubjects = DOMAINS.frontend.subjects
    const backendSubjects = DOMAINS.backend.subjects
    const subjectLower = subject.toLowerCase()
    
    return frontendSubjects.some(s => s.toLowerCase() === subjectLower) ||
           backendSubjects.some(s => s.toLowerCase() === subjectLower)
  })()

  const [frontendQuestion, setFrontendQuestion] = useState<any>(null)

  // Language templates with input reading
  const languageTemplates: Record<string, string> = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>`,
    css: `/* Your CSS here */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}`,
    javascript: `// Your JavaScript here
console.log('Hello World!');`,
    react: `import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`,
    nodejs: `// Node.js code
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
    express: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
    django: `from django.http import HttpResponse

def hello(request):
    return HttpResponse("Hello World!")`,
    flask: `from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()`,
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
    sql: `-- Write your SQL query here
-- Example: SELECT * FROM employees;`
  }

  // Determine initial language based on subject
  const getInitialLanguage = (): string => {
    if (isDBMS) return 'sql'
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('frontend') || subjectLower.includes('html') || subjectLower.includes('react') || subjectLower.includes('angular')) {
      return 'html'
    }
    if (subjectLower.includes('backend') || subjectLower.includes('node') || subjectLower.includes('express') || subjectLower.includes('django') || subjectLower.includes('flask')) {
      return 'python'
    }
    if (subjectLower.includes('machine learning') || subjectLower.includes('ml') || subjectLower.includes('deep learning')) {
      return 'python'
    }
    return 'python'
  }
  
  const [language, setLanguage] = useState(getInitialLanguage())

  useEffect(() => {
    fetchAssignment()
    setCode(languageTemplates[language])
  }, [])

  useEffect(() => {
    // Update code when language changes
    setCode(languageTemplates[language])
  }, [language])

  // Calculate mastery level and performance metrics (mock for now, would come from database)
  const calculateMasteryLevel = (): number => {
    // In real app, this would be calculated from user's past performance
    // For now, return a default value
    return 0.5
  }

  const getPerformanceMetrics = () => {
    // In real app, this would come from database
    return {
      basicSolved: 3,
      mediumSolved: 2,
      hardSolved: 1,
      averageTime: 15,
      codeQuality: 'medium' as 'low' | 'medium' | 'high'
    }
  }

  const fetchAssignment = async () => {
    try {
      setLoading(true)
      
      // For frontend/backend, use the questions API
      if (isFrontendBackend) {
        const masteryLevel = calculateMasteryLevel()
        // Map numeric mastery score (0-1) to difficulty
        const difficulty = masteryLevel < 0.4 ? 'Basic' :
                          masteryLevel < 0.75 ? 'Medium' : 'Advanced'
        
        console.log('📚 Fetching frontend/backend question...', {
          subject,
          unit,
          subtopic,
          difficulty
        })

        const response = await axios.get('/api/questions/frontend-backend', {
          params: {
            subject,
            unit,
            subtopic,
            difficulty,
            random: 'true'
          }
        })

        if (response.data?.question) {
          console.log('✅ Question received:', response.data.question.title)
          setFrontendQuestion(response.data.question)
          setError(null)
          setCompleted(false)
          toast.success('Question loaded!')
        } else {
          throw new Error(response.data?.error || 'No question found')
        }
        return
      }

      // For other subjects, use the existing Gemini API
      const masteryLevel = calculateMasteryLevel()
      const performanceMetrics = getPerformanceMetrics()

      console.log('📚 Fetching personalized assignment...', {
        subject,
        unit,
        subtopic,
        masteryLevel,
        performanceMetrics
      })

      const response = await axios.post('/api/gemini/assignment', {
        subject,
        unit,
        subtopic,
        masteryLevel,
        performanceMetrics,
      })

      if (response.data?.assignment) {
        console.log('✅ Assignment received:', response.data.assignment.title)
        setAssignment(response.data.assignment)
        setCode(languageTemplates[language])
        setError(null)
        setTestResults([])
        setSqlResults([])
        setSqlRowCount(0)
        setCompleted(false)
        
        // Show verification status
        if (response.data.assignment.verified === false) {
          toast('Assignment has some issues but is still usable', { icon: '⚠️' })
        } else {
          toast.success('Personalized assignment generated and verified!')
        }
      } else if (response.data?.error) {
        const errorMsg = response.data.error
        const suggestion = response.data.suggestion || ''
        
        // Show detailed error with suggestion
        if (errorMsg.includes('API key') || errorMsg.includes('GEMINI_API_KEY')) {
          toast.error(`${errorMsg} ${suggestion}`, { duration: 6000 })
        } else {
          toast.error(errorMsg)
        }
        
        throw new Error(errorMsg)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Error fetching assignment:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load assignment'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Detect language type for proper execution
  const getLanguageType = (lang: string, subj: string): string => {
    const subjectLower = subj.toLowerCase()
    
    // Frontend languages
    if (['html', 'css', 'javascript', 'js'].includes(lang) || 
        subjectLower.includes('frontend') || 
        subjectLower.includes('html') || 
        subjectLower.includes('react') || 
        subjectLower.includes('angular') ||
        subjectLower.includes('vue')) {
      if (lang === 'javascript' || lang === 'js') return 'javascript'
      if (subjectLower.includes('react')) return 'react'
      return lang
    }
    
    // Backend languages
    if (['nodejs', 'node', 'express', 'django', 'flask'].includes(lang) ||
        subjectLower.includes('backend') ||
        subjectLower.includes('node') ||
        subjectLower.includes('express') ||
        subjectLower.includes('django') ||
        subjectLower.includes('flask')) {
      if (lang === 'node' || lang === 'nodejs') return 'nodejs'
      return lang
    }
    
    // ML languages
    if (subjectLower.includes('machine learning') ||
        subjectLower.includes('ml') ||
        subjectLower.includes('deep learning') ||
        subjectLower.includes('neural') ||
        subjectLower.includes('tensorflow') ||
        subjectLower.includes('pytorch')) {
      return 'ml-python'
    }
    
    // SQL
    if (lang === 'sql' || isDBMS) {
      return 'sql'
    }
    
    // Default to regular languages
    return lang
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    if (!assignment) {
      toast.error('No assignment loaded')
      return
    }

    setExecuting(true)
    setTestResults([])

    try {
      const languageType = getLanguageType(language, subject)
      
      // For DBMS/SQL, use SQL execution endpoint
      if (languageType === 'sql') {
        // SQL execution for assignments
        // Use a default schema for SQL assignments (employees table)
        const defaultSchema = `
          CREATE TABLE employees (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            salary INTEGER NOT NULL,
            hire_date TEXT NOT NULL
          );
        `
        const defaultSeedData = `
          INSERT INTO employees (id, name, department, salary, hire_date) VALUES
          (1, 'John Doe', 'Engineering', 75000, '2020-01-15'),
          (2, 'Jane Smith', 'Marketing', 65000, '2019-03-20'),
          (3, 'Bob Johnson', 'Engineering', 80000, '2018-06-10'),
          (4, 'Alice Williams', 'Sales', 60000, '2021-02-05'),
          (5, 'Charlie Brown', 'Engineering', 90000, '2017-11-30');
        `

        try {
          const response = await axios.post('/api/sql/execute', {
            query: code.trim(),
            schema: defaultSchema,
            seedData: defaultSeedData,
          })

          if (response.data.success) {
            const results = response.data.results || []
            const rowCount = response.data.rowCount || 0

            // Store SQL results for display
            setSqlResults(results)
            setSqlRowCount(rowCount)
            setTestResults([])

            await saveUserAttempt({
              type: 'assignment',
              subjectId,
              subjectName: subject,
              unitId,
              unitName: unit,
              subtopicId,
              subtopicName: subtopic,
              phase: phase ?? 'assignment',
              difficulty: assignment.targetDifficulty,
              problemTitle: assignment.title,
              prompt: assignment.description,
              language: 'sql',
              code: code.trim(),
              status: 'completed',
              score: 100,
              passedCount: 1,
              totalCount: 1,
              sqlResult: {
                rows: results,
                rowCount,
              },
              metadata: {
                executionType: 'sql',
                learningObjectives: assignment.learningObjectives ?? [],
              },
            })

            await saveUserProgress({
              subjectId,
              unitId,
              subtopicId,
              phase: phase ?? 'assignment',
              codingScore: 100,
            })

            // For SQL, we'll show results instead of test case validation
            // Since assignments don't have predefined expected outputs for SQL,
            // we'll mark it as completed if query executes successfully
            setCompleted(true)
            toast.success(`Query executed successfully! Returned ${rowCount} row${rowCount !== 1 ? 's' : ''}.`)
            
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })

            setTimeout(() => {
              onComplete()
            }, 2000)
          } else {
            throw new Error(response.data.error || 'SQL execution failed')
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || err.message || 'SQL execution failed'
          setSqlResults([])
          setSqlRowCount(0)
          setTestResults([{
            passed: false,
            input: 'SQL Query',
            expected: 'Valid SQL query',
            got: errorMessage,
            status: 'Error',
            error: errorMessage,
          }])
          await saveUserAttempt({
            type: 'assignment',
            subjectId,
            subjectName: subject,
            unitId,
            unitName: unit,
            subtopicId,
            subtopicName: subtopic,
            phase: phase ?? 'assignment',
            difficulty: assignment.targetDifficulty,
            problemTitle: assignment.title,
            prompt: assignment.description,
            language: 'sql',
            code: code.trim(),
            status: 'failed',
            score: 0,
            passedCount: 0,
            totalCount: 1,
            sqlResult: {
              rows: [],
              rowCount: 0,
              errorMessage,
            },
            metadata: {
              executionType: 'sql',
            },
          })
          toast.error(errorMessage)
        } finally {
          setExecuting(false)
        }
        return
      } else {
        // Use unified code execution API for all languages
        if (!assignment.testCases || assignment.testCases.length === 0) {
          toast.error('No test cases available')
          setExecuting(false)
          return
        }

        // Execute code against all test cases
        const results = await Promise.all(
          assignment.testCases.map(async (testCase) => {
            try {
              const response = await axios.post('/api/code/execute', {
                code,
                language: languageType,
                stdin: testCase.input,
                expectedOutput: testCase.output,
                context: languageType === 'sql' ? {
                  schema: (assignment.testCases?.[0] as any)?.schema,
                  seedData: (assignment.testCases?.[0] as any)?.seedData
                } : undefined
              })

              const executionResult = response.data.result

              // Log execution details for debugging
              console.log('Test case execution:', {
                input: testCase.input,
                expected: testCase.output,
                stdout: executionResult.stdout,
                stderr: executionResult.stderr,
                compileOutput: executionResult.compileOutput,
                status: executionResult.status,
                passed: executionResult.passed
              })

              return {
                passed: executionResult.passed,
                input: testCase.input,
                expected: testCase.output,
                got: executionResult.stdout?.trim() || executionResult.stderr?.trim() || executionResult.compileOutput?.trim() || 'No output',
                status: executionResult.status,
                error: executionResult.stderr || executionResult.compileOutput || null,
              }
            } catch (err: any) {
              return {
                passed: false,
                input: testCase.input,
                expected: testCase.output,
                got: err.response?.data?.error || 'Execution error',
                status: 'Error',
                error: err.response?.data?.error || 'Failed to execute',
              }
            }
          })
        )

        setTestResults(results)

        const allPassed = results.every((r: any) => r.passed)
        const passedCount = results.filter((r: any) => r.passed).length
        const score = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0
        const failedStatus = results.find((r: any) => !r.passed)?.status?.toLowerCase() ?? ''
        const status = allPassed
          ? 'completed'
          : passedCount > 0
          ? 'partial'
          : failedStatus.includes('compile')
          ? 'compile_error'
          : failedStatus.includes('runtime')
          ? 'runtime_error'
          : 'wrong_answer'

        await saveUserAttempt({
          type: 'assignment',
          subjectId,
          subjectName: subject,
          unitId,
          unitName: unit,
          subtopicId,
          subtopicName: subtopic,
          phase: phase ?? 'assignment',
          difficulty: assignment.targetDifficulty,
          problemTitle: assignment.title,
          prompt: assignment.description,
          language,
          code,
          status,
          score,
          passedCount,
          totalCount: results.length,
          testResults: results.map((result: any) => ({
            passed: result.passed,
            input: result.input,
            expected: result.expected,
            actual: result.got,
            status: result.status,
            errorMessage: result.error ?? undefined,
          })),
          metadata: {
            executionType: 'code',
            learningObjectives: assignment.learningObjectives ?? [],
          },
        })

        if (allPassed) {
          await saveUserProgress({
            subjectId,
            unitId,
            subtopicId,
            phase: phase ?? 'assignment',
            codingScore: score,
          })
          setCompleted(true)
          toast.success('🎉 All test cases passed! Assignment completed!')
          
          // Confetti celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })

          setTimeout(() => {
            onComplete()
          }, 2000)
        } else {
          toast.error(`${passedCount}/${results.length} test cases passed. Keep trying!`)
        }
      }
    } catch (error: any) {
      console.error('Error executing code:', error)
      toast.error(error.response?.data?.error || 'Failed to execute code')
    } finally {
      setExecuting(false)
    }
  }

  // Show FrontendEditor for frontend/backend subjects
  if (isFrontendBackend) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 text-neon-cyan animate-spin mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Loading question...</p>
          </motion.div>
        </div>
      )
    }

    if (!frontendQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-2xl text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Failed to Load Question</h2>
            <p className="text-muted-foreground mb-6">{error || 'No question found for this topic'}</p>
            <button onClick={fetchAssignment} className="btn-primary">
              Try Again
            </button>
          </motion.div>
        </div>
      )
    }

    const masteryLevel = calculateMasteryLevel()
    const difficulty = masteryLevel < 0.4 ? 'Basic' :
                      masteryLevel < 0.75 ? 'Medium' : 'Advanced'

    return (
      <FrontendEditor
        subject={subject}
        unit={unit}
        subtopic={subtopic}
        subjectId={subjectId}
        unitId={unitId}
        subtopicId={subtopicId}
        phase={phase ?? 'assignment'}
        difficulty={difficulty}
        question={frontendQuestion}
        onComplete={onComplete}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Generating your personalized assignment...</p>
          <p className="text-sm text-muted-foreground/80 mt-2">This may take a moment</p>
        </motion.div>
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Failed to Load Assignment</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={fetchAssignment} className="btn-primary">
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  if (!assignment) return null

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header with Personalized Note */}
        <div className="glass-card p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neon-purple/20 rounded-lg">
              <Sparkles className="w-8 h-8 text-neon-purple" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold neon-text mb-2">{assignment.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan rounded-full text-sm">
                  {assignment.targetDifficulty} Level
                </span>
                {assignment.verified && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-neon-purple mt-0.5" />
                  <div>
                    <p className="font-semibold text-neon-purple mb-1">Personalized for You</p>
                    <p className="text-foreground/80 text-sm">{assignment.personalizedNote}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Problem Description</h2>
          <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {assignment.description}
          </p>
        </div>

        {/* Learning Objectives */}
        {assignment.learningObjectives && assignment.learningObjectives.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Learning Objectives</h2>
            <ul className="space-y-2">
              {assignment.learningObjectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {assignment.examples && assignment.examples.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Examples</h2>
            <div className="space-y-4">
              {assignment.examples.map((example, idx) => (
                <div key={idx} className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Input</p>
                      <p className="text-foreground font-mono text-sm">{example.input}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Output</p>
                      <p className="text-foreground font-mono text-sm">{example.output}</p>
                    </div>
                  </div>
                  <p className="text-foreground/80 text-sm mt-2">{example.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {assignment.constraints && assignment.constraints.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Constraints</h2>
            <ul className="space-y-2">
              {assignment.constraints.map((constraint, idx) => (
                <li key={idx} className="text-foreground/80 flex items-start gap-2">
                  <span className="text-neon-cyan">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Code Editor */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Solution</h2>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value)
                  setCode(languageTemplates[e.target.value] || '')
                  setFrontendPreview(null) // Clear preview on language change
                }}
                className="bg-card border border-border rounded-lg px-4 py-2 text-foreground"
              >
                {isDBMS ? (
                  <option value="sql">SQL</option>
                ) : subject.toLowerCase().includes('frontend') || subject.toLowerCase().includes('html') || subject.toLowerCase().includes('react') || subject.toLowerCase().includes('angular') ? (
                  <>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                    {subject.toLowerCase().includes('react') && <option value="react">React</option>}
                  </>
                ) : subject.toLowerCase().includes('backend') || subject.toLowerCase().includes('node') || subject.toLowerCase().includes('express') || subject.toLowerCase().includes('django') || subject.toLowerCase().includes('flask') ? (
                  <>
                    <option value="python">Python</option>
                    <option value="nodejs">Node.js</option>
                    <option value="express">Express.js</option>
                    <option value="django">Django</option>
                    <option value="flask">Flask</option>
                  </>
                ) : subject.toLowerCase().includes('machine learning') || subject.toLowerCase().includes('ml') || subject.toLowerCase().includes('deep learning') ? (
                  <>
                    <option value="python">Python (ML)</option>
                  </>
                ) : (
                  <>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </>
                )}
              </select>
              <button
                onClick={handleRunCode}
                disabled={executing || completed}
                className="btn-primary flex items-center gap-2"
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
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
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
                automaticLayout: true,
                wordWrap: language === 'sql' ? 'on' : 'off',
                formatOnPaste: language === 'sql',
                formatOnType: language === 'sql',
              }}
            />
          </div>
        </div>

        {/* Hints */}
        {assignment.hints && assignment.hints.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-neon-yellow" />
                Hints
              </h2>
              <button
                onClick={() => {
                  if (!showHints) {
                    setShowHints(true)
                    setCurrentHintIndex(0)
                  } else if (currentHintIndex < assignment.hints.length - 1) {
                    setCurrentHintIndex(currentHintIndex + 1)
                  }
                }}
                className="btn-secondary text-sm"
                disabled={showHints && currentHintIndex >= assignment.hints.length - 1}
              >
                {!showHints
                  ? 'Show Hint'
                  : currentHintIndex < assignment.hints.length - 1
                  ? 'Next Hint'
                  : 'All Hints Shown'}
              </button>
            </div>
            {showHints && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHintIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-4"
                >
                  <p className="text-foreground/80">
                    <span className="font-semibold text-neon-yellow">Hint {currentHintIndex + 1}:</span>{' '}
                    {assignment.hints[currentHintIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* SQL Results */}
        {isDBMS && language === 'sql' && sqlResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-neon-green" />
                Query Results
              </h2>
              <span className="text-muted-foreground">{sqlRowCount} row{sqlRowCount !== 1 ? 's' : ''}</span>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    {Object.keys(sqlResults[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-neon-cyan font-semibold"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sqlResults.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/30 hover:bg-neon-cyan/5 transition-colors"
                    >
                      {Object.values(row).map((value: any, colIdx) => (
                        <td key={colIdx} className="px-4 py-2 text-foreground/80">
                          {value !== null && value !== undefined ? String(value) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Frontend Preview */}
        {frontendPreview && (
          <FrontendPreview
            html={frontendPreview.html}
            css={frontendPreview.css}
            javascript={frontendPreview.javascript}
            react={frontendPreview.react}
            language={frontendPreview.language}
          />
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    result.passed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-semibold">
                      Test Case {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  {assignment.testCases?.[idx] && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {assignment.testCases[idx].description}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Input</p>
                      <p className="text-foreground font-mono">{result.input}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Expected</p>
                      <p className="text-foreground font-mono">{result.expected}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Got</p>
                      <p className="text-foreground font-mono">{result.got}</p>
                    </div>
                  </div>
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-500/20 rounded text-sm text-red-300 font-mono">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border-2 border-neon-green"
          >
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-neon-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Assignment Completed! 🎉</h2>
              <p className="text-foreground/80">Great job! You've mastered this personalized challenge!</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
