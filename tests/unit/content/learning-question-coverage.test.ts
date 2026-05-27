import { SUBJECTS } from '@/content/subjects'
import {
  FRONTEND_BACKEND_QUESTIONS,
  getQuestionsForTopic,
  type Difficulty as FrontendBackendDifficulty,
} from '@/content/frontendBackend'
import { hasCodingProblem } from '@/content/codingProblems'
import { getSQLQuestion } from '@/content/sql'
import { getMCQsForSubtopic, type Difficulty as MCQDifficulty } from '@/content/mcq'

const PRACTICE_PHASES = [
  {
    phase: 'basic',
    frontendBackendDifficulty: 'Basic',
    codingDifficulty: 'Basic',
    sqlDifficulty: 'Basic',
    mcqDifficulty: 'Basic',
  },
  {
    phase: 'medium',
    frontendBackendDifficulty: 'Medium',
    codingDifficulty: 'Medium',
    sqlDifficulty: 'Medium',
    mcqDifficulty: 'Medium',
  },
  {
    phase: 'hard',
    frontendBackendDifficulty: 'Hard',
    codingDifficulty: 'Advanced',
    sqlDifficulty: 'Advanced',
    mcqDifficulty: 'Advanced',
  },
] as const

function routeFor(subjectId: string, unitId: string, subtopicId: string, phase: string): string {
  return `/subject/${subjectId}/unit/${unitId}/subtopic/${subtopicId}/${phase}`
}

describe('learning journey question coverage', () => {
  it('has a matching practice question for every basic, medium, and hard route', () => {
    const missing: string[] = []

    for (const subject of Object.values(SUBJECTS)) {
      for (const unit of subject.units) {
        for (const subtopic of unit.subtopics) {
          for (const phase of PRACTICE_PHASES) {
            const route = routeFor(subject.id, unit.id, subtopic.id, phase.phase)

            if (subject.domain === 'frontend' || subject.domain === 'backend') {
              const questions = getQuestionsForTopic(
                subject.name,
                unit.name,
                subtopic.name,
                phase.frontendBackendDifficulty as FrontendBackendDifficulty
              )

              if (questions.length === 0) {
                missing.push(`${route} -> frontend/backend ${phase.frontendBackendDifficulty}`)
              }
              continue
            }

            if (subject.id === 'dbms') {
              const question = getSQLQuestion(subject.name, unit.name, subtopic.name, phase.sqlDifficulty)

              if (!question) {
                missing.push(`${route} -> SQL ${phase.sqlDifficulty}`)
              }
              continue
            }

            if (subject.id === 'os' || subject.id === 'cn') {
              const questions = getMCQsForSubtopic(subject.name, unit.name, subtopic.name).filter(
                (question) => question.difficulty === (phase.mcqDifficulty as MCQDifficulty)
              )

              if (questions.length === 0) {
                missing.push(`${route} -> MCQ ${phase.mcqDifficulty}`)
              }
              continue
            }

            const hasProblem = hasCodingProblem(subject.name, unit.name, subtopic.name, phase.codingDifficulty)

            if (!hasProblem) {
              missing.push(`${route} -> coding ${phase.codingDifficulty}`)
            }
          }
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('keeps frontend/backend route keys exact and usable', () => {
    const invalid = FRONTEND_BACKEND_QUESTIONS.flatMap((question) => {
      const hasVisibleStarterCode = Boolean(
        question.starterCode?.html ||
          question.starterCode?.css ||
          question.starterCode?.javascript ||
          question.starterCode?.react
      )
      const missingFields = [
        question.subject ? null : 'subject',
        question.unit ? null : 'unit',
        question.subtopic ? null : 'subtopic',
        question.difficulty ? null : 'difficulty',
        question.title ? null : 'title',
        question.description ? null : 'description',
        question.requirements.length > 0 ? null : 'requirements',
        question.starterCode ? null : 'starterCode',
        hasVisibleStarterCode ? null : 'visible starterCode',
        question.hints.length > 0 ? null : 'hints',
      ].filter(Boolean)

      return missingFields.length > 0
        ? [`${question.subject} -> ${question.unit} -> ${question.subtopic}: ${missingFields.join(', ')}`]
        : []
    })

    const duplicateTitles = new Set<string>()
    const seenTitles = new Set<string>()

    for (const question of FRONTEND_BACKEND_QUESTIONS) {
      const key = `${question.subject}|||${question.unit}|||${question.subtopic}|||${question.title}`
      if (seenTitles.has(key)) duplicateTitles.add(key)
      seenTitles.add(key)
    }

    expect(invalid).toEqual([])
    expect([...duplicateTitles]).toEqual([])
  })
})
