import { NextResponse } from 'next/server';

const HS_PORTAL_ID = '20662622';
const HS_FORM_ID   = 'ba721aec-670d-456f-b004-c8434e9e3170';

export async function POST(request: Request) {
  try {
    const { firstname, lastname, email, company, industry, phone, message } = await request.json();

    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HS_PORTAL_ID}/${HS_FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { name: 'firstname', value: firstname ?? '' },
            { name: 'lastname',  value: lastname  ?? '' },
            { name: 'email',     value: email     ?? '' },
            { name: 'company',   value: company   ?? '' },
            { name: 'industry',  value: industry  ?? '' },
            { name: 'phone',     value: phone     ?? '' },
            { name: 'message',   value: message   ?? '' },
          ],
          context: {
            pageUri:  'https://configurator.joyfactory.com',
            pageName: 'Joy Factory aXtion Configurator',
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('[/api/contact] HubSpot error:', res.status, text);
      return NextResponse.json({ success: false, error: text }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/contact] error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
