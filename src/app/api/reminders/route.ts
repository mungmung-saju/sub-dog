import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Channel = "kakao" | "email" | "sms";

interface ReminderBody {
  channel: Channel;
  contact: string;
  consent: boolean;
  subscriptions: {
    serviceId: string;
    name: string;
    kind: "trial" | "billing";
    dueDate: string; // YYYY-MM-DD
    alertDate: string; // 결제 3일 전
    price?: number;
  }[];
}

const CONTACT_RULES: Record<Channel, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  sms: /^01[016789]-?\d{3,4}-?\d{4}$/,
  kakao: /^01[016789]-?\d{3,4}-?\d{4}$/, // 알림톡은 휴대폰 번호 기준
};

/**
 * 알림 신청 접수 API.
 * - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 있으면 `reminder_requests` 테이블에 저장
 * - 없으면 저장 없이 성공 응답(개발/데모 모드)
 * 실제 발송(알림톡/메일/문자)은 이 테이블을 읽는 크론/Edge Function 에서 alert_date 기준으로 처리하세요.
 */
export async function POST(req: Request) {
  let body: ReminderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청이에요." }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ ok: false, error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
  }
  if (!CONTACT_RULES[body.channel]?.test(body.contact?.trim() ?? "")) {
    return NextResponse.json({ ok: false, error: "연락처 형식을 확인해 주세요." }, { status: 400 });
  }
  if (!Array.isArray(body.subscriptions) || body.subscriptions.length === 0 || body.subscriptions.length > 50) {
    return NextResponse.json({ ok: false, error: "등록된 구독이 없어요." }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const rows = body.subscriptions.map((s) => ({
    channel: body.channel,
    contact: body.contact.trim(),
    service_id: s.serviceId,
    service_name: s.name,
    kind: s.kind,
    due_date: s.dueDate,
    alert_date: s.alertDate,
    price: s.price ?? null,
  }));

  try {
    const res = await fetch(`${url}/rest/v1/reminder_requests`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: false, error: "서버에 연결할 수 없어요." }, { status: 502 });
  }
}
