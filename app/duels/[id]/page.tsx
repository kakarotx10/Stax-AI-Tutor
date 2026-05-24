'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Sword, Clock, Trophy, User, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Duel } from '@/lib/types/contests'
import MonacoEditor from '@/components/MonacoEditor'

export default function DuelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const duelId = params.id as string
  const [duel, setDuel] = useState<Duel | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [submitting, setSubmitting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

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
    if (userId) {
      loadDuel()
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
        loadDuel() // Refresh duel status
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [duelId, userId])

  const loadDuel = async () => {
    try {
      const response = await axios.get(`/api/duels/${duelId}`)
      setDuel(response.data.duel)
      setLoading(false)
    } catch (error: any) {
      console.error('Error loading duel:', error)
      toast.error('Failed to load duel')
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    setSubmitting(true)
    try {
      // Execute code and get score (simplified - in real app, use Judge0)
      const score = Math.floor(Math.random() * 100) // Placeholder

      await axios.post(`/api/duels/${duelId}/submit`, {
        userId,
        solution: code,
        score
      })

      toast.success('Solution submitted!')
      loadDuel()
    } catch (error: any) {
      console.error('Error submitting:', error)
      toast.error('Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading duel...</p>
        </div>
      </div>
    )
  }

  if (!duel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Duel not found</p>
        </div>
      </div>
    )
  }

  const isChallenger = duel.challengerId === userId
  const opponentName = isChallenger ? duel.opponentName : duel.challengerName
  const mySolution = isChallenger ? duel.challengerSolution : duel.opponentSolution
  const opponentSolution = isChallenger ? duel.opponentSolution : duel.challengerSolution
  const isCompleted = duel.status === 'completed'

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
            <h1 className="text-4xl font-bold neon-text flex items-center gap-3">
              <Sword className="w-10 h-10 text-neon-cyan" />
              Duel Battle
            </h1>
            <div className="flex items-center gap-4">
              <div className="glass-card px-4 py-2">
                <Clock className="w-5 h-5 inline mr-2 text-neon-purple" />
                <span className="font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="glass-card px-4 py-2">
                <Trophy className="w-5 h-5 inline mr-2 text-neon-yellow" />
                <span className="font-bold">{duel.xpReward} XP</span>
              </div>
            </div>
          </div>

          {/* VS Display */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-3xl font-bold mb-2 mx-auto">
                  {isChallenger ? 'You' : opponentName.charAt(0)}
                </div>
                <p className="font-bold text-lg">{isChallenger ? 'You' : opponentName}</p>
                {mySolution && (
                  <div className="mt-2 flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <span className="text-sm text-neon-green">Submitted</span>
                  </div>
                )}
              </div>
              <div className="text-4xl font-bold text-neon-cyan">VS</div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green to-neon-yellow flex items-center justify-center text-3xl font-bold mb-2 mx-auto">
                  {!isChallenger ? 'You' : opponentName.charAt(0)}
                </div>
                <p className="font-bold text-lg">{opponentName}</p>
                {opponentSolution && (
                  <div className="mt-2 flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <span className="text-sm text-neon-green">Submitted</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{duel.problem.title}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/80 mb-4">
                {(duel.problem as any).description || 'Solve this problem faster than your opponent!'}
              </p>
              {(duel.problem as any).examples && (duel.problem as any).examples.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Examples:</h3>
                  {(duel.problem as any).examples.map((ex: any, idx: number) => (
                    <div key={idx} className="mb-4 p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Input: <code className="text-neon-cyan">{ex.input}</code></p>
                      <p className="text-sm text-muted-foreground mb-1">Output: <code className="text-neon-green">{ex.output}</code></p>
                      {ex.explanation && <p className="text-sm text-muted-foreground/80 mt-2">{ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          {!isCompleted && !mySolution && (
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Your Solution</h3>
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
                  scrollBeyondLastLine: false,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary mt-4 w-full py-4 text-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          )}

          {/* Results */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6"
            >
              <h3 className="text-2xl font-bold mb-4 text-center">
                {duel.winnerId === userId ? (
                  <span className="text-neon-green">🎉 Victory! 🎉</span>
                ) : (
                  <span className="text-muted-foreground">Defeat</span>
                )}
              </h3>
              <p className="text-center text-muted-foreground">
                {duel.winnerId === userId
                  ? 'Congratulations! You won this duel!'
                  : 'Better luck next time!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
