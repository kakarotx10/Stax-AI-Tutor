import { NextRequest, NextResponse } from 'next/server'
import { getMCQsForSubtopic } from '@/lib/mcqDatabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const subject = body.subject
    const unit = body.unit
    const subtopic = body.subtopic || body.concept || unit

    if (!subject || !unit) {
      return NextResponse.json(
        { error: 'Subject and unit are required' },
        { status: 400 }
      )
    }

    // Use static database (which generates MCQs on-the-fly if not found)
    const mcqs = getMCQsForSubtopic(subject, unit, subtopic)

    // Convert to component format
    const formattedMCQs = mcqs.map(mcq => ({
      question: mcq.question,
      options: mcq.options,
      correctAnswer: mcq.correctAnswer,
      explanation: mcq.explanation,
      wrongExplanations: mcq.wrongExplanations ?? {},
      difficulty: mcq.difficulty.toLowerCase() as 'basic' | 'medium' | 'advanced'
    }))

    return NextResponse.json({ mcqs: formattedMCQs })
  } catch (error: any) {
    console.error('Error getting MCQs:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get MCQs.',
        mcqs: []
      },
      { status: 500 }
    )
  }
}


