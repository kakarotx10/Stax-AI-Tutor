'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SUBJECTS, type Subject } from '@/content/subjects'
import ConceptLearning from '@/components/ConceptLearning'
import MCQGate from '@/components/MCQGate'
import CodingChallenge from '@/components/CodingChallenge'
import SQLChallenge from '@/components/SQLChallenge'
import BadgeUnlock from '@/components/BadgeUnlock'
import PersonalizedAssignment from '@/components/PersonalizedAssignment'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { saveUserProgress } from '@/lib/userAttempts'

type Phase = 'theory' | 'mcq' | 'basic' | 'medium' | 'hard' | 'assignment'

export default function SubtopicPhasePage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as Subject
  const unitId = params.unitId as string
  const subtopicId = params.subtopicId as string
  const phase = params.phase as Phase

  const subject = SUBJECTS[subjectId]
  const unit = subject?.units.find(u => u.id === unitId)
  const subtopic = unit?.subtopics.find(s => s.id === subtopicId)

  const [showBadge, setShowBadge] = useState(false)

  if (!subject || !unit || !subtopic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Not Found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const markPhaseComplete = (phaseName: string) => {
    const phaseKey = `${subtopicId}-${phaseName}`
    const completedPhases = JSON.parse(localStorage.getItem('completedPhases') || '{}')
    completedPhases[phaseKey] = true
    localStorage.setItem('completedPhases', JSON.stringify(completedPhases))
  }

  const handleTheoryComplete = async () => {
    // Mark theory as completed
    markPhaseComplete('theory')
    await saveUserProgress({
      subjectId,
      unitId,
      subtopicId,
      phase: 'theory',
    })
    // Theory completed, can proceed to MCQ
    router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/mcq`)
  }

  const handleMCQComplete = () => {
    // Mark MCQ as completed
    markPhaseComplete('mcq')
    // MCQ completed, can proceed to Basic
    router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/basic`)
  }

  const handleBasicComplete = () => {
    // Mark basic as completed
    markPhaseComplete('basic')
    // Basic completed - show badge!
    setShowBadge(true)
  }

  const handleBadgeClose = () => {
    setShowBadge(false)
    // Navigate to medium or back to journey
    router.push(`/subject/${subjectId}/unit/${unitId}/journey`)
  }

  const handleCodingComplete = () => {
    // Mark current phase as completed
    markPhaseComplete(phase)
    
    // Medium or Hard completed
    if (phase === 'medium') {
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/hard`)
    } else if (phase === 'hard') {
      // After hard, go to personalized assignment
      router.push(`/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/assignment`)
    }
  }

  const handleAssignmentComplete = () => {
    // Mark this phase as completed in localStorage
    const phaseKey = `${subtopicId}-${phase}`
    const completedPhases = JSON.parse(localStorage.getItem('completedPhases') || '{}')
    completedPhases[phaseKey] = true
    localStorage.setItem('completedPhases', JSON.stringify(completedPhases))
    
    // Check if all phases for this subtopic are completed
    const allPhases = ['theory', 'mcq', 'basic', 'medium', 'hard', 'assignment']
    const allCompleted = allPhases.every(p => completedPhases[`${subtopicId}-${p}`])
    
    if (allCompleted) {
      // Mark subtopic as fully completed
      const completedSubtopics = JSON.parse(localStorage.getItem('completedSubtopics') || '{}')
      completedSubtopics[subtopicId] = true
      localStorage.setItem('completedSubtopics', JSON.stringify(completedSubtopics))
      
      // Check if Arrays unit is fully completed
      if (subjectId === 'dsa' && unitId === 'arrays') {
        const arraysUnit = subject.units.find(u => u.id === 'arrays')
        if (arraysUnit) {
          const allSubtopicsCompleted = arraysUnit.subtopics.every(st => 
            completedSubtopics[st.id]
          )
          if (allSubtopicsCompleted) {
            // Arrays unit completed! Badge will be added on next profile load
            console.log('🎉 Arrays unit completed! Badge will be added to profile.')
          }
        }
      }
    }
    
    // Assignment completed, go back to journey
    router.push(`/subject/${subjectId}/unit/${unitId}/journey`)
  }

  const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1)
  const isTheory = phase === 'theory'

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb + back */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(`/subject/${subjectId}/unit/${unitId}/journey`)}
            className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to journey
          </button>
          <nav className="hidden items-center gap-1.5 text-caption text-muted-foreground md:flex">
            <span>{subject.name}</span>
            <ChevronRight className="h-3 w-3" />
            <span>{unit.name}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{subtopic.name}</span>
          </nav>
        </div>

        {/* Non-theory phases get a tight context header — single level indicator (eyebrow). Component itself owns the difficulty chip. */}
        {!isTheory && (
          <div className="mb-10 border-b border-border pb-8">
            <p className="mb-2 text-eyebrow uppercase text-muted-foreground">
              {phaseLabel} phase
            </p>
            <h1 className="text-h2 font-semibold tracking-tight text-foreground">
              {subtopic.name}
            </h1>
            <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">
              {subtopic.description}
            </p>
          </div>
        )}

        {/* Phase Content */}
        <>
          {phase === 'theory' && (
            <div>
              <ConceptLearning
                subject={subject.name}
                unit={unit.name}
                subtopic={subtopic.name}
                onComplete={handleTheoryComplete}
                subjectId={subjectId}
                unitId={unitId}
                subtopicId={subtopicId}
              />
            </div>
          )}

          {phase === 'mcq' && (
            <div>
              <MCQGate
                subject={subject.name}
                unit={`${unit.name} - ${subtopic.name}`}
                subjectId={subjectId}
                unitId={unitId}
                subtopicId={subtopicId}
                subtopicName={subtopic.name}
                phase="mcq"
                onPass={handleMCQComplete}
                isFirstUnit={unitId === subject.units[0]?.id}
              />
            </div>
          )}

          {(phase === 'basic' || phase === 'medium' || phase === 'hard') && (
            <div>
              {subjectId === 'dbms' ? (
                <SQLChallenge
                  subject={subject.name}
                  unit={unit.name}
                  subtopic={subtopic.name}
                  subjectId={subjectId}
                  unitId={unitId}
                  subtopicId={subtopicId}
                  phase={phase}
                  difficulty={phase === 'basic' ? 'Basic' : phase === 'medium' ? 'Medium' : 'Advanced'}
                  onComplete={phase === 'basic' ? handleBasicComplete : handleCodingComplete}
                />
              ) : subjectId === 'os' || subjectId === 'cn' ? (
                // For OS and CN, use conceptual Q&A (MCQs) instead of coding practice
                <MCQGate
                  subject={subject.name}
                  unit={`${unit.name} - ${subtopic.name}`}
                  subjectId={subjectId}
                  unitId={unitId}
                  subtopicId={subtopicId}
                  subtopicName={subtopic.name}
                  phase={phase}
                  onPass={phase === 'basic' ? handleBasicComplete : handleCodingComplete}
                  isFirstUnit={false}
                />
              ) : (
                <CodingChallenge
                  subject={subject.name}
                  unit={unit.name}
                  subtopic={subtopic.name}
                  subjectId={subjectId}
                  unitId={unitId}
                  subtopicId={subtopicId}
                  phase={phase}
                  difficulty={phase === 'basic' ? 'Basic' : phase === 'medium' ? 'Medium' : 'Advanced'}
                  onComplete={phase === 'basic' ? handleBasicComplete : handleCodingComplete}
                />
              )}
            </div>
          )}

          {phase === 'assignment' && (
            <div>
              <PersonalizedAssignment
                subject={subject.name}
                unit={unit.name}
                subtopic={subtopic.name}
                subjectId={subjectId}
                unitId={unitId}
                subtopicId={subtopicId}
                phase="assignment"
                onComplete={handleAssignmentComplete}
              />
            </div>
          )}
        </>
      </div>

      {/* Badge Unlock Modal */}
      <AnimatePresence>
        {showBadge && (
          <BadgeUnlock
            subtopicName={subtopic.name}
            onClose={handleBadgeClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
