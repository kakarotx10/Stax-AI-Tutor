'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Sparkles, Zap, Star } from 'lucide-react'

interface LeaderboardUnlockProps {
  xp: number
  unit: string
  onComplete: () => void
}

export default function LeaderboardUnlock({ xp, unit, onComplete }: LeaderboardUnlockProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger confetti
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    setTimeout(() => setShowContent(true), 1000)

    return () => clearInterval(interval)
  }, [])

  // Mock leaderboard data (in real app, fetch from API)
  const leaderboard = [
    { rank: 1, name: 'CodeMaster', xp: 5000, badge: '🏆' },
    { rank: 2, name: 'AlgoGenius', xp: 4500, badge: '🥇' },
    { rank: 3, name: 'DevNinja', xp: 4000, badge: '🥈' },
    { rank: 4, name: 'You', xp: xp, badge: '⭐', isCurrentUser: true },
    { rank: 5, name: 'CoderPro', xp: 3000, badge: '🥉' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-center space-y-8"
      >
        {/* Unlock Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Trophy className="w-32 h-32 text-primary mx-auto mb-4" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-foreground mb-4"
        >
          🎉 YOU UNLOCKED CODING MODE! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-foreground/80 mb-8"
        >
          Mastered: {unit}
        </motion.p>

        {/* Stats */}
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-2xl mx-auto space-y-6"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{xp}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-3xl font-bold text-accent">1</div>
                <div className="text-sm text-muted-foreground">Unit Completed</div>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-3xl font-bold text-accent">85%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.isCurrentUser
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-card/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.badge}</span>
                      <span className="font-bold">#{entry.rank}</span>
                      <span>{entry.name}</span>
                    </div>
                    <span className="text-primary font-bold">{entry.xp} XP</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              onClick={onComplete}
              className="btn-primary w-full text-xl py-4"
            >
              Start Coding Challenges →
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}


















