import { NextRequest, NextResponse } from 'next/server'
import { joinContest } from '@/lib/database/contests'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbUserId = await requireSessionDatabaseUserId()

    const success = await joinContest(params.id, dbUserId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to join contest' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error joining contest:', error)
    return NextResponse.json(
      { error: 'Failed to join contest' },
      { status: 500 }
    )
  }
}
