// Interview Engine - Manages question flow and answer evaluation
import {
  InterviewTemplateConfig,
  Question,
  AnswerEvaluation,
  AnswerQuality,
  getQuestionById,
  getTemplateByDomain,
} from './interviewQuestionnaire'

export interface InterviewState {
  template: InterviewTemplateConfig
  currentQuestionId: string
  questionHistory: Array<{
    questionId: string
    answer: string
    evaluation: AnswerEvaluation
    timestamp: Date
  }>
  sectionProgress: Record<string, number> // Track progress per section
}

export class InterviewEngine {
  private state: InterviewState

  constructor(domain: 'placement' | 'frontend' | 'backend' | 'fullstack' | 'aiml') {
    const template = getTemplateByDomain(domain)
    this.state = {
      template,
      currentQuestionId: template.startQuestionId,
      questionHistory: [],
      sectionProgress: {},
    }
  }

  // Get current question
  getCurrentQuestion(): Question | undefined {
    return getQuestionById(this.state.template, this.state.currentQuestionId)
  }

  // Evaluate answer against rubric
  evaluateAnswer(answer: string, question: Question): AnswerEvaluation {
    const answerLower = answer.toLowerCase()
    const matchedPoints: string[] = []
    const missingPoints: string[] = []
    const redFlagsFound: string[] = []
    const goodIndicatorsFound: string[] = []

    // Check expected points
    for (const point of question.rubric.expectedPoints) {
      const pointKeywords = point.toLowerCase().split(/\s+/)
      const hasPoint = pointKeywords.some((keyword) => answerLower.includes(keyword)) ||
                      answerLower.includes(point.toLowerCase())
      
      if (hasPoint) {
        matchedPoints.push(point)
      } else {
        missingPoints.push(point)
      }
    }

    // Check red flags
    for (const flag of question.rubric.redFlags) {
      if (answerLower.includes(flag.toLowerCase())) {
        redFlagsFound.push(flag)
      }
    }

    // Check good indicators
    for (const indicator of question.rubric.goodIndicators) {
      if (answerLower.includes(indicator.toLowerCase())) {
        goodIndicatorsFound.push(indicator)
      }
    }

    // Calculate score
    const pointsScore = matchedPoints.length
    const redFlagPenalty = redFlagsFound.length * 0.5
    const goodIndicatorBonus = goodIndicatorsFound.length * 0.3
    
    let score = Math.max(0, pointsScore - redFlagPenalty + goodIndicatorBonus)
    
    // Normalize to 0-3 scale
    const maxPossiblePoints = question.rubric.expectedPoints.length
    score = (score / maxPossiblePoints) * 3
    
    // Determine quality
    let quality: AnswerQuality
    if (score >= 2.5 || matchedPoints.length >= question.rubric.minPointsForStrong) {
      quality = 'strong'
    } else if (score >= 1.5 || matchedPoints.length >= question.rubric.minPointsForStrong * 0.6) {
      quality = 'ok'
    } else {
      quality = 'weak'
    }

    // Generate feedback
    let feedback = ''
    if (matchedPoints.length >= question.rubric.minPointsForStrong) {
      feedback = 'Good answer! You covered the key points.'
    } else if (matchedPoints.length > 0) {
      feedback = `You mentioned some good points. Consider also discussing: ${missingPoints.slice(0, 2).join(', ')}.`
    } else {
      feedback = 'Let me help clarify. ' + question.prompt.split('?')[0] + '?'
    }

    if (redFlagsFound.length > 0) {
      feedback += ' Try to be more specific and concrete.'
    }

    return {
      quality,
      score: Math.min(3, Math.max(0, score)),
      matchedPoints,
      missingPoints,
      redFlagsFound,
      feedback,
    }
  }

  // Submit answer and move to next question
  submitAnswer(answer: string): {
    evaluation: AnswerEvaluation
    nextQuestion: Question | null
    interviewComplete: boolean
  } {
    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) {
      return {
        evaluation: {
          quality: 'ok',
          score: 0,
          matchedPoints: [],
          missingPoints: [],
          redFlagsFound: [],
          feedback: 'No current question',
        },
        nextQuestion: null,
        interviewComplete: true,
      }
    }

    // Evaluate answer
    const evaluation = this.evaluateAnswer(answer, currentQuestion)

    // Record in history
    this.state.questionHistory.push({
      questionId: currentQuestion.id,
      answer,
      evaluation,
      timestamp: new Date(),
    })

    // Update section progress
    const section = currentQuestion.section
    this.state.sectionProgress[section] = (this.state.sectionProgress[section] || 0) + 1

    // Determine next question
    let nextQuestionId: string | undefined

    if (evaluation.quality === 'strong' && currentQuestion.nextQuestionIfGood) {
      nextQuestionId = currentQuestion.nextQuestionIfGood
    } else if (evaluation.quality === 'weak' && currentQuestion.nextQuestionIfWeak) {
      nextQuestionId = currentQuestion.nextQuestionIfWeak
    } else if (currentQuestion.nextQuestionIfOk) {
      nextQuestionId = currentQuestion.nextQuestionIfOk
    } else if (currentQuestion.nextQuestionIfGood) {
      nextQuestionId = currentQuestion.nextQuestionIfGood
    }

    const nextQuestion = nextQuestionId
      ? getQuestionById(this.state.template, nextQuestionId) || null
      : null

    // Check if interview is complete
    const interviewComplete = !nextQuestion || nextQuestion.section === 'closing'

    if (nextQuestion) {
      this.state.currentQuestionId = nextQuestionId!
    }

    return {
      evaluation,
      nextQuestion,
      interviewComplete,
    }
  }

  // Get interview statistics
  getStatistics() {
    const totalQuestions = this.state.questionHistory.length
    const strongAnswers = this.state.questionHistory.filter(
      (h) => h.evaluation.quality === 'strong'
    ).length
    const averageScore =
      this.state.questionHistory.reduce((sum, h) => sum + h.evaluation.score, 0) / totalQuestions || 0

    return {
      totalQuestions,
      strongAnswers,
      averageScore,
      sectionProgress: this.state.sectionProgress,
    }
  }

  // Get question history
  getHistory() {
    return this.state.questionHistory
  }

  // Get current section
  getCurrentSection(): string {
    const currentQuestion = this.getCurrentQuestion()
    return currentQuestion?.section || 'intro'
  }
}

