import { NextRequest, NextResponse } from 'next/server'
import { joinMarathon } from '@/lib/database/marathons'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbUserId = await requireSessionDatabaseUserId()

    const success = await joinMarathon(params.id, dbUserId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to join marathon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error joining marathon:', error)
    return NextResponse.json(
      { error: 'Failed to join marathon' },
      { status: 500 }
    )
  }
}
