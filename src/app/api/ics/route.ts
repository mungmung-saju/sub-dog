import { buildIcsFromItems, parseIcsPayload } from "../../../lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ics?data=<urlencoded JSON IcsItem[]>
 *
 * iOS Safari / 인앱 브라우저가 네이티브 '캘린더에 추가' 시트를 띄우려면
 * blob:/data: 가 아니라 HTTP 응답으로 text/calendar + Content-Disposition: inline 이 와야 한다.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("data");
  if (!raw) {
    return new Response("missing data", { status: 400 });
  }

  let items;
  try {
    items = parseIcsPayload(raw);
  } catch {
    return new Response("invalid data", { status: 400 });
  }

  const siteUrl = `${url.protocol}//${url.host}`;
  const ics = buildIcsFromItems(items, siteUrl);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sub-dog-alarm.ics"',
      "Cache-Control": "no-store",
    },
  });
}
