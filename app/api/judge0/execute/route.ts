import { NextRequest, NextResponse } from 'next/server'
import { executeCode, type Judge0Language } from '@/lib/judge0'
import { requireAuth } from '@/src/middleware/auth.middleware'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { code, language, stdin, expectedOutput } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      )
    }

    if (!['python', 'cpp', 'java'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: python, cpp, java' },
        { status: 400 }
      )
    }

    const result = await executeCode(
      code,
      language as Judge0Language,
      stdin,
      expectedOutput
    )

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('Error executing code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute code' },
      { status: 500 }
    )
  }
}


















