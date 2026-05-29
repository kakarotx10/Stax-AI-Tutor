'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Trophy, Sparkles, CheckCircle2, X } from 'lucide-react'

interface BadgeUnlockProps {
  subtopicName: string
  onClose: () => void
}

export default function BadgeUnlock({ subtopicName, onClose }: BadgeUnlockProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const duration = 5000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
    const confettiColors = [
      'hsl(239, 84%, 67%)',
      'hsl(227, 59%, 57%)',
      'hsl(160, 84%, 39%)',
      'hsl(38, 92%, 50%)',
    ]

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: confettiColors,
      })
      
      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: confettiColors,
      })
    }, 250)

    setTimeout(() => setShowContent(true), 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
          className="relative glass-card p-12 max-w-2xl mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Badge Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <Trophy className="w-32 h-32 text-primary" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Sparkles className="w-40 h-40 text-accent opacity-50" />
              </motion.div>
            </div>
          </motion.div>

          {showContent && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-h1"
              >
                Badge Unlocked
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl text-foreground/80 mb-8"
              >
                Master of {subtopicName}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-primary/20 via-accent/20 to-accent/20 p-6 rounded-lg border border-primary/50 mb-8"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  Achievements Unlocked
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>Completed Theory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>Passed MCQ Gate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>Solved Basic Coding Challenge</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">+100</div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
                <div className="w-px h-12 bg-primary/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">1</div>
                  <div className="text-sm text-muted-foreground">Badge</div>
                </div>
                <div className="w-px h-12 bg-primary/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">3</div>
                  <div className="text-sm text-muted-foreground">Phases</div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="btn-primary w-full"
              >
                Continue Journey
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

















