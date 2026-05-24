'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Flame, Clock, Users, Zap, Trophy, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { Marathon } from '@/lib/types/contests'
import CountdownTimer from '@/components/CountdownTimer'

export default function MarathonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const marathonId = params.id as string
  const [marathon, setMarathon] = useState<Marathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

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
    loadMarathon()
    checkIfJoined()
    // Polling disabled - replication is off
  }, [marathonId, userId])

  const checkIfJoined = async () => {
    if (!userId || !marathonId) return
    try {
      const response = await axios.get(`/api/marathons/${marathonId}/leaderboard`)
      const leaderboard = response.data.leaderboard || []
      const userEntry = leaderboard.find((entry: any) => entry.userId === userId)
      if (userEntry) {
        setJoined(true)
      }
    } catch (error) {
      // Ignore errors
    }
  }

  const loadMarathon = async () => {
    try {
      const response = await axios.get(`/api/marathons/${marathonId}`)
      setMarathon(response.data.marathon)
      if (response.data.marathon) {
        const remaining = new Date(response.data.marathon.endDate).getTime() - Date.now()
        setTimeRemaining(Math.max(0, remaining))
      }
      setLoading(false)
    } catch (error: any) {
      console.error('Error loading marathon:', error)
      toast.error('Failed to load marathon')
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!userId) {
      toast.error('Please wait, initializing user...')
      return
    }
    try {
      const response = await axios.post(`/api/marathons/${marathonId}/join`, { userId })
      if (response.data.success) {
        toast.success('Joined marathon!')
        setJoined(true)
        // Redirect to solve page
        router.push(`/marathons/${marathonId}/solve`)
      }
    } catch (error: any) {
      // If already joined, that's fine
      if (error.response?.status === 200 || error.response?.data?.success) {
        toast.success('Already joined marathon!')
        setJoined(true)
        loadMarathon()
      } else {
        console.error('Error joining marathon:', error)
        toast.error('Failed to join marathon')
      }
    }
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marathon...</p>
        </div>
      </div>
    )
  }

  if (!marathon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Marathon not found</p>
        </div>
      </div>
    )
  }

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
              <h1 className="text-4xl font-bold neon-text mb-2 flex items-center gap-3">
                <Flame className="w-10 h-10 text-neon-orange" />
                {marathon.title}
              </h1>
              <p className="text-muted-foreground">{marathon.description}</p>
            </div>
            {marathon.status === 'active' && !joined && (
              <button onClick={handleJoin} className="btn-primary px-6 py-3">
                Join Marathon
              </button>
            )}
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-neon-orange" />
              <span>{marathon.xpMultiplier}x XP Multiplier</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-cyan" />
              <span>{marathon.participants} participants</span>
            </div>
            {marathon.status === 'active' && (
              <CountdownTimer 
                endDate={marathon.endDate}
                onComplete={() => router.push(`/marathons/${marathonId}/complete`)}
              />
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-neon-yellow" />
            Leaderboard
          </h2>
          {marathon.leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
              <p className="text-muted-foreground">No participants yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {marathon.leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.userId === userId ? 'bg-neon-cyan/20 border-2 border-neon-cyan' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-12 text-center">{entry.badge}</div>
                    <div>
                      <div className={`font-bold ${entry.userId === userId ? 'text-neon-cyan' : ''}`}>
                        {entry.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.problemsSolved} problems solved
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-neon-yellow">{entry.xp} XP</div>
                    <div className="text-xs text-muted-foreground">Rank #{entry.rank}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">About This Marathon</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground/80 mb-4">
              This is an extended coding challenge where you can solve multiple problems and earn massive XP multipliers!
              The marathon runs for {marathon.duration} hours, giving you plenty of time to showcase your skills.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-neon-yellow" />
                  XP Multiplier
                </h3>
                <p className="text-muted-foreground">All XP earned during this marathon is multiplied by {marathon.xpMultiplier}x</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-neon-yellow" />
                  Rewards
                </h3>
                <p className="text-muted-foreground">Top performers will receive special badges and recognition!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

