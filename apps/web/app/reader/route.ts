import { NextResponse, type NextRequest } from 'next/server';
import sanitizeHtml from 'sanitize-html';

export type TReaderResponse = {
  success: boolean;
  title: string;
  url: string;
  markdown: string;
  error?: string;
  source?: 'jina' | 'readability';
};

export type TReaderResult = {
  success: boolean;
  title?: string;
  url?: string;
  description?: string;
  markdown?: string;
  source?: 'jina' | 'readability';
  error?: string;
};

const MIN_CONTENT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 10000;

function truncateContent(content: string, maxWords: number): string {
  const words = content.split(/\s+/).filter(Boolean);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') : content;
}

function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'article',
      'section',
      'div',
      'p',
      'br',
      'blockquote',
      'pre',
      'code',
      'a',
      'ul',
      'ol',
      'li',
      'strong',
      'b',
      'i',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    exclusiveFilter: frame => {
      // Remove internal links completely
      if (frame.tag === 'a' && frame.attribs.href && 
          !frame.attribs.href.startsWith('http') && 
          !frame.attribs.href.startsWith('https') && 
          !frame.attribs.href.startsWith('mailto:')) {
        return true;
      }
      return ['script', 'style', 'header', 'footer', 'nav', 'iframe', 'form', 'aside'].includes(frame.tag);
    },
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: { ...attribs, rel: 'nofollow' }
        };
      },
      '*': (tagName, attribs) => {
        Object.keys(attribs).forEach(key => {
          if (key.startsWith('on')) {
            delete attribs[key];
          }
        });
        return { tagName, attribs };
      },
    },
  });
}


const fetchWithJina = async (url: string): Promise<TReaderResult> => {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        Accept: 'application/json',
        'X-Engine': 'browser',
        'X-Md-Link-Style': 'referenced',
        'X-No-Cache': 'true',
        'X-Retain-Images': 'none',
        'X-Return-Format': 'markdown',
        'X-Robots-Txt': 'JinaReader',
        'X-With-Links-Summary': 'true'
      },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Jina API responded with status: ${response.status}`);
    }
    
    // First try to get the response as text to check for binary content
    const responseText = await response.text();
    
    // Check if the response is actually JSON
    try {
      const data = JSON.parse(responseText);
      
      // Check if content exists and sanitize it
      if (data.data && data.data.content) {
        // Truncate if needed
        const truncatedContent = truncateContent(data.data.content, MAX_CONTENT_LENGTH);
        
        return {
          success: true,
          title: data.data.title,
          description: data.data.description,
          url: data.data.url,
          markdown: truncatedContent,
          source: 'jina',
        };
      } else {
        return {
          success: false,
          error: 'No content found in Jina response'
        };
      }
    } catch (jsonError) {
      // If it's not valid JSON, it might be binary data
      console.error('Error parsing Jina response as JSON:', jsonError);
      
  
      
      return {
        success: false,
        error: 'Invalid response format from Jina API'
      };
    }
  } catch (error) {
    console.error('Error fetching with Jina:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error with Jina API'
    };
  }
};

const readURL = async (url: string): Promise<TReaderResult> => {
  try {
    
    if (process.env.JINA_API_KEY) {
      return await fetchWithJina(url);
    } else {
      console.log('No Jina API key found');
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error in readURL:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'No URL provided' });
    }
    
    const result = await readURL(url);
    
    // Use safe stringify to handle any issues
    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error processing request' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
