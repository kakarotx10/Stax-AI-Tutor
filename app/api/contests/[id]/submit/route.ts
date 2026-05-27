import { NextRequest, NextResponse } from 'next/server'
import { submitContestSolution } from '@/lib/database/contests'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { problemId, code, language, status, score } = body

    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const dbUserId = await requireSessionDatabaseUserId()

    const success = await submitContestSolution(
      params.id,
      problemId,
      dbUserId,
      code,
      language,
      status || 'pending',
      score || 0
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to submit solution' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error submitting solution:', error)
    return NextResponse.json(
      { error: 'Failed to submit solution' },
      { status: 500 }
    )
  }
}
