import { NextRequest, NextResponse } from 'next/server'
import { generateCodeFeedback } from '@/lib/interviewAIHelper'
import { executeCode } from '@/lib/judge0'
import { requireAuth } from '@/src/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { code, challenge, interviewType, domain } = await request.json()

    if (!code || !challenge) {
      return NextResponse.json(
        { error: 'Code and challenge are required' },
        { status: 400 }
      )
    }

    // Execute code to check if it works
    let executionResult = null
    try {
      const result = await executeCode(
        code,
        (challenge.language || 'python') as any,
        '',
        undefined
      )
      executionResult = {
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status,
        passed: !result.stderr && result.stdout.length > 0
      }
    } catch (error: any) {
      console.error('Code execution error:', error.message)
      executionResult = {
        stdout: '',
        stderr: error.message || 'Execution failed',
        status: 'Error',
        passed: false
      }
    }

    // Generate feedback using AI helper
    const problemDescription = `${challenge.title}\n${challenge.description}`
    const rubric = {
      expectedPoints: challenge.expectedApproach || [],
      redFlags: [],
      goodIndicators: [],
      minPointsForStrong: 2,
    }

    const feedback = await generateCodeFeedback(
      problemDescription,
      code,
      executionResult,
      rubric
    )

    return NextResponse.json({
      feedback: feedback || 'Thank you for submitting your code. Let me review it and provide feedback.',
      executionResult,
    })
  } catch (error: any) {
    console.error('Error submitting code:', error)
    return NextResponse.json(
      { error: 'Failed to submit code', details: error.message },
      { status: 500 }
    )
  }
}

