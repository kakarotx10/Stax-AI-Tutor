import { NextRequest, NextResponse } from 'next/server'
import { submitDuelSolution } from '@/lib/database/duels'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireSessionDatabaseUserId()
    const body = await request.json()
    const { solution, score } = body

    if (!solution) {
      return NextResponse.json(
        { error: 'Solution required' },
        { status: 400 }
      )
    }

    const success = await submitDuelSolution(
      params.id,
      userId,
      solution,
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




