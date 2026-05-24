'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sword, Users, Clock, Trophy, Zap, Search, User, Target, Sparkles } from 'lucide-react'
import { Duel } from '@/lib/types/contests'
import { Domain, DOMAINS } from '@/lib/subjects'
import toast from 'react-hot-toast'
import axios from 'axios'

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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold neon-text mb-4 flex items-center gap-3">
            <Sword className="w-12 h-12 text-neon-cyan" />
            1v1 Duels
          </h1>
          <p className="text-xl text-muted-foreground">Challenge other coders in head-to-head battles!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('find')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'find'
                ? 'bg-neon-cyan text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            Find Opponent
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-neon-cyan text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            Active Duels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-neon-cyan text-foreground'
                : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            History
          </button>
        </div>

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
                  className="glass-card p-12 text-center relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -50, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>

                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      }}
                      className="inline-block mb-8"
                    >
                      <Sword className="w-32 h-32 text-neon-cyan drop-shadow-card" />
                    </motion.div>

                    <h2 className="text-4xl font-bold mb-4 neon-text">Ready for a Challenge?</h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
                      Test your skills against other coders! Solve the same problem faster than your opponent to win XP and climb the leaderboard.
                    </p>

                    {/* Domain Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold mb-3 text-neon-cyan">Select Domain</label>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {(Object.keys(DOMAINS) as Domain[]).map(domainId => {
                          const domain = DOMAINS[domainId]
                          return (
                            <button
                              key={domainId}
                              onClick={() => setSelectedDomain(domainId)}
                              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                                selectedDomain === domainId
                                  ? 'bg-neon-cyan text-primary-foreground'
                                  : 'bg-card text-muted-foreground hover:bg-card/80'
                              }`}
                            >
                              <span>{domain.icon}</span>
                              <span>{domain.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-6 justify-center">
                      <motion.button
                        onClick={handleFindRandom}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary text-lg px-10 py-5 flex items-center gap-3 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        <Zap className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Find Random Opponent</span>
                      </motion.button>
                      <motion.button
                        onClick={handleCreateDuel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary text-lg px-10 py-5 flex items-center gap-3"
                      >
                        <Users className="w-6 h-6" />
                        Challenge Friend
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {findingOpponent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-neon-cyan rounded-full"
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
                      <Search className="w-24 h-24 text-neon-cyan" />
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-4 neon-text">Searching for Opponent...</h2>
                    <p className="text-muted-foreground mb-8">Matching you with a skilled coder...</p>

                    {/* Progress bar */}
                    <div className="max-w-md mx-auto mb-8">
                      <div className="w-full bg-card rounded-full h-4 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
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
                          className="w-3 h-3 bg-neon-cyan rounded-full"
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
                  className="glass-card p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl"
                      animate={{
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>

                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="inline-block mb-8"
                    >
                      <Trophy className="w-32 h-32 text-neon-green drop-shadow-card" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold mb-4 neon-text"
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
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                          You
                        </div>
                        <p className="text-sm text-muted-foreground">vs</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green to-neon-yellow flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                          {foundOpponent.opponentId?.substring(0, 1).toUpperCase() || 'O'}
                        </div>
                        <p className="text-sm text-muted-foreground">Opponent</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-neon-cyan"
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
                <div className="glass-card p-8 text-center">
                  <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading active duels...</p>
                </div>
              ) : duels.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active duels</p>
                </div>
              ) : (
                duels.map((duel) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-6 cursor-pointer"
                    onClick={() => router.push(`/duels/${duel.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold">
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
                        <div className="text-neon-cyan font-bold text-xl">{duel.xpReward} XP</div>
                        <div className="text-sm text-muted-foreground">Reward</div>
                        <div className="mt-2 text-xs text-neon-green">Active</div>
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
                <div className="glass-card p-8 text-center">
                  <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading duel history...</p>
                </div>
              ) : duels.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Trophy className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No duel history yet</p>
                </div>
              ) : (
                duels.map((duel) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {duel.winnerId === userId ? (
                          <Trophy className="w-12 h-12 text-neon-yellow" />
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
                          <div className="text-neon-green font-bold">Victory!</div>
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
    </div>
  )
}
