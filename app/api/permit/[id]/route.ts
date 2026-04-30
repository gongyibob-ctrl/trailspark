import { NextResponse } from "next/server";
import { fetchPermitFacility } from "@/lib/ridb";

// Cached at the edge for a day; permit descriptions barely change
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  // Reject anything that's not a digit string — defensive against URL-injection
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const data = await fetchPermitFacility(params.id);
    if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "fetch failed" }, { status: 500 });
  }
}
