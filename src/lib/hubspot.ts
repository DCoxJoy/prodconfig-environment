// HubSpot CRM API Integration Helper

import { HubSpotDealPayload } from "../types";

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects";

function getHeaders() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || token === "your_hubspot_private_app_token_here") {
    throw new Error("Missing or invalid HUBSPOT_ACCESS_TOKEN in environment variables.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Search for an existing contact by email address.
 * Returns contact ID if found, otherwise null.
 */
async function searchContactByEmail(email: string): Promise<string | null> {
  const url = `${HUBSPOT_API_URL}/contacts/search`;
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[HubSpot Search Error] Status: ${response.status}. Response: ${errText}`);
    throw new Error(`Failed to search contact: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.total > 0 && data.results && data.results.length > 0) {
    return data.results[0].id;
  }
  return null;
}

/**
 * Creates a new contact in HubSpot CRM.
 */
async function createContact(email: string, firstName: string, lastName: string, company: string): Promise<string> {
  const url = `${HUBSPOT_API_URL}/contacts`;
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      properties: {
        email,
        firstname: firstName,
        lastname: lastName,
        company,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[HubSpot Create Contact Error] Status: ${response.status}. Response: ${errText}`);
    throw new Error(`Failed to create contact: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Updates an existing contact in HubSpot CRM.
 */
async function updateContact(contactId: string, firstName: string, lastName: string, company: string): Promise<void> {
  const url = `${HUBSPOT_API_URL}/contacts/${contactId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({
      properties: {
        firstname: firstName,
        lastname: lastName,
        company,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[HubSpot Update Contact Error] Status: ${response.status}. Response: ${errText}`);
    throw new Error(`Failed to update contact: ${response.statusText}`);
  }
}

/**
 * Main entry point to create or update a contact in HubSpot.
 */
export async function createOrUpdateHubSpotContact(
  email: string,
  firstName: string,
  lastName: string,
  company: string
): Promise<string> {
  try {
    const existingId = await searchContactByEmail(email);
    if (existingId) {
      console.log(`[HubSpot] Contact found with ID: ${existingId}. Updating...`);
      await updateContact(existingId, firstName, lastName, company);
      return existingId;
    } else {
      console.log(`[HubSpot] Contact not found. Creating new contact...`);
      return await createContact(email, firstName, lastName, company);
    }
  } catch (error) {
    console.error("[HubSpot createOrUpdateHubSpotContact Exception]:", error);
    throw error;
  }
}

/**
 * Creates a HubSpot deal representing the selected bundle,
 * associated with the customer's contact record.
 */
export async function createHubSpotDeal(contactId: string, payload: HubSpotDealPayload): Promise<string> {
  const url = `${HUBSPOT_API_URL}/deals`;

  // Get environment variables or fallbacks
  const pipeline = process.env.HUBSPOT_PIPELINE_ID || "default";
  const dealstage = process.env.HUBSPOT_DEAL_STAGE_ID || "appointmentscheduled";

  // Build a friendly text description of the configuration answers
  const description = `
=== ENTERPRISE PRODUCT CONFIGURATOR SELECTION ===
Path Chosen: ${payload.path === "contact_sales" ? "Contact Sales" : "Purchase Now"}

Customer Questionnaire Answers:
- Device Type: ${payload.customerAnswers.deviceType}
- Industry: ${payload.customerAnswers.industry}
- Primary Use Case: ${payload.customerAnswers.useCase}
- Job Title: ${payload.customerAnswers.jobTitle}

Selected Configuration Bundle:
- Bundle ID: ${payload.selectedBundle.id}
- Bundle Name: ${payload.selectedBundle.name}
- Total Pricing: $${payload.selectedBundle.totalPrice.toFixed(2)}
==================================================
  `.trim();

  const body = {
    properties: {
      dealname: payload.selectedBundle.name,
      amount: payload.selectedBundle.totalPrice.toString(),
      pipeline,
      dealstage,
      // Attempt to set custom property "sales_path"
      sales_path: payload.path,
      description,
    },
    associations: [
      {
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3, // Deal to contact standard association ID
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[HubSpot Create Deal Error] Status: ${response.status}. Response: ${errText}`);
    throw new Error(`Failed to create deal: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}
