'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SUBJECTS, type Subject } from '@/lib/subjects'
import {
  Lock,
  CheckCircle2,
  BookOpen,
  FileQuestion,
  Code2,
  Target,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GamifiedJourneyProps {
  subjectId: Subject
  unitId: string
}

type JourneyPhase = 'theory' | 'mcq' | 'basic' | 'medium' | 'hard' | 'assignment'

const PHASES: JourneyPhase[] = ['theory', 'mcq', 'basic', 'medium', 'hard', 'assignment']

const PHASE_LABELS: Record<JourneyPhase, string> = {
  theory: 'Theory',
  mcq: 'MCQ',
  basic: 'Basic',
  medium: 'Medium',
  hard: 'Hard',
  assignment: 'Project',
}

const PHASE_ICONS: Record<JourneyPhase, typeof BookOpen> = {
  theory: BookOpen,
  mcq: FileQuestion,
  basic: Code2,
  medium: Code2,
  hard: Code2,
  assignment: Target,
}

export default function GamifiedJourney({ subjectId, unitId }: GamifiedJourneyProps) {
  const router = useRouter()
  const subject = SUBJECTS[subjectId]
  const unit = subject?.units.find((u) => u.id === unitId)
  const containerRef = useRef<HTMLDivElement>(null)

  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('completedPhases') || '{}') as Record<string, boolean>
    setCompletedPhases(new Set(Object.keys(stored).filter((key) => stored[key])))
  }, [])

  if (!subject || !unit) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Unit not found.</p>
      </div>
    )
  }

  const subtopics = [...unit.subtopics].sort((a, b) => a.order - b.order)
  const isFirstUnit = unitId === subject.units[0]?.id

  const handlePhaseClick = (phase: JourneyPhase, subtopicId: string) => {
    const phaseIdx = PHASES.indexOf(phase)
    const isFirstSubtopic = subtopicId === unit.subtopics[0]?.id

    if (isFirstUnit && isFirstSubtopic) {
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`)
      return
    }

    const prevDone = phaseIdx === 0 || completedPhases.has(`${subtopicId}-${PHASES[phaseIdx - 1]}`)
    if (prevDone || completedPhases.has(`${subtopicId}-${phase}`)) {
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`)
    }
  }

  const totalPhases = subtopics.length * PHASES.length

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 pb-32 pt-12 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <p className="mb-3 text-eyebrow uppercase text-muted-foreground">
            {subject.name} · Guided unit
          </p>
          <h1 className="text-h1 text-foreground">{unit.name}</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">
            {subtopics.length} modules · {unit.xpReward} XP total. Complete phases in order to unlock the next.
          </p>
        </header>

        {/* Modules */}
        <div className="space-y-3">
          {subtopics.map((subtopic, subIdx) => {
            const completedInModule = PHASES.filter((p) =>
              completedPhases.has(`${subtopic.id}-${p}`)
            ).length
            const modulePct = Math.round((completedInModule / PHASES.length) * 100)
            const moduleStarted = completedInModule > 0
            const moduleDone = completedInModule === PHASES.length

            return (
              <section
                key={subtopic.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                {/* Module header */}
                <div className="mb-6 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="mb-1.5 text-eyebrow uppercase text-muted-foreground">
                      Module · {String(subIdx + 1).padStart(2, '0')}
                    </p>
                    <h2 className="text-h4 font-semibold tracking-tight text-foreground">
                      {subtopic.name}
                    </h2>
                    {subtopic.description && (
                      <p className="mt-1.5 text-body-sm text-muted-foreground">
                        {subtopic.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-eyebrow uppercase text-muted-foreground">XP</p>
                    <p className="mt-0.5 text-h4 font-semibold tabular-nums text-foreground">
                      {subtopic.xpReward}
                    </p>
                  </div>
                </div>

                {/* Progress meter (visible only when started) */}
                {moduleStarted && (
                  <div className="mb-6">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                      <span>Progress</span>
                      <span className="tabular-nums text-foreground">{modulePct}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          moduleDone ? 'bg-success' : 'bg-primary'
                        )}
                        style={{ width: `${modulePct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Phase track */}
                <div className="relative">
                  {/* Connecting line behind nodes */}
                  <div
                    aria-hidden="true"
                    className="absolute left-5 right-5 top-5 h-px bg-border"
                  />

                  <ol className="relative grid grid-cols-3 gap-y-6 sm:grid-cols-6">
                    {PHASES.map((phase, phaseIdx) => {
                      const phaseKey = `${subtopic.id}-${phase}`
                      const isCompleted = completedPhases.has(phaseKey)
                      const isFirstSubtopic = subtopic.id === unit.subtopics[0]?.id
                      const isLocked =
                        !(isFirstUnit && isFirstSubtopic) &&
                        phaseIdx > 0 &&
                        !completedPhases.has(`${subtopic.id}-${PHASES[phaseIdx - 1]}`)

                      const isAvailable = !isCompleted && !isLocked
                      const Icon = PHASE_ICONS[phase]

                      return (
                        <li key={phaseKey} className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => !isLocked && handlePhaseClick(phase, subtopic.id)}
                            disabled={isLocked}
                            aria-label={`${PHASE_LABELS[phase]} — ${
                              isCompleted ? 'completed' : isLocked ? 'locked' : 'available'
                            }`}
                            className={cn(
                              'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 ease-out-quart',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                              isCompleted &&
                                'border-success bg-success/15 text-success',
                              isAvailable &&
                                'border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/15',
                              isLocked &&
                                'cursor-not-allowed border-border bg-card text-muted-foreground/60'
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isLocked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </button>

                          <p
                            className={cn(
                              'mt-2 text-center text-[11px] font-medium uppercase tracking-[0.04em]',
                              isCompleted && 'text-success',
                              isAvailable && 'text-foreground',
                              isLocked && 'text-muted-foreground/60'
                            )}
                          >
                            {PHASE_LABELS[phase]}
                          </p>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Floating progress chip */}
      <div className="fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-md border border-border bg-card/95 px-4 py-2.5 shadow-card backdrop-blur sm:flex">
        <Trophy className="h-4 w-4 text-primary" />
        <div className="text-body-sm">
          <span className="font-medium tabular-nums text-foreground">
            {completedPhases.size}
          </span>
          <span className="text-muted-foreground"> / {totalPhases} phases</span>
        </div>
      </div>
    </div>
  )
}
