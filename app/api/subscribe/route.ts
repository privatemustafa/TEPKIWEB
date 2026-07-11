import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = (body?.email ?? "").toString().trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta gir." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Supabase yoksa kaydı simüle et (lokal geliştirme).
  if (!supabase) {
    return NextResponse.json({ ok: true, source: "mock", email });
  }

  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    // Unique violation = zaten kayıtlı
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, already: true, email });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, source: "supabase", email });
}
