import { NextResponse } from 'next/server';
import { HubSpotPayload } from '../../../types';

const HS_BASE = 'https://api.hubapi.com';

async function hsPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${HS_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  try {
    const payload: HubSpotPayload = await request.json();
    const { path, device, bundle, bundle_total, ai_edits, contact } = payload;

    // Resolve contact ID — search by email first to avoid creating duplicates.
    // When the HubSpot form has already submitted, the contact exists and we
    // just need the ID to associate the deal. If not found, create it.
    let contactId: string | undefined;
    if (contact?.email) {
      try {
        const searchRes = await hsPost('/crm/v3/objects/contacts/search', {
          filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: contact.email }] }],
          limit: 1,
          properties: ['id'],
        });
        if (searchRes.results?.length > 0) {
          contactId = searchRes.results[0].id as string;
        }
      } catch {
        // Search failed — fall through to creation attempt
      }

      if (!contactId && contact.first_name) {
        // Contact not in HubSpot yet (standalone CRM path, not via form embed)
        const contactRes = await hsPost('/crm/v3/objects/contacts', {
          properties: {
            firstname: contact.first_name,
            lastname:  contact.last_name,
            email:     contact.email,
            company:   contact.company,
          },
        });
        contactId = contactRes.id as string;
      }
    }

    // Deal name based on path
    const dealNameMap: Record<string, string> = {
      certified_case_inquiry:     `Certified Case Inquiry — ${device}`,
      contact_sales_from_bundle:  `Bundle Inquiry — ${device}`,
      purchase_now:               `Purchase — ${device}`,
    };

    const bundleSkus = bundle.map(item => item.sku).join(', ');

    const dealRes = await hsPost('/crm/v3/objects/deals', {
      properties: {
        dealname:           dealNameMap[path] ?? `Joy Factory Inquiry — ${device}`,
        pipeline:           'default',
        dealstage:          'appointmentscheduled',
        device_model:       device,
        bundle_skus:        bundleSkus,
        bundle_total:       String(bundle_total),
        certified_inquiry:  String(path === 'certified_case_inquiry'),
        ai_edits_requested: ai_edits.join(' | ') || 'none',
        amount:             String(bundle_total),
      },
    });
    const dealId = dealRes.id as string;

    // Associate contact ↔ deal
    if (contactId && dealId) {
      await fetch(
        `${HS_BASE}/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}/labels`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]),
        }
      );
    }

    return NextResponse.json({ success: true, dealId });
  } catch (error) {
    console.error('[HubSpot route error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
