import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Products API route placeholder (Phase 2)",
    products: [],
  });
}
