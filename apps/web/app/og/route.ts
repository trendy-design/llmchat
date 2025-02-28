import { NextResponse } from 'next/server'
import ogs from 'open-graph-scraper'

type OGResponse = {
  title: string
  description: string
  image: string
  favicon: string
  url: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    const { result } = await ogs({ url })

    const hostname = new URL(url).hostname

    const response: OGResponse = {
      title: result.ogTitle || result.twitterTitle || '',
      description: result.ogDescription || result.twitterDescription || '',
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || '',
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      url: result.ogUrl || url
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Open Graph data' },
      { status: 500 }
    )
  }
}
