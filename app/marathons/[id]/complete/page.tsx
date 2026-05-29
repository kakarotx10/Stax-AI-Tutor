'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Flame, Trophy, Award, Sparkles, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

export default function MarathonCompletePage() {
  const params = useParams()
  const router = useRouter()
  const marathonId = params.id as string
  const [marathon, setMarathon] = useState<any>(null)
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
      const marathonResponse = await axios.get(`/api/marathons/${marathonId}`)
      setMarathon(marathonResponse.data.marathon)

      // Get user's rank and stats
      const leaderboardResponse = await axios.get(`/api/marathons/${marathonId}/leaderboard`)
      const leaderboard = leaderboardResponse.data.leaderboard || []
      
      const userEntry = leaderboard.find((entry: any) => entry.userId === userId)
      if (userEntry) {
        setUserRank(userEntry.rank)
        setXpEarned(userEntry.xp)
        setProblemsSolved(userEntry.problemsSolved)
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
          <div className="w-16 h-16 border-4 border-warning border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-6"
          >
            <Flame className="w-32 h-32 text-warning drop-shadow-card" />
          </motion.div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Marathon Completed!</h1>
          <p className="text-2xl text-muted-foreground">{marathon?.title}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-warning mb-2">#{userRank}</div>
            <div className="text-muted-foreground">Your Rank</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-success mb-2">{xpEarned}</div>
            <div className="text-muted-foreground">XP Earned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-5xl font-bold text-primary mb-2">{problemsSolved}</div>
            <div className="text-muted-foreground">Problems Solved</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 text-center mb-8"
        >
          <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Amazing Performance!</h2>
          <p className="text-muted-foreground text-lg mb-6">
            You've completed the marathon! Your dedication and persistence have been rewarded with massive XP!
          </p>
          {userRank <= 3 && (
            <div className="flex items-center justify-center gap-2 text-warning text-xl font-bold">
              <Award className="w-6 h-6" />
              <span>Top {userRank} Finish!</span>
            </div>
          )}
        </motion.div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`/marathons/${marathonId}`)}
            className="btn-secondary px-6 py-3 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marathon
          </button>
          <button
            onClick={() => router.push('/marathons')}
            className="btn-primary px-6 py-3"
          >
            View All Marathons
          </button>
        </div>
      </div>
    </div>
  )
}




