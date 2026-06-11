import { NextResponse } from "next/server";
import { createOrUpdateHubSpotContact, createHubSpotDeal } from "../../../lib/hubspot";
import { HubSpotDealPayload } from "../../../types";

export async function POST(request: Request) {
  try {
    const payload: HubSpotDealPayload = await request.json();
    
    const { contactInfo, customerAnswers, selectedBundle, path } = payload;
    
    // Validation
    if (!contactInfo || !contactInfo.email || !contactInfo.firstName || !contactInfo.lastName || !contactInfo.company) {
      return NextResponse.json(
        { success: false, error: "Missing required contact information fields (email, firstName, lastName, company)" },
        { status: 400 }
      );
    }

    if (!customerAnswers || !selectedBundle || !path) {
      return NextResponse.json(
        { success: false, error: "Missing configuration answers, selected bundle, or path type" },
        { status: 400 }
      );
    }

    console.log(`[API HubSpot] Request received for: ${contactInfo.email}. Action path: ${path}`);

    // Step 1: Create or update contact
    const contactId = await createOrUpdateHubSpotContact(
      contactInfo.email,
      contactInfo.firstName,
      contactInfo.lastName,
      contactInfo.company
    );

    // Step 2: Create deal associated with contact
    const dealId = await createHubSpotDeal(contactId, payload);

    console.log(`[API HubSpot] Successfully synced contact (${contactId}) and deal (${dealId}) to HubSpot.`);

    return NextResponse.json({
      success: true,
      contactId,
      dealId,
    });
  } catch (error: any) {
    console.error("[API HubSpot Exception]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while syncing with HubSpot",
      },
      { status: 500 }
    );
  }
}
