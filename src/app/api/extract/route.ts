import { NextResponse, type NextRequest } from "next/server";
import puppeteer from "puppeteer";
import TurndownService from "turndown";

const turndownService = new TurndownService();

async function scrapeWebsite(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2", // Wait until the network is idle
  });

  // Remove script and style tags
  await page.evaluate(() => {
    document
      .querySelectorAll("script, style, noscript, iframe")
      .forEach((el) => el.remove());
  });

  // Remove sidebar and navbarx
  await page.evaluate(() => {
    document
      .querySelectorAll("sidebar, nav, footer, header")
      .forEach((el) => el.remove());
  });

  // Get the cleaned HTML content
  const cleanedContent = await page.evaluate(() => document.body.innerHTML);
  await browser.close();

  return cleanedContent;
}

export async function POST(req: NextRequest, resp: NextResponse) {
  const { url } = await req.json();

  if (!url) {
    return Response.json({ error: "No URL provided" }, { status: 401 });
  }

  const htmlContent = await scrapeWebsite(url);

  if (!htmlContent) {
    return Response.json({ error: "Error fetching content" }, { status: 500 });
  }
  const markdownContent = turndownService.turndown(htmlContent);

  console.log(markdownContent);
  return NextResponse.json({ text: markdownContent });
}
