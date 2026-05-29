'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: Date | string
  onComplete?: () => void
  className?: string
}

export default function CountdownTimer({ endDate, onComplete, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endDate).getTime()
      const now = Date.now()
      const remaining = Math.max(0, end - now)

      setTimeRemaining(remaining)
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true)
        if (onComplete) {
          onComplete()
        }
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [endDate, isExpired, onComplete])

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  if (isExpired) {
    return (
      <div className={`glass-card px-6 py-4 flex items-center gap-3 ${className}`}>
        <Clock className="w-6 h-6 text-red-500" />
        <span className="text-red-500 font-bold">Time's Up!</span>
      </div>
    )
  }

  return (
    <motion.div
      className={`glass-card px-6 py-4 flex items-center gap-3 ${className}`}
      animate={{ scale: timeRemaining < 60000 ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 1, repeat: timeRemaining < 60000 ? Infinity : 0 }}
    >
      <Clock className={`w-6 h-6 ${timeRemaining < 300000 ? 'text-red-500' : 'text-accent'}`} />
      <div className="flex items-center gap-2">
        {days > 0 && (
          <>
            <span className="font-bold text-xl">{days.toString().padStart(2, '0')}</span>
            <span className="text-muted-foreground">d</span>
          </>
        )}
        <span className="font-bold text-xl">{hours.toString().padStart(2, '0')}</span>
        <span className="text-muted-foreground">h</span>
        <span className="font-bold text-xl">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-muted-foreground">m</span>
        <span className="font-bold text-xl">{seconds.toString().padStart(2, '0')}</span>
        <span className="text-muted-foreground">s</span>
      </div>
    </motion.div>
  )
}




