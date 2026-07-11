import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { mockShows } from "@/lib/mock-data";
import { Show } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({ source: "mock", data: mockShows });
  }

  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { source: "mock", data: mockShows, warning: error.message },
      { status: 200 }
    );
  }

  return NextResponse.json({ source: "supabase", data: (data as Show[]) ?? [] });
}
