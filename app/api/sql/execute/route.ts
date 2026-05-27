import { NextRequest, NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import { getSQLSchema } from '@/lib/sqlDatabase'
import { requireAuth } from '@/src/middleware/auth.middleware'

// Promisify sqlite3 methods
function createDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', (err) => {
      if (err) reject(err)
      else resolve(db)
    })
  })
}

function runQuery(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function allQuery(db: sqlite3.Database, sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}

function closeDatabase(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * Check if query is allowed (only SELECT queries)
 */
function isQueryAllowed(query: string): { allowed: boolean; error?: string } {
  const normalizedQuery = query.trim().toUpperCase()
  
  // Block dangerous keywords
  const blockedKeywords = ['DROP', 'DELETE', 'UPDATE', 'ALTER', 'INSERT', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE']
  
  for (const keyword of blockedKeywords) {
    if (normalizedQuery.includes(keyword)) {
      return {
        allowed: false,
        error: `Query type "${keyword}" is not allowed. Only SELECT queries are permitted.`
      }
    }
  }

  // Must start with SELECT
  if (!normalizedQuery.startsWith('SELECT')) {
    return {
      allowed: false,
      error: 'Only SELECT queries are allowed. Your query must start with SELECT.'
    }
  }

  return { allowed: true }
}

export async function POST(request: NextRequest) {
  let db: sqlite3.Database | null = null

  try {
    await requireAuth()
    const body = await request.json()
    const { query, questionId, schema, seedData } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Either questionId OR schema+seedData must be provided
    if (!questionId && (!schema || !seedData)) {
      return NextResponse.json(
        { error: 'Either questionId or both schema and seedData are required' },
        { status: 400 }
      )
    }

    // Check if query is allowed
    const queryCheck = isQueryAllowed(query)
    if (!queryCheck.allowed) {
      return NextResponse.json(
        { 
          error: queryCheck.error || 'Query not allowed',
          queryError: true
        },
        { status: 400 }
      )
    }

    // Get schema and seed data
    let finalSchema: string
    let finalSeedData: string

    if (questionId) {
      // Use predefined question schema
      const schemaData = getSQLSchema(questionId)
      if (!schemaData) {
        return NextResponse.json(
          { error: `Question ID "${questionId}" not found` },
          { status: 404 }
        )
      }
      finalSchema = schemaData.schema
      finalSeedData = schemaData.seedData
    } else {
      // Use provided schema and seed data (for assignments)
      finalSchema = schema
      finalSeedData = seedData
    }

    // Create in-memory database
    db = await createDatabase()

    // Initialize schema
    await runQuery(db, finalSchema)

    // Load seed data
    await runQuery(db, finalSeedData)

    // Execute user's query
    const results = await allQuery(db, query)

    // Close database
    await closeDatabase(db)
    db = null

    return NextResponse.json({
      success: true,
      results: results,
      rowCount: results.length
    })

  } catch (error: any) {
    // Close database if still open
    if (db) {
      try {
        await closeDatabase(db)
      } catch (closeError) {
        console.error('Error closing database:', closeError)
      }
    }

    // Extract error message
    const errorMessage = error?.message || 'Unknown error occurred'
    
    // Check if it's a SQL syntax error
    const isSyntaxError = errorMessage.toLowerCase().includes('syntax') || 
                         errorMessage.toLowerCase().includes('sql') ||
                         errorMessage.toLowerCase().includes('near')

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        sqlError: isSyntaxError,
        results: []
      },
      { status: 500 }
    )
  }
}
