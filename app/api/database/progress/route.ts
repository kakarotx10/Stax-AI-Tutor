import { NextRequest, NextResponse } from 'next/server'
import { saveUserProgress, getUserProgress, getAllUserProgress } from '@/lib/database/userProgress'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(request: NextRequest) {
  try {
    const userId = await requireSessionDatabaseUserId()
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'save') {
      const progress = await saveUserProgress({ ...data, user_id: userId })
      return NextResponse.json({ success: true, data: progress })
    }

    if (action === 'get') {
      const { subjectId, unitId, subtopicId, phase } = data
      const progress = await getUserProgress(userId, subjectId, unitId, subtopicId, phase)
      return NextResponse.json({ success: true, data: progress })
    }

    if (action === 'getAll') {
      const progress = await getAllUserProgress(userId)
      return NextResponse.json({ success: true, data: progress })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in progress API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}





