import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { mockTracks } from "@/lib/mock-data";
import { Track } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({ source: "mock", data: mockTracks });
  }

  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { source: "mock", data: mockTracks, warning: error.message },
      { status: 200 }
    );
  }

  return NextResponse.json({ source: "supabase", data: (data as Track[]) ?? [] });
}
