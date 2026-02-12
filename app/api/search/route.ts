import { NextResponse } from 'next/server'
import { smartSearch } from '@/lib/services/searchService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query') || ''
    const cuisine = searchParams.get('cuisine') || 'all'
    const diet = searchParams.get('diet') || ''

    const results = await smartSearch({
      query,
      cuisine,
    })

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    )
  }
}
