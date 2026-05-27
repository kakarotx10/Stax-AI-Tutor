import { NextRequest, NextResponse } from 'next/server'
import { InterviewEngine } from '@/lib/interviewEngine'
import { requireAuth } from '@/src/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { interviewType, domain } = await request.json()

    if (!interviewType || !domain) {
      return NextResponse.json(
        { error: 'Interview type and domain are required' },
        { status: 400 }
      )
    }

    // Map domain to engine domain
    const engineDomain = domain === 'all' ? 'placement' : domain

    // Create interview engine
    const engine = new InterviewEngine(engineDomain as 'placement' | 'frontend' | 'backend' | 'fullstack' | 'aiml')
    const currentQuestion = engine.getCurrentQuestion()

    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'Failed to initialize interview' },
        { status: 500 }
      )
    }

    // Generate greeting based on first question
    const greeting = currentQuestion.prompt

    return NextResponse.json({
      greeting,
      questionId: currentQuestion.id,
      question: currentQuestion,
      engineState: {
        currentQuestionId: currentQuestion.id,
        template: engineDomain,
      },
    })
  } catch (error: any) {
    console.error('Error starting interview:', error)
    return NextResponse.json(
      { error: 'Failed to start interview', details: error.message },
      { status: 500 }
    )
  }
}

