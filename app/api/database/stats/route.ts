import { NextRequest, NextResponse } from 'next/server'
import { getUserStats, updateUserStats, addXP, incrementProblemsSolved } from '@/lib/database/userStats'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(request: NextRequest) {
  try {
    const userId = await requireSessionDatabaseUserId()
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'get') {
      const stats = await getUserStats(userId)
      return NextResponse.json({ success: true, data: stats })
    }

    if (action === 'update') {
      const { updates } = data
      const stats = await updateUserStats(userId, updates)
      return NextResponse.json({ success: true, data: stats })
    }

    if (action === 'addXP') {
      const { xpAmount } = data
      const stats = await addXP(userId, xpAmount)
      return NextResponse.json({ success: true, data: stats })
    }

    if (action === 'incrementProblemsSolved') {
      const stats = await incrementProblemsSolved(userId)
      return NextResponse.json({ success: true, data: stats })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in stats API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}





