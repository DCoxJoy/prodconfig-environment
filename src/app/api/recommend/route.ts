import { NextResponse } from "next/server";
import { getClaudeRecommendation } from "../../../lib/claude";
import { bundles } from "../../../lib/hardcodedBundles";
import { CustomerAnswers } from "../../../types";

export async function POST(request: Request) {
  try {
    const { customerAnswers } = (await request.json()) as {
      customerAnswers: CustomerAnswers;
    };

    if (
      !customerAnswers?.deviceType ||
      !customerAnswers?.industry ||
      !customerAnswers?.useCase ||
      !customerAnswers?.jobTitle
    ) {
      return NextResponse.json(
        { success: false, error: "Missing customer answers." },
        { status: 400 }
      );
    }

    // TODO (Phase 2): replace `bundles` with live, filtered catalog data from /api/products (BigCommerce).
    const recommendation = await getClaudeRecommendation(customerAnswers, bundles);

    return NextResponse.json({ success: true, recommendation });
  } catch (error) {
    console.error("[Recommend Error]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
