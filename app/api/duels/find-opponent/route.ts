import { NextRequest, NextResponse } from 'next/server'
import { findOpponent, createDuel, startDuel } from '@/lib/database/duels'
import { generateCodingProblem } from '@/lib/gemini'
import { ContestProblem } from '@/lib/types/contests'
import { Domain } from '@/lib/subjects'
import { requireSessionDatabaseUserId } from '@/src/lib/session-user'

export async function POST(request: NextRequest) {
  try {
    const dbUserId = await requireSessionDatabaseUserId()
    const body = await request.json()
    const { difficulty, subject, unit, domain } = body

    // Find an opponent
    const opponentId = await findOpponent(dbUserId)

    // If no opponent found, create a bot opponent (for demo purposes)
    let finalOpponentId = opponentId
    if (!opponentId) {
      // Create a temporary bot user
      const { getSupabaseAdmin } = await import('@/lib/supabase')
      const admin = getSupabaseAdmin()
      if (admin) {
        const { data: botUser } = await admin
          .from('users')
          .insert({
            username: `bot-${Date.now()}`,
            display_name: 'Bot Opponent'
          })
          .select('id')
          .single()
        
        if (botUser) {
          finalOpponentId = botUser.id
        }
      }
      
      if (!finalOpponentId) {
        return NextResponse.json(
          { error: 'No opponent found. Try again later!' },
          { status: 404 }
        )
      }
    }

    // Generate a problem using Gemini
    const generatedProblem = await generateCodingProblem(
      subject || 'Computer Science',
      unit || 'Algorithms',
      difficulty || 'Medium'
    )

    const problem: ContestProblem = {
      id: `problem-${Date.now()}`,
      title: generatedProblem.title,
      difficulty: difficulty || 'Medium',
      points: 100,
      solvedBy: 0
    }

    // Create the duel
    if (typeof finalOpponentId !== 'string' || typeof dbUserId !== 'string') {
      return NextResponse.json(
        { error: 'No opponent or user available' },
        { status: 404 }
      )
    }
    
    const duelId = await createDuel(
      dbUserId,
      finalOpponentId,
      problem, 
      (domain || 'placement') as Domain,
      50
    )

    if (!duelId) {
      return NextResponse.json(
        { error: 'Failed to create duel' },
        { status: 500 }
      )
    }

    // Start the duel
    await startDuel(duelId)

    return NextResponse.json({
      duelId,
      opponentId: finalOpponentId,
      problem: {
        ...problem,
        description: generatedProblem.description,
        examples: generatedProblem.examples,
        testCases: generatedProblem.testCases,
        constraints: generatedProblem.constraints,
        hints: generatedProblem.hints
      }
    })
  } catch (error: any) {
    console.error('Error finding opponent:', error)
    return NextResponse.json(
      { error: 'Failed to find opponent' },
      { status: 500 }
    )
  }
}
