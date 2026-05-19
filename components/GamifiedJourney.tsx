'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SUBJECTS, type Subject } from '@/lib/subjects'
import { Lock, CheckCircle2, Sparkles, BookOpen, FileQuestion, Code2, Trophy, Target } from 'lucide-react'

interface GamifiedJourneyProps {
  subjectId: Subject
  unitId: string
}

type JourneyPhase = 'theory' | 'mcq' | 'basic' | 'medium' | 'hard' | 'assignment'

export default function GamifiedJourney({ subjectId, unitId }: GamifiedJourneyProps) {
  const router = useRouter()
  const subject = SUBJECTS[subjectId]
  const unit = subject?.units.find(u => u.id === unitId)
  const containerRef = useRef<HTMLDivElement>(null)

  const [currentSubTopicIndex, setCurrentSubTopicIndex] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<JourneyPhase>('theory')
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set())

  if (!subject || !unit) {
    return <div>Unit not found</div>
  }

  const subtopics = unit.subtopics.sort((a, b) => a.order - b.order)
  const currentSubTopic = subtopics[currentSubTopicIndex]

  const phases: JourneyPhase[] = ['theory', 'mcq', 'basic', 'medium', 'hard', 'assignment']
  const phaseIcons = {
    theory: BookOpen,
    mcq: FileQuestion,
    basic: Code2,
    medium: Code2,
    hard: Code2,
    assignment: Target,
  }
  const phaseLabels = {
    theory: 'Theory',
    mcq: 'MCQ',
    basic: 'Basic',
    medium: 'Medium',
    hard: 'Hard',
    assignment: 'Assignment',
  }

  const handlePhaseClick = (phase: JourneyPhase, subtopicId: string) => {
    const phaseKey = `${subtopicId}-${phase}`
    const phaseIndex = phases.indexOf(phase)
    const isFirstUnit = unitId === subject.units[0]?.id
    const isFirstSubtopic = subtopicId === unit.subtopics[0]?.id
    
    // For first unit's first subtopic, unlock all phases
    if (isFirstUnit && isFirstSubtopic) {
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`)
      return
    }
    
    if (completedPhases.has(phaseKey)) {
      // Navigate to that phase
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`)
    } else {
      // Check if previous phase is completed
      if (phaseIndex === 0 || completedPhases.has(`${subtopicId}-${phases[phaseIndex - 1]}`)) {
        router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`)
      }
    }
  }

  const handleSubTopicComplete = (subtopicId: string) => {
    // Mark all phases as completed for this subtopic
    phases.forEach(phase => {
      setCompletedPhases(prev => new Set(prev).add(`${subtopicId}-${phase}`))
    })
    
    // Move to next subtopic
    if (currentSubTopicIndex < subtopics.length - 1) {
      setCurrentSubTopicIndex(currentSubTopicIndex + 1)
      setCurrentPhase('theory')
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-dark-bg">
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-neon-cyan/10" />
          ))}
        </div>
      </div>

      {/* Journey Nodes */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-cyan-100">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Guided unit journey
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {unit.name}
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Complete each phase to progress
          </p>
        </motion.div>

        <div className="space-y-6 pb-28">
          {subtopics.map((subtopic, subIdx) => (
            <motion.section
              key={subtopic.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: subIdx * 0.08, duration: 0.45 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: subIdx * 0.08 + 0.08 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <div className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    Module {subIdx + 1}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {subtopic.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
                    {subtopic.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm">
                  <div className="text-slate-500">Available XP</div>
                  <div className="mt-1 text-xl font-semibold text-cyan-200">
                    {subtopic.xpReward}
                  </div>
                </div>
              </motion.div>

              {/* Phase Nodes */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute left-8 right-8 top-10 hidden h-px bg-gradient-to-r from-cyan-300/70 via-violet-300/45 to-fuchsia-300/70 lg:block"
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                  {phases.map((phase, phaseIdx) => {
                    const phaseKey = `${subtopic.id}-${phase}`
                    const isCompleted = completedPhases.has(phaseKey)
                    const isFirstUnit = unitId === subject.units[0]?.id
                    const isFirstSubtopic = subtopic.id === unit.subtopics[0]?.id
                    // Unlock all phases for first unit's first subtopic
                    const isLocked = !(isFirstUnit && isFirstSubtopic) && phaseIdx > 0 && !completedPhases.has(`${subtopic.id}-${phases[phaseIdx - 1]}`)
                    const Icon = phaseIcons[phase]

                    return (
                      <motion.div
                        key={phaseKey}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: subIdx * 0.1 + phaseIdx * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !isLocked && handlePhaseClick(phase, subtopic.id)}
                        className={`relative flex flex-col items-center text-center ${
                          isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {/* Node Circle */}
                        <div
                          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-400/15 border-emerald-300 text-emerald-200 shadow-[0_14px_36px_rgba(52,211,153,0.16)]'
                              : isLocked
                              ? 'bg-slate-900 border-slate-700 text-slate-600'
                              : 'bg-slate-950 border-cyan-300 text-cyan-200 hover:border-violet-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(34,211,238,0.16)]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-9 h-9" />
                          ) : isLocked ? (
                            <Lock className="w-8 h-8" />
                          ) : (
                            <Icon className="w-8 h-8" />
                          )}
                        </div>

                        {/* Phase Label */}
                        <div className="mt-3 min-h-5">
                          <span
                            className={`text-sm font-semibold ${
                              isCompleted
                                ? 'text-emerald-200'
                                : isLocked
                                ? 'text-slate-600'
                                : 'text-cyan-200'
                            }`}
                          >
                            {phaseLabels[phase]}
                          </span>
                        </div>

                        {/* XP Badge */}
                        {!isLocked && (
                          <div className="absolute left-1/2 top-0 z-20 translate-x-5 -translate-y-2 rounded-full bg-violet-400 px-2 py-1 text-xs font-bold text-white shadow-lg">
                            +{Math.round(subtopic.xpReward / phases.length)}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/10 bg-dark-card/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <Trophy className="w-6 h-6 text-cyan-200" />
            <div>
              <div className="text-sm text-slate-400">Progress</div>
              <div className="text-lg font-semibold text-cyan-200">
                {completedPhases.size} / {subtopics.length * phases.length} phases
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
