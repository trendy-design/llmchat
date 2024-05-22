import ogs from "open-graph-scraper";
export async function POST(request: Request) {
  const query = await request.json();

  const { result } = await ogs({ url: query.url });

  return Response.json({ status: "ok", result }, { status: 200 });
}
