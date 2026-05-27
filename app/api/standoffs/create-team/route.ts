import { NextRequest, NextResponse } from 'next/server'
import { createStandoffTeam } from '@/lib/database/standoffs'
import { Domain } from '@/lib/subjects'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(request: NextRequest) {
  try {
    const userId = await requireSessionDatabaseUserId()
    const body = await request.json()
    const { domain } = body

    const standoffId = await createStandoffTeam(userId, (domain || 'placement') as Domain)

    if (!standoffId) {
      return NextResponse.json(
        { error: 'Failed to create standoff team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ standoffId })
  } catch (error: any) {
    console.error('Error creating standoff team:', error)
    return NextResponse.json(
      { error: 'Failed to create standoff team' },
      { status: 500 }
    )
  }
}



