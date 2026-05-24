'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Award, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

export default function ContestCompletePage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string
  const [contest, setContest] = useState<any>(null)
  const [userRank, setUserRank] = useState<number>(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [problemsSolved, setProblemsSolved] = useState(0)
  const [loading, setLoading] = useState(true)

  const getUserId = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('dbUserId') || localStorage.getItem('userId')
  }

  useEffect(() => {
    loadResults()
    // Fire confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 }
    })
  }, [])

  const loadResults = async () => {
    try {
      const userId = getUserId()
      if (!userId) {
        // Try to get from localStorage
        const localUserId = localStorage.getItem('dbUserId') || localStorage.getItem('userId')
        if (localUserId) {
          const { getOrCreateUser } = await import('@/lib/database/userManagement')
          const dbUserId = await getOrCreateUser(localUserId)
          const contestResponse = await axios.get(`/api/contests/${contestId}`)
          setContest(contestResponse.data.contest)

          const leaderboardResponse = await axios.get(`/api/contests/${contestId}/leaderboard`)
          const leaderboard = leaderboardResponse.data.leaderboard || []
          
          const userEntry = leaderboard.find((entry: any) => entry.userId === dbUserId)
          if (userEntry) {
            setUserRank(userEntry.rank)
            setXpEarned(userEntry.xp)
            setProblemsSolved(userEntry.problemsSolved)
          } else {
            // User might be first, check if they have submissions
            setUserRank(1)
            setXpEarned(0)
            setProblemsSolved(0)
          }
        }
      } else {
        const contestResponse = await axios.get(`/api/contests/${contestId}`)
        setContest(contestResponse.data.contest)

        const leaderboardResponse = await axios.get(`/api/contests/${contestId}/leaderboard`)
        const leaderboard = leaderboardResponse.data.leaderboard || []
        
        const userEntry = leaderboard.find((entry: any) => entry.userId === userId)
        if (userEntry) {
          setUserRank(userEntry.rank)
          setXpEarned(userEntry.xp)
          setProblemsSolved(userEntry.problemsSolved)
        } else {
          setUserRank(1)
          setXpEarned(0)
          setProblemsSolved(0)
        }
      }
    } catch (error: any) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Trophy className="w-32 h-32 text-neon-yellow drop-shadow-card" />
          </motion.div>
          <h1 className="text-5xl font-bold neon-text mb-4">Contest Completed!</h1>
          <p className="text-2xl text-muted-foreground">{contest?.title}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-neon-yellow mb-2">#{userRank}</div>
            <div className="text-muted-foreground">Your Rank</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-neon-green mb-2">{xpEarned}</div>
            <div className="text-muted-foreground">XP Earned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-neon-cyan mb-2">{problemsSolved}</div>
            <div className="text-muted-foreground">Problems Solved</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 text-center mb-8"
        >
          <Sparkles className="w-16 h-16 text-neon-purple mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
          <p className="text-muted-foreground text-lg mb-6">
            You've completed the contest! Your performance has been recorded and XP has been added to your profile.
          </p>
          {userRank <= 3 && (
            <div className="flex items-center justify-center gap-2 text-neon-yellow text-xl font-bold">
              <Award className="w-6 h-6" />
              <span>Top {userRank} Finish!</span>
            </div>
          )}
        </motion.div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`/contests/${contestId}`)}
            className="btn-secondary px-6 py-3 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Contest
          </button>
          <button
            onClick={() => router.push('/contests')}
            className="btn-primary px-6 py-3"
          >
            View All Contests
          </button>
        </div>
      </div>
    </div>
  )
}

