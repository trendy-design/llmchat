import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { NextResponse, type NextRequest } from "next/server";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export type TReaderResponse = {
  success: boolean;
  title: string;
  url: string;
  markdown: string;
  error?: string;
};

function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<header[\s\S]*?>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?>[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s\S]*?>[\s\S]*?<\/nav>/gi, "")
    .replace(/<aside[\s\S]*?>[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?>[\s\S]*?<\/form>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(
      /<div[^>]*class\s*=\s*["']?(?:ad|advertisement|banner)["']?[^>]*>[\s\S]*?<\/div>/gi,
      "",
    );
}

export type TReaderResult = {
  success: boolean;
  title?: string;
  url?: string;
  markdown?: string;
};

const MIN_CONTENT_LENGTH = 500;

const readURL = async (url: string): Promise<TReaderResult> => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const cleanedHtml = cleanHtml(html);
    const doc = new JSDOM(cleanedHtml);

    if (doc?.window?.document) {
      const article = new Readability(doc.window.document).parse();

      if (article?.content) {
        const markdown = turndownService.turndown(article.content);

        if (markdown.length >= MIN_CONTENT_LENGTH) {
          return {
            success: true,
            title: article.title,
            url: url,
            markdown: markdown,
          };
        } else {
          console.log(
            `Content too short (${markdown.length} chars). Falling back to Jina.`,
          );
        }
      }
    }
    if (process.env.JINA_API_KEY) {
      return await fetchWithJina(url);
    }
    return { success: false };
  } catch (error) {
    console.error("Error in readURL:", error);
    return { success: false };
  }
};

const fetchWithJina = async (url: string): Promise<TReaderResult> => {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Jina API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      markdown: data.content,
      title: data.title,
      url: url,
    };
  } catch (error) {
    console.error("Error fetching with Jina:", error);
    return { success: false };
  }
};

export async function POST(req: NextRequest, resp: NextResponse) {
  const { urls } = await req.json();
  if (!urls?.length) {
    return NextResponse.json({
      success: false,
      error: "No URLs provided",
    });
  }

  const results = await Promise.all(
    urls?.map(async (url: string) => await readURL(url)),
  );

  return NextResponse.json({ results });
}
