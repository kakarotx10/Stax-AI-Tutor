import { NextRequest, NextResponse } from 'next/server'
import { executeCode, type Judge0Language } from '@/lib/judge0'
import { requireAuth } from '@/src/middleware/auth.middleware'
import sqlite3 from 'sqlite3'

// Helper function to execute SQL
async function executeSQL(query: string, schema?: string, seedData?: string): Promise<{ results: any[], rowCount: number }> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:')
    
    db.serialize(() => {
      // Initialize schema
      if (schema) {
        db.exec(schema, (err) => {
          if (err) {
            db.close()
            reject(err)
            return
          }
        })
      }
      
      // Load seed data
      if (seedData) {
        db.exec(seedData, (err) => {
          if (err) {
            db.close()
            reject(err)
            return
          }
        })
      }
      
      // Execute query
      db.all(query, (err, rows) => {
        if (err) {
          db.close()
          reject(err)
          return
        }
        
        db.close()
        resolve({ results: rows || [], rowCount: rows?.length || 0 })
      })
    })
  })
}

export type CodeLanguage = 
  | 'python' | 'cpp' | 'java' | 'sql' 
  | 'html' | 'css' | 'javascript' | 'react' | 'nodejs' | 'express' | 'django' | 'flask'
  | 'ml-python'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { code, language, stdin, expectedOutput, context } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      )
    }

    // Handle SQL
    if (language === 'sql') {
      try {
        const result = await executeSQL(code, context?.schema, context?.seedData)
        return NextResponse.json({ 
          result: {
            success: true,
            results: result.results || [],
            rowCount: result.rowCount || 0,
            stdout: JSON.stringify(result.results, null, 2),
            stderr: null,
            compileOutput: null,
            status: 'Accepted',
            passed: true
          }
        })
      } catch (error: any) {
        return NextResponse.json({
          result: {
            success: false,
            results: [],
            rowCount: 0,
            stdout: '',
            stderr: error.message || 'SQL execution failed',
            compileOutput: null,
            status: 'Error',
            passed: false
          }
        })
      }
    }

    // Handle Frontend (HTML/CSS/JS) - Return preview HTML
    if (['html', 'css', 'javascript'].includes(language)) {
      return NextResponse.json({
        result: {
          stdout: code,
          stderr: null,
          compileOutput: null,
          status: 'Accepted',
          passed: true,
          preview: true, // Flag for frontend preview
          language
        }
      })
    }

    // Handle React - Return JSX preview
    if (language === 'react') {
      return NextResponse.json({
        result: {
          stdout: code,
          stderr: null,
          compileOutput: null,
          status: 'Accepted',
          passed: true,
          preview: true,
          language: 'react'
        }
      })
    }

    // Handle Backend (Node.js, Express, Django, Flask) - Use Python for now, or return API response
    if (['nodejs', 'express', 'django', 'flask'].includes(language)) {
      // For backend, we'll simulate API responses
      // In production, you'd want to run these in containers
      return NextResponse.json({
        result: {
          stdout: `Backend code executed (${language})\n\nNote: Full backend execution requires containerized environment.`,
          stderr: null,
          compileOutput: null,
          status: 'Accepted',
          passed: true,
          backend: true,
          language
        }
      })
    }

    // Handle ML Python - Use regular Python execution but with ML context
    if (language === 'ml-python') {
      // ML code uses Python but may need special libraries
      // For now, use regular Python execution
      const result = await executeCode(
        code,
        'python' as Judge0Language,
        stdin,
        expectedOutput
      )
      return NextResponse.json({ result })
    }

    // Handle regular languages (Python, C++, Java)
    if (!['python', 'cpp', 'java'].includes(language)) {
      return NextResponse.json(
        { error: `Language "${language}" is not supported yet` },
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
