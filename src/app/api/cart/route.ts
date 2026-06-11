import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerAnswers, selectedBundle, path } = body;

    console.log("=== PHASE 1 CART STUB POST ===");
    console.log("Answers:", JSON.stringify(customerAnswers, null, 2));
    console.log("Bundle:", JSON.stringify(selectedBundle, null, 2));
    console.log("Path:", path);
    console.log("===============================");

    // Simulate database / network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      message: "Phase 1 cart success mock. Ready to hook up to BigCommerce in Phase 2.",
      cartId: "mock-cart-id-777",
    });
  } catch (error: any) {
    console.error("[API Cart Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
