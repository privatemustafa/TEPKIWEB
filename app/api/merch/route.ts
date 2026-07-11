import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { mockMerch } from "@/lib/mock-data";
import { MerchItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({ source: "mock", data: mockMerch });
  }

  const { data, error } = await supabase
    .from("merch")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { source: "mock", data: mockMerch, warning: error.message },
      { status: 200 }
    );
  }

  return NextResponse.json({
    source: "supabase",
    data: (data as MerchItem[]) ?? [],
  });
}
