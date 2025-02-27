import { NextResponse, type NextRequest } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

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
};

const MIN_CONTENT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 2000;

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
    exclusiveFilter: frame =>
      ['script', 'style', 'header', 'footer', 'nav', 'iframe', 'form', 'aside'].includes(frame.tag),
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow' }),
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
      },
    });
    if (!response.ok) {
      throw new Error(`Jina API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      title: data.data.title,
      description: data.data.description,
      url: data.data.url,
      markdown: data.data.content,
      source: 'jina',
    };
  } catch (error) {
    console.error('Error fetching with Jina:', error);
    return { success: false };
  }
};

const readURL = async (url: string): Promise<TReaderResult> => {
  try {
    // const response = await fetch(url);
    // const html = await response.text();
    // const cleanedHtml = cleanHtml(html);
    // const doc = new JSDOM(cleanedHtml);
    // const article = new Readability(doc.window.document).parse();

    // if (article?.content) {
    //   let markdown = turndownService.turndown(article.content);
    //   markdown = truncateContent(markdown, MAX_CONTENT_LENGTH);
    //   if (markdown.length >= MIN_CONTENT_LENGTH) {
    //     return {
    //       success: true,
    //       title: article.title,
    //       url,
    //       markdown,
    //       source: 'readability',
    //     };
    //   }
    // }
    if (process.env.JINA_API_KEY) {
      return await fetchWithJina(url);
    }
    else{
      console.log('No Jina API key found');
    }
    return { success: false };
  } catch (error) {
    console.error('Error in readURL:', error);
    return { success: false };
  }
};

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ success: false, error: 'No URL provided' });
  }
  const result = await readURL(url);
  return NextResponse.json({ result });
}
