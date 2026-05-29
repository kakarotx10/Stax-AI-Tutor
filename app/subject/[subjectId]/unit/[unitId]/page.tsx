'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SUBJECTS, type Subject } from '@/lib/subjects'
import ConceptLearning from '@/components/ConceptLearning'
import MCQGate from '@/components/MCQGate'
import LeaderboardUnlock from '@/components/LeaderboardUnlock'
import CodingChallenge from '@/components/CodingChallenge'
import { ArrowLeft } from 'lucide-react'

type Phase = 'learning' | 'mcq' | 'unlock' | 'coding'

export default function UnitPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as Subject
  const unitId = params.unitId as string
  
  const subject = SUBJECTS[subjectId]
  const unit = subject?.units.find(u => u.id === unitId)

  const [phase, setPhase] = useState<Phase>('learning')
  const [mcqPassed, setMcqPassed] = useState(false)
  const [xp, setXp] = useState(0)

  if (!subject || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-card p-8"
        >
          <h1 className="text-4xl font-bold text-red-400 mb-4">Unit not found</h1>
          <p className="text-muted-foreground mb-6">The unit you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/subject/${subjectId}`)}
            className="btn-primary"
          >
            Go Back to {subject?.name || 'Subject'}
          </button>
        </motion.div>
      </div>
    )
  }

  const handleLearningComplete = () => {
    setPhase('mcq')
  }

  const handleMCQPass = () => {
    setMcqPassed(true)
    setXp(prev => prev + 50) // MCQ completion XP
    setPhase('unlock')
  }

  const handleUnlockComplete = () => {
    setPhase('coding')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="btn-secondary mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm text-primary font-bold">{xp} XP</span>
          </div>
          <div className="h-3 bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(xp / unit.xpReward) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Phase Content */}
        <>
          {phase === 'learning' && (
            <div>
              <ConceptLearning
                subject={subject.name}
                unit={unit.name}
                onComplete={handleLearningComplete}
              />
            </div>
          )}

          {phase === 'mcq' && (
            <div>
              <MCQGate
                subject={subject.name}
                unit={unit.name}
                onPass={handleMCQPass}
              />
            </div>
          )}

          {phase === 'unlock' && (
            <div>
              <LeaderboardUnlock
                xp={xp}
                unit={unit.name}
                onComplete={handleUnlockComplete}
              />
            </div>
          )}

          {phase === 'coding' && (
            <div>
              <CodingChallenge
                subject={subject.name}
                unit={unit.name}
                onComplete={() => {
                  setXp(prev => prev + unit.xpReward - 50)
                  // Could navigate to next unit or show completion
                }}
              />
            </div>
          )}
        </>
      </div>
    </div>
  )
}

