'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Play, Loader2, AlertCircle, CheckCircle2, Database, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { getSQLQuestion, type SQLQuestion } from '@/lib/sqlDatabase'
import { saveUserAttempt, saveUserProgress } from '@/lib/userAttempts'
import type * as monaco from 'monaco-editor'
import MonacoEditor from './MonacoEditor'

interface SQLChallengeProps {
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

export default function SQLChallenge({
  subject,
  unit,
  subtopic,
  subjectId,
  unitId,
  subtopicId,
  phase,
  difficulty: propDifficulty,
  onComplete,
}: SQLChallengeProps) {
  const [question, setQuestion] = useState<SQLQuestion | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>(propDifficulty || 'Basic')
  const [sqlQuery, setSqlQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sqlError, setSqlError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  // SQL template - empty by default, user writes their query
  const sqlTemplate = `-- Write your SQL query here
-- Example: SELECT * FROM employees;`

  useEffect(() => {
    fetchQuestion()
  }, [subject, unit, subtopic, difficulty])

  const fetchQuestion = () => {
    try {
      setLoading(true)
      const sqlQuestion = getSQLQuestion(subject, unit, subtopic || unit, difficulty)
      
      if (sqlQuestion) {
        setQuestion(sqlQuestion)
        setSqlQuery(sqlTemplate)
        setError(null)
        setSqlError(null)
        setResults([])
        setCompleted(false)
        setErrorLine(null)
      } else {
        throw new Error('SQL question not found')
      }
    } catch (error: any) {
      console.error('Error fetching SQL question:', error)
      toast.error(error.message || 'Failed to load SQL question')
      setQuestion(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure SQL language
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
    })
  }

  const highlightErrorLine = (lineNumber: number) => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    // Import Monaco types dynamically
    const monaco = (window as any).monaco
    if (!monaco) return

    // Remove existing decorations
    const decorations = editor.deltaDecorations([], [])

    // Add error decoration
    const newDecorations = [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineLength(lineNumber) + 1),
        options: {
          isWholeLine: true,
          className: 'bg-red-500/20',
          glyphMarginClassName: 'bg-red-500',
          minimap: {
            color: { id: 'error' },
            position: 1,
          },
          overviewRuler: {
            color: { id: 'error' },
            position: 1,
          },
        },
      },
    ]

    editor.deltaDecorations(decorations, newDecorations)
  }

  const handleRun = async () => {
    if (!sqlQuery.trim()) {
      toast.error('Please write a SQL query first')
      return
    }

    if (!question) {
      toast.error('No question loaded')
      return
    }

    setExecuting(true)
    setError(null)
    setSqlError(null)
    setResults([])
    setRowCount(0)
    setErrorLine(null)

    try {
      const response = await axios.post('/api/sql/execute', {
        query: sqlQuery.trim(),
        questionId: question.id,
      })

      if (response.data.success) {
        const queryResults = response.data.results || []
        const resultRowCount = response.data.rowCount || 0
        setResults(queryResults)
        setRowCount(resultRowCount)
        setSqlError(null)
        setErrorLine(null)
        
        // Clear any error decorations
        if (editorRef.current) {
          editorRef.current.deltaDecorations([], [])
        }
        
        // Query executed successfully
        toast.success(`Query executed successfully! Returned ${resultRowCount} row${resultRowCount !== 1 ? 's' : ''}.`)

        await saveUserAttempt({
          type: 'sql',
          subjectId,
          subjectName: subject,
          unitId,
          unitName: unit,
          subtopicId,
          subtopicName: subtopic,
          phase: phase ?? difficulty.toLowerCase(),
          difficulty,
          problemId: question.id,
          problemTitle: question.title,
          prompt: question.description,
          language: 'sql',
          code: sqlQuery.trim(),
          status: 'completed',
          score: 100,
          passedCount: 1,
          totalCount: 1,
          sqlResult: {
            rows: queryResults,
            rowCount: resultRowCount,
          },
        })

        await saveUserProgress({
          subjectId,
          unitId,
          subtopicId,
          phase: phase ?? difficulty.toLowerCase(),
          codingScore: 100,
        })
        
        // Mark as completed (user can continue to next challenge)
        setCompleted(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      } else {
        throw new Error(response.data.error || 'Query execution failed')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Query execution failed'
      setError(errorMessage)
      setSqlError(errorMessage)
      await saveUserAttempt({
        type: 'sql',
        subjectId,
        subjectName: subject,
        unitId,
        unitName: unit,
        subtopicId,
        subtopicName: subtopic,
        phase: phase ?? difficulty.toLowerCase(),
        difficulty,
        problemId: question.id,
        problemTitle: question.title,
        prompt: question.description,
        language: 'sql',
        code: sqlQuery.trim(),
        status: 'failed',
        score: 0,
        passedCount: 0,
        totalCount: 1,
        sqlResult: {
          rows: [],
          rowCount: 0,
          errorMessage,
        },
      })
      
      // Try to extract line number from error
      const lineMatch = errorMessage.match(/line\s+(\d+)/i) || errorMessage.match(/near\s+line\s+(\d+)/i)
      if (lineMatch) {
        const lineNum = parseInt(lineMatch[1])
        setErrorLine(lineNum)
        // Delay highlighting to ensure Monaco is loaded
        setTimeout(() => highlightErrorLine(lineNum), 100)
      } else {
        // Try to find "near" keyword which often indicates error location
        const nearMatch = errorMessage.match(/near\s+["']([^"']+)["']/i)
        if (nearMatch) {
          // Find the line containing the problematic text
          const problematicText = nearMatch[1]
          const lines = sqlQuery.split('\n')
          const errorLineIndex = lines.findIndex(line => line.includes(problematicText))
          if (errorLineIndex >= 0) {
            setErrorLine(errorLineIndex + 1)
            setTimeout(() => highlightErrorLine(errorLineIndex + 1), 100)
          } else {
            setErrorLine(1)
            setTimeout(() => highlightErrorLine(1), 100)
          }
        } else {
          // Highlight first line if no specific line found
          setErrorLine(1)
          setTimeout(() => highlightErrorLine(1), 100)
        }
      }

      toast.error(errorMessage)
    } finally {
      setExecuting(false)
    }
  }

  const handleReset = () => {
    setSqlQuery(sqlTemplate)
    setError(null)
    setSqlError(null)
    setResults([])
    setRowCount(0)
    setCompleted(false)
    setErrorLine(null)
    // Clear Monaco decorations
    if (editorRef.current) {
      editorRef.current.deltaDecorations(
        editorRef.current.deltaDecorations([], []),
        []
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-neon-cyan" />
        </motion.div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">Failed to load SQL question</p>
        <button onClick={fetchQuestion} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold neon-text mb-2">{question.title}</h1>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1 rounded-full font-bold ${
              difficulty === 'Basic' ? 'bg-neon-green/20 text-neon-green' :
              difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {difficulty}
            </span>
            <span className="text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-neon-cyan" />
          Problem Description
        </h2>
        <p className="text-foreground/80 mb-4">{question.description}</p>

        {/* Hints */}
        {question.hints && question.hints.length > 0 && (
          <div className="mt-4 p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-purple mb-2">Hints:</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/80">
              {question.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SQL Editor */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-neon-cyan" />
            SQL Query Editor
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
              disabled={executing}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleRun}
              className="btn-primary flex items-center gap-2"
              disabled={executing || !sqlQuery.trim()}
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Query
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="border border-neon-cyan/30 rounded-lg overflow-hidden">
          <MonacoEditor
            height="400px"
            language="sql"
            value={sqlQuery}
            onChange={(value) => {
              setSqlQuery(value || '')
              // Clear error state when user edits
              if (error || sqlError) {
                setError(null)
                setSqlError(null)
                setErrorLine(null)
                if (editorRef.current) {
                  editorRef.current.deltaDecorations(
                    editorRef.current.deltaDecorations([], []),
                    []
                  )
                }
              }
            }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
            }}
          />
        </div>

        {/* Error Display */}
        {sqlError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">SQL Error</h3>
                <p className="text-red-300 text-sm">{sqlError}</p>
                {errorLine && (
                  <p className="text-red-300 text-xs mt-2">Error at line {errorLine}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-neon-green" />
                Query Results
              </h2>
              <span className="text-muted-foreground">{results.length} row{results.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    {Object.keys(results[0] || {}).map((key) => (
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
                  {results.map((row, idx) => (
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
      </AnimatePresence>

      {/* Completion Message */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 bg-neon-green/10 border border-neon-green/50"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-neon-green" />
            <div>
              <h3 className="text-xl font-bold text-neon-green">Query Executed Successfully!</h3>
              <p className="text-foreground/80">Great job! Your SQL query returned the correct results.</p>
            </div>
          </div>
          <button
            onClick={onComplete}
            className="btn-primary mt-4 w-full"
          >
            Continue to Next Challenge
          </button>
        </motion.div>
      )}
    </div>
  )
}
