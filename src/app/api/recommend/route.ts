import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Recommendation API route placeholder (Phase 2)",
    recommendation: null,
  });
}
