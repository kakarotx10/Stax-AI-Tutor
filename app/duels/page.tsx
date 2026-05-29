'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sword, Users, Clock, Trophy, Zap, Search, Target, Sparkles } from 'lucide-react'
import { Duel } from '@/lib/types/contests'
import { Domain } from '@/lib/subjects'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import {
  CompetitionHeader,
  DomainFilterBar,
  ModeTabs,
} from '@/components/competition/CompetitionUI'

const duelTabs = [
  { value: 'find' as const, label: 'Find Opponent', icon: Search },
  { value: 'active' as const, label: 'Active Duels', icon: Zap },
  { value: 'history' as const, label: 'History', icon: Clock },
]

export default function DuelsPage() {
  const router = useRouter()
  const [duels, setDuels] = useState<Duel[]>([])
  const [activeTab, setActiveTab] = useState<'find' | 'active' | 'history'>('find')
  const [findingOpponent, setFindingOpponent] = useState(false)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [foundOpponent, setFoundOpponent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain>('placement')

  // Get userId from localStorage
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
    if (userId && (activeTab === 'active' || activeTab === 'history')) {
      loadDuels()
    }
  }, [activeTab, userId])

  const loadDuels = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'history' ? 'history' : 'active'
      const response = await axios.get(`/api/duels/user/${userId}?type=${type}`)
      setDuels(response.data.duels || [])
    } catch (error: any) {
      console.error('Error loading duels:', error)
      toast.error('Failed to load duels')
    } finally {
      setLoading(false)
    }
  }

  const handleFindRandom = async () => {
    if (!userId) {
      toast.error('Please wait, initializing user...')
      return
    }
    
    setFindingOpponent(true)
    setMatchingProgress(0)
    setFoundOpponent(null)

    // Animate progress
    const progressInterval = setInterval(() => {
      setMatchingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const response = await axios.post('/api/duels/find-opponent', {
        userId,
        difficulty: 'Medium',
        subject: 'Computer Science',
        unit: 'Algorithms',
        domain: selectedDomain
      })

      clearInterval(progressInterval)
      setMatchingProgress(100)
      
      setTimeout(() => {
        setFoundOpponent(response.data)
        setFindingOpponent(false)
        toast.success('Opponent found!')
        
        // Navigate to duel after 2 seconds
        setTimeout(() => {
          router.push(`/duels/${response.data.duelId}`)
        }, 2000)
      }, 500)
    } catch (error: any) {
      clearInterval(progressInterval)
      setFindingOpponent(false)
      setMatchingProgress(0)
      toast.error(error.response?.data?.error || 'Failed to find opponent. Try again!')
    }
  }

  const handleCreateDuel = () => {
    toast('Challenge friend feature coming soon!')
  }

  return (
    <main className="page-shell pt-24">
      <div className="page-container space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CompetitionHeader
            icon={Sword}
            title="1v1 Duels"
            description="Queue for a focused head-to-head coding match."
          />
        </motion.div>

        <ModeTabs tabs={duelTabs} value={activeTab} onChange={setActiveTab} />

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'find' && (
            <motion.div
              key="find"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              {!findingOpponent && !foundOpponent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
                >
                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="text-left">
                      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary shadow-soft">
                        <Sword className="h-9 w-9" />
                      </span>
                      <h2 className="text-h2 text-foreground">Ready for a Challenge?</h2>
                      <p className="mt-3 max-w-xl text-body-lg text-muted-foreground">
                        Match with another coder, solve the same problem, and race on accuracy plus time.
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-surface-1/80 p-3">
                          <p className="text-caption uppercase text-muted-foreground">Mode</p>
                          <p className="mt-1 font-semibold text-foreground">1v1</p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface-1/80 p-3">
                          <p className="text-caption uppercase text-muted-foreground">Reward</p>
                          <p className="mt-1 font-semibold text-warning">XP</p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface-1/80 p-3">
                          <p className="text-caption uppercase text-muted-foreground">Match</p>
                          <p className="mt-1 font-semibold text-success">Live</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-1/80 p-4 shadow-soft sm:p-5">
                      <DomainFilterBar
                        selectedDomain={selectedDomain}
                        onSelect={(domain) => {
                          if (domain !== 'all') setSelectedDomain(domain)
                        }}
                        label="Select Domain"
                        includeAll={false}
                      />

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button onClick={handleFindRandom} className="h-12 flex-1 text-base">
                          <Zap className="h-5 w-5" />
                          Find Random Opponent
                        </Button>
                        <Button onClick={handleCreateDuel} variant="secondary" className="h-12 flex-1 text-base">
                          <Users className="h-5 w-5" />
                          Challenge Friend
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {findingOpponent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-card"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-primary"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="inline-block mb-8"
                    >
                      <Search className="h-20 w-20 text-primary" />
                    </motion.div>

                    <h2 className="mb-4 text-h3 text-foreground">Searching for Opponent...</h2>
                    <p className="text-muted-foreground mb-8">Matching you with a skilled coder...</p>

                    {/* Progress bar */}
                    <div className="max-w-md mx-auto mb-8">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${matchingProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{Math.round(matchingProgress)}%</p>
                    </div>

                    <div className="flex justify-center gap-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-3 w-3 rounded-full bg-primary"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {foundOpponent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-card"
                >
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="inline-block mb-8"
                    >
                      <Trophy className="h-20 w-20 text-success" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 text-h3 text-foreground"
                    >
                      Opponent Found!
                    </motion.h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                      Get ready to battle! The duel is starting...
                    </p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-8 mb-8"
                    >
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xl font-semibold text-foreground">
                          You
                        </div>
                        <p className="text-sm text-muted-foreground">vs</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-success/25 bg-success/10 text-xl font-semibold text-foreground">
                          {foundOpponent.opponentId?.substring(0, 1).toUpperCase() || 'O'}
                        </div>
                        <p className="text-sm text-muted-foreground">Opponent</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-primary"
                    >
                      <Sparkles className="w-8 h-8 mx-auto animate-pulse" />
                      <p className="mt-2">Redirecting to duel...</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <LoadingState label="Loading active duels..." variant="skeleton" />
              ) : duels.length === 0 ? (
                <EmptyState icon={Clock} title="No active duels" description="Queue for a duel to start a focused head-to-head match." />
              ) : (
                duels.map((duel) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/40"
                    onClick={() => router.push(`/duels/${duel.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-lg font-semibold text-primary">
                          VS
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {duel.challengerId === userId ? duel.opponentName : duel.challengerName}
                          </h3>
                          <p className="text-muted-foreground">{duel.problem.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-primary">{duel.xpReward} XP</div>
                        <div className="text-sm text-muted-foreground">Reward</div>
                        <div className="mt-2 text-xs font-semibold text-success">Active</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading ? (
                <LoadingState label="Loading duel history..." variant="skeleton" />
              ) : duels.length === 0 ? (
                <EmptyState icon={Trophy} title="No duel history yet" description="Completed duels will appear here with rewards and outcomes." />
              ) : (
                duels.map((duel) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-border bg-card p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {duel.winnerId === userId ? (
                          <Trophy className="h-12 w-12 text-warning" />
                        ) : (
                          <Target className="w-12 h-12 text-muted-foreground/60" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            vs {duel.challengerId === userId ? duel.opponentName : duel.challengerName}
                          </h3>
                          <p className="text-muted-foreground">{duel.problem.title}</p>
                          <p className="text-sm text-muted-foreground/80 mt-1">
                            {duel.endTime?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {duel.winnerId === userId ? (
                          <div className="font-semibold text-success">Victory!</div>
                        ) : (
                          <div className="text-muted-foreground/80">Defeat</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">{duel.xpReward} XP</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
