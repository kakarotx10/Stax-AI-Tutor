'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Users, Clock, Zap, Award, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { Contest } from '@/lib/types/contests'
import CountdownTimer from '@/components/CountdownTimer'
import confetti from 'canvas-confetti'
import MonacoEditor from '@/components/MonacoEditor'

export default function ContestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string
  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [problemDetails, setProblemDetails] = useState<any>(null)
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initUser = async () => {
      if (typeof window === 'undefined') return
      const { ensureUserExists } = await import('@/lib/database/userManagement')
      const dbUserId = await ensureUserExists()
      setUserId(dbUserId)
    }
    initUser()
  }, [])

  useEffect(() => {
    loadContest()
    checkIfJoined()
    // Polling disabled - replication is off
  }, [contestId, userId])

  const checkIfJoined = async () => {
    if (!userId || !contestId) return
    try {
      const response = await axios.get(`/api/contests/${contestId}/leaderboard`)
      const leaderboard = response.data.leaderboard || []
      const userEntry = leaderboard.find((entry: any) => entry.userId === userId)
      if (userEntry) {
        setJoined(true)
      }
    } catch (error) {
      // Ignore errors
    }
  }

  useEffect(() => {
    if (selectedProblem) {
      loadProblemDetails()
    }
  }, [selectedProblem])

  const loadContest = async () => {
    try {
      const response = await axios.get(`/api/contests/${contestId}`)
      setContest(response.data.contest)
      setLoading(false)
    } catch (error: any) {
      console.error('Error loading contest:', error)
      toast.error('Failed to load contest')
      setLoading(false)
    }
  }

  const loadProblemDetails = async () => {
    if (!selectedProblem) {
      console.log('loadProblemDetails: No problem selected')
      return
    }
    console.log('loadProblemDetails: Loading for problem ID:', selectedProblem)
    try {
      // Try to get full problem details from API
      try {
        const { data } = await axios.get(`/api/contests/${contestId}/problems/${selectedProblem}`)
        if (data.problem) {
          console.log('✅ Problem loaded from API:', data.problem.title)
          setProblemDetails(data.problem)
          return
        }
      } catch (apiError: any) {
        console.log('API failed, trying fallback:', apiError.message)
      }
      
      // Fallback to contest data
      const response = await axios.get(`/api/contests/${contestId}`)
      const problem = response.data.contest?.problems?.find((p: any) => p.id === selectedProblem)
      if (problem) {
        console.log('✅ Problem loaded from contest:', problem.title)
        setProblemDetails(problem)
      } else {
        console.error('❌ Problem not found:', selectedProblem)
        toast.error('Problem not found')
      }
    } catch (error) {
      console.error('Error loading problem details:', error)
      toast.error('Failed to load problem details')
    }
  }

  const handleJoin = async () => {
    if (!userId) {
      toast.error('Please wait, initializing user...')
      return
    }
    try {
      const response = await axios.post(`/api/contests/${contestId}/join`, { userId })
      if (response.data.success) {
        toast.success('Joined contest!')
        setJoined(true)
        // Redirect to solve page
        router.push(`/contests/${contestId}/solve`)
        return
        
        const updatedContest = await axios.get(`/api/contests/${contestId}`)
        const contestData = updatedContest.data.contest
        
        if (contestData) {
          let problemToSelect = null
          
          // First try to find hard problem
          const hardProblem = contestData.problems?.find((p: any) => p.difficulty === 'Advanced')
          if (hardProblem) {
            problemToSelect = hardProblem.id
          } else if (contestData.problems?.length > 0) {
            // Select first problem if no hard problem
            problemToSelect = contestData.problems[0].id
          } else {
            // Generate a hard problem if none exist
            try {
              toast.loading('Generating problem...', { id: 'gen-problem' })
              const genResponse = await axios.post(`/api/contests/${contestId}/problems`, {
                generate: true,
                difficulty: 'Advanced',
                subject: 'Computer Science',
                unit: 'Algorithms'
              })
              toast.dismiss('gen-problem')
              
              if (genResponse.data.problemId) {
                // Reload contest to get the new problem
                await loadContest()
                await new Promise(resolve => setTimeout(resolve, 200))
                
                // Get updated contest with new problem
                const finalContest = await axios.get(`/api/contests/${contestId}`)
                const newProblem = finalContest.data.contest?.problems?.find(
                  (p: any) => p.id === genResponse.data.problemId
                )
                if (newProblem) {
                  problemToSelect = genResponse.data.problemId
                }
              }
            } catch (error) {
              toast.dismiss('gen-problem')
              console.error('Error generating problem:', error)
              toast.error('Failed to generate problem')
            }
          }
          
          // Select the problem
          if (problemToSelect) {
            console.log('Selecting problem:', problemToSelect)
            setSelectedProblem(problemToSelect)
            // Force load problem details
            setTimeout(async () => {
              await loadProblemDetails()
            }, 300)
          } else {
            toast.error('No problem available. Please try again.')
          }
        }
      }
    } catch (error: any) {
      // If already joined, that's fine - auto-select problem
      if (error.response?.status === 200 || error.response?.data?.success) {
        toast.success('Already joined contest!')
        setJoined(true)
        await loadContest()
        
        // Auto-select problem for already joined users
        const updatedContest = await axios.get(`/api/contests/${contestId}`)
        const contestData = updatedContest.data.contest
        if (contestData && !selectedProblem) {
          const hardProblem = contestData.problems?.find((p: any) => p.difficulty === 'Advanced')
          if (hardProblem) {
            setSelectedProblem(hardProblem.id)
          } else if (contestData.problems?.length > 0) {
            setSelectedProblem(contestData.problems[0].id)
          }
        }
      } else {
        console.error('Error joining contest:', error)
        toast.error('Failed to join contest')
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedProblem || !code.trim()) {
      toast.error('Please select a problem and write code!')
      return
    }

    if (!problemDetails) {
      toast.error('Problem details not loaded')
      return
    }

    setSubmitting(true)
    try {
      // Get all test cases - check both testCases and examples
      let testCases: any[] = []
      if (problemDetails.testCases && Array.isArray(problemDetails.testCases)) {
        testCases = problemDetails.testCases
      } else if (problemDetails.testCases?.testCases && Array.isArray(problemDetails.testCases.testCases)) {
        testCases = problemDetails.testCases.testCases
      } else if (problemDetails.examples && Array.isArray(problemDetails.examples)) {
        testCases = problemDetails.examples
      }
      
      if (testCases.length === 0) {
        toast.error('No test cases available')
        setSubmitting(false)
        return
      }

      toast.loading(`Validating ${testCases.length} test cases...`, { id: 'test-validation' })

      // Execute code against ALL test cases
      const testResults = await Promise.all(
        testCases.map(async (testCase: any) => {
          try {
            const response = await axios.post('/api/judge0/execute', {
              code,
              language,
              stdin: testCase.input || testCase.stdin || '',
              expectedOutput: testCase.output || testCase.expectedOutput || ''
            })

            const result = response.data.result
            const passed = result.passed || (result.status === 'Accepted' && result.stdout?.trim() === (testCase.output || testCase.expectedOutput || '').trim())
            
            return {
              passed,
              input: testCase.input || testCase.stdin || '',
              expected: testCase.output || testCase.expectedOutput || '',
              got: result.stdout || result.stderr || '',
              status: result.status
            }
          } catch (error: any) {
            return {
              passed: false,
              input: testCase.input || testCase.stdin || '',
              expected: testCase.output || testCase.expectedOutput || '',
              got: error.response?.data?.error || 'Execution error',
              status: 'Error'
            }
          }
        })
      )
      
      toast.dismiss('test-validation')

      const allPassed = testResults.every(r => r.passed)
      const score = allPassed ? (problemDetails.points || 100) : 0

      // Submit solution
      await axios.post(`/api/contests/${contestId}/submit`, {
        problemId: selectedProblem,
        userId,
        code,
        language,
        status: allPassed ? 'accepted' : 'wrong_answer',
        score
      })

      if (allPassed) {
        setSolvedProblems(prev => {
          const updated = new Set(prev)
          updated.add(selectedProblem)
          return updated
        })
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        })
        toast.success('All tests passed! 🎉 Redirecting to completion page...')
        
        // Wait a moment then redirect to completion page
        setTimeout(() => {
          router.push(`/contests/${contestId}/complete`)
        }, 2000)
      } else {
        const passedCount = testResults.filter(r => r.passed).length
        toast.error(`${passedCount}/${testResults.length} tests passed. Try again!`)
        
        // Show which tests failed
        const failedTests = testResults.filter(r => !r.passed)
        console.log('Failed tests:', failedTests)
      }

      loadContest()
      setCode('')
    } catch (error: any) {
      console.error('Error submitting:', error)
      toast.error('Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = () => {
    router.push(`/contests/${contestId}/complete`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contest...</p>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Contest not found</p>
        </div>
      </div>
    )
  }

  const problem = contest?.problems?.find(p => p.id === selectedProblem) || null

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold neon-text mb-2">{contest.title}</h1>
              <p className="text-muted-foreground">{contest.description}</p>
            </div>
            {contest.status === 'active' && !joined && (
              <button onClick={handleJoin} className="btn-primary px-6 py-3">
                Join Contest
              </button>
            )}
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-cyan" />
              <span>{contest.participants} participants</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-yellow" />
              <span>{contest.xpMultiplier}x XP</span>
            </div>
            {contest.status === 'active' && (
              <CountdownTimer 
                endDate={contest.endDate} 
                onComplete={handleComplete}
              />
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4">Problems</h2>
              {contest.problems.length === 0 ? (
                <p className="text-muted-foreground">No problems yet</p>
              ) : (
                <div className="space-y-2">
                  {contest.problems.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProblem(p.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedProblem === p.id
                          ? 'bg-neon-cyan/20 border-2 border-neon-cyan'
                          : 'bg-card hover:bg-card/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{p.title}</h3>
                          <p className="text-sm text-muted-foreground">{p.difficulty} • {p.points} pts</p>
                        </div>
                        {p.solvedBy > 0 && (
                          <CheckCircle className="w-5 h-5 text-neon-green" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-neon-yellow" />
                Leaderboard
              </h2>
              {contest.leaderboard.length === 0 ? (
                <p className="text-muted-foreground">No entries yet</p>
              ) : (
                <div className="space-y-2">
                  {contest.leaderboard.slice(0, 10).map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{entry.badge}</span>
                        <span className={entry.userId === userId ? 'text-neon-cyan font-bold' : ''}>
                          {entry.username}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.xp} XP</div>
                        <div className="text-xs text-muted-foreground">{entry.problemsSolved} solved</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Problem & Editor */}
          <div className="lg:col-span-2">
            {selectedProblem ? (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{problemDetails?.title || problem?.title || 'Loading problem...'}</h2>
                  {solvedProblems.has(selectedProblem) && (
                    <div className="flex items-center gap-2 text-neon-green">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold">Solved!</span>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert max-w-none mb-6">
                  <div className="text-foreground/80 mb-6 whitespace-pre-wrap leading-relaxed">
                    {problemDetails?.description || 'Solve this problem!'}
                  </div>
                  
                  {problemDetails?.examples && problemDetails.examples.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-neon-yellow" />
                        Examples:
                      </h3>
                      {problemDetails.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="mb-4 p-4 bg-card rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-bold text-neon-cyan">Input:</span>{' '}
                            <code className="text-foreground bg-background px-2 py-1 rounded">{ex.input}</code>
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-bold text-neon-green">Output:</span>{' '}
                            <code className="text-foreground bg-background px-2 py-1 rounded">{ex.output}</code>
                          </p>
                          {ex.explanation && (
                            <p className="text-sm text-muted-foreground/80 mt-2 italic">{ex.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {problemDetails?.constraints && problemDetails.constraints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3">Constraints:</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {problemDetails.constraints.map((c: string, idx: number) => (
                          <li key={idx} className="text-foreground/80">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-card border border-border rounded-lg px-4 py-2 text-foreground"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
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
                  }}
                />

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !joined}
                    className="btn-primary flex-1 py-4 text-lg"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Validating Test Cases...
                      </span>
                    ) : (
                      'Submit Solution'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Award className="w-24 h-24 text-muted-foreground/60 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a problem to start coding!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
