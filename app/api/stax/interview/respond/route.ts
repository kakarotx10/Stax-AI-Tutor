import { NextRequest, NextResponse } from 'next/server'
import { InterviewEngine } from '@/lib/interviewEngine'
import { generateAIFollowUp, generateCrossQuestion } from '@/lib/interviewAIHelper'
import { requireAuth } from '@/src/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const {
      interviewType,
      domain,
      userResponse,
      conversationHistory,
      engineState,
    } = await request.json()

    if (!userResponse || !engineState) {
      return NextResponse.json(
        { error: 'User response and engine state are required' },
        { status: 400 }
      )
    }

    // Reconstruct engine from state
    const engineDomain = domain === 'all' ? 'placement' : domain
    const engine = new InterviewEngine(engineDomain as 'placement' | 'frontend' | 'backend' | 'fullstack' | 'aiml')
    
    // Restore engine state (simplified - in production, store state in session/DB)
    // For now, we'll work with current question from state
    const currentQuestion = engine.getCurrentQuestion()
    
    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'No current question found' },
        { status: 400 }
      )
    }

    // Submit answer to engine
    const result = engine.submitAnswer(userResponse)
    const { evaluation, nextQuestion, interviewComplete } = result

    // Determine response type
    let responseType: 'question' | 'coding' | 'feedback' = 'question'
    let response = ''
    let codingChallenge = null

    // Check if next question is a coding challenge
    if (nextQuestion?.isCoding && nextQuestion.codingChallenge) {
      responseType = 'coding'
      codingChallenge = {
        title: nextQuestion.codingChallenge.problem,
        description: nextQuestion.prompt,
        requirements: nextQuestion.codingChallenge.constraints,
        language: domain === 'frontend' ? 'javascript' : 'python',
        starterCode: '',
        expectedApproach: nextQuestion.codingChallenge.expectedApproach,
        testCases: nextQuestion.codingChallenge.testCases,
      }
      response = nextQuestion.prompt
    } else {
      // Use AI helper for intelligent follow-up (optional enhancement)
      const useAIEnhancement = Math.random() > 0.3 // 70% chance to use AI enhancement

      if (useAIEnhancement && nextQuestion) {
        try {
          const aiFollowUp = await generateAIFollowUp({
            question: nextQuestion,
            userAnswer: userResponse,
            evaluation,
            conversationHistory: conversationHistory || [],
          })

          // Use AI follow-up if available, otherwise use question prompt
          if (aiFollowUp.followUpQuestion && !aiFollowUp.shouldDrillDown) {
            response = `${evaluation.feedback}\n\n${aiFollowUp.followUpQuestion}`
          } else {
            response = `${evaluation.feedback}\n\n${nextQuestion.prompt}`
          }
        } catch (error) {
          // Fallback to question prompt
          response = `${evaluation.feedback}\n\n${nextQuestion.prompt}`
        }
      } else {
        // Use question prompt directly
        response = nextQuestion
          ? `${evaluation.feedback}\n\n${nextQuestion.prompt}`
          : evaluation.feedback
      }
    }

    // Generate cross-question if we have enough history (every 3-4 questions)
    const history = engine.getHistory()
    let crossQuestion = null
    
    if (history.length >= 3 && history.length % 3 === 0 && nextQuestion) {
      try {
        const previousAnswers = history.slice(-3).map((h) => h.answer)
        const crossQ = await generateCrossQuestion(
          nextQuestion.topic,
          previousAnswers,
          conversationHistory || []
        )
        if (crossQ) {
          crossQuestion = crossQ
        }
      } catch (error) {
        // Ignore cross-question errors
      }
    }

    return NextResponse.json({
      response: crossQuestion ? `${response}\n\n${crossQuestion}` : response,
      type: responseType,
      codingChallenge,
      evaluation: {
        quality: evaluation.quality,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
      nextQuestion: nextQuestion
        ? {
            id: nextQuestion.id,
            prompt: nextQuestion.prompt,
            section: nextQuestion.section,
            topic: nextQuestion.topic,
          }
        : null,
      interviewComplete,
      engineState: {
        currentQuestionId: nextQuestion?.id || null,
        template: engineDomain,
      },
    })
  } catch (error: any) {
    console.error('Error processing response:', error)
    return NextResponse.json(
      { error: 'Failed to process response', details: error.message },
      { status: 500 }
    )
  }
}

