// POST /api/ai-edit
// Two-pass Claude flow for AI bundle editing at the Review step.
// Pass 1: Parse user intent → structured action + constraints.
// Pass 2: Filter BC catalog → Claude selects best candidate and writes a brief reason.
// Possible outcomes:
//   matched: true  → swap the component, show reason string
//   action: 'case_change_request' → tell user to go back to Step 2
//   fallback: true → escalate to Contact Sales

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAllProducts, getFirstVariantIds, BcProductFull } from '../../../lib/bigcommerce';
import { BundleItem, FeatureId, IphoneScenarios, TabletScenarios } from '../../../types';

const client = new Anthropic();

// ── Custom field helpers (mirror of bundle route) ─────────────────────────────

type CfMap = Record<string, string | string[]>;

function parseCustomFields(fields: BcProductFull['custom_fields']): CfMap {
  const out: CfMap = {};
  for (const f of fields ?? []) {
    const existing = out[f.name];
    if (existing !== undefined) {
      out[f.name] = Array.isArray(existing) ? [...existing, f.value] : [existing, f.value];
    } else {
      out[f.name] = f.value;
    }
  }
  return out;
}

function getDeviceCompatList(cf: CfMap): string[] {
  const raw = cf.device_compatibility as string | undefined;
  if (!raw || raw.toLowerCase() === 'universal') return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function iconForProduct(name: string, productType: string): string {
  if (productType === 'Mounts') return 'layout-sidebar';
  const lower = name.toLowerCase();
  if (lower.includes('shoulder') || lower.includes('strap') || lower.includes('sling')) return 'briefcase';
  if (lower.includes('hand strap') || lower.includes('grip')) return 'hand-stop';
  if (lower.includes('screen')) return 'device-tablet';
  if (lower.includes('lock')) return 'lock';
  if (lower.includes('holster') || lower.includes('belt')) return 'briefcase';
  if (lower.includes('magsafe') || lower.includes('magnet')) return 'magnet';
  return 'tool';
}

// Strip markdown code fences if Claude wraps its JSON response
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

// ── Request / response types ──────────────────────────────────────────────────

interface AiEditRequest {
  userMessage: string;
  currentBundle: BundleItem[];
  deviceName: string;
  isIphone: boolean;
  features: FeatureId[];
  scenarios: Partial<IphoneScenarios & TabletScenarios>;
}

interface Pass1Result {
  action: 'swap' | 'case_change_request' | 'unknown';
  component: 'Mount' | 'Accessory' | null;
  constraints: {
    keywords: string[];
    price_max: number | null;
  };
}

interface Pass2Result {
  selected_index: number;
  reason: string;
  confidence: 'high' | 'low';
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: AiEditRequest = await request.json();
    const { userMessage, currentBundle, deviceName, isIphone } = body;

    // Format current bundle for Claude context — Case marked as locked
    const bundleContext = currentBundle
      .map(item =>
        `- ${item.type}: ${item.name} (SKU: ${item.sku}, $${item.unitPrice.toFixed(2)})${
          item.type === 'Case' ? ' ← LOCKED, the case cannot be changed here' : ''
        }`
      )
      .join('\n');

    const swappableComponents = isIphone
      ? 'Accessory (this is an iPhone bundle — there is no mount)'
      : 'Mount or Accessory';

    // ── Pass 1: Intent parsing ────────────────────────────────────────────────

    const pass1Response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a product recommendation assistant for Joy Factory aXtion protective cases and mounting solutions.

The user's current bundle:
${bundleContext}

The user can request changes to: ${swappableComponents}

The user says: "${userMessage}"

Respond with a JSON object ONLY — no markdown, no explanation:
{
  "action": "swap" | "case_change_request" | "unknown",
  "component": "Mount" | "Accessory" | null,
  "constraints": {
    "keywords": [],
    "price_max": null
  }
}

Rules:
- If the user wants to change, upgrade, or replace the case → action: "case_change_request", component: null
- If the user wants a different mount or accessory → action: "swap", component: "Mount" or "Accessory"
- If the request is unclear or cannot be fulfilled by swapping a mount or accessory → action: "unknown"
- keywords: 2–5 short feature terms that capture what the user is asking for (e.g. ["adhesive", "no drill"] or ["shoulder strap", "hands free"])
- price_max: a number if the user specifies a price limit, otherwise null`,
        },
      ],
    });

    const pass1Text =
      pass1Response.content[0].type === 'text' ? pass1Response.content[0].text : '';

    let pass1: Pass1Result;
    try {
      pass1 = JSON.parse(extractJson(pass1Text)) as Pass1Result;
    } catch {
      console.error('[/api/ai-edit] Pass 1 JSON parse error:', pass1Text);
      return NextResponse.json({ matched: false, fallback: true });
    }

    // ── Outcome: user wants to change the case ────────────────────────────────
    if (pass1.action === 'case_change_request') {
      return NextResponse.json({ matched: false, action: 'case_change_request' });
    }

    // ── Outcome: intent unclear — escalate ────────────────────────────────────
    if (pass1.action === 'unknown' || !pass1.component) {
      return NextResponse.json({ matched: false, fallback: true });
    }

    const component = pass1.component; // "Mount" | "Accessory"
    const productTypeFilter = component === 'Mount' ? 'Mounts' : 'Accessories';

    // ── Pass 2: Fetch and filter BC candidates ────────────────────────────────

    const allProducts = await getAllProducts();
    const products = allProducts.map(p => ({ ...p, cf: parseCustomFields(p.custom_fields) }));

    // Exclude RFQ products
    const active = products.filter(p => p.cf.product_status !== 'Request for Quote');

    // Filter by product type
    const typeFiltered = active.filter(p => p.cf.product_type === productTypeFilter);

    // Device-specific candidates take priority over universal ones
    const deviceSpecific = typeFiltered.filter(p => getDeviceCompatList(p.cf).includes(deviceName));
    const universal = typeFiltered.filter(p => getDeviceCompatList(p.cf).length === 0);
    const candidates = deviceSpecific.length > 0 ? deviceSpecific : universal;

    // Apply price ceiling if specified
    const pricedCandidates =
      pass1.constraints.price_max != null
        ? candidates.filter(p => p.price <= pass1.constraints.price_max!)
        : candidates;

    if (pricedCandidates.length === 0) {
      console.log(`[/api/ai-edit] No candidates found for component=${component}, device=${deviceName}`);
      return NextResponse.json({ matched: false, fallback: true });
    }

    const candidateList = pricedCandidates
      .map((p, i) => `${i + 1}. ${p.name} (SKU: ${p.sku}, $${p.price.toFixed(2)})`)
      .join('\n');

    const currentItem = currentBundle.find(item => item.type === component);

    // ── Pass 2: Claude selects best candidate ─────────────────────────────────

    const pass2Response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a product recommendation assistant for Joy Factory aXtion protective cases and mounting solutions.

The user wants to change their ${component.toLowerCase()} for a ${deviceName}. They said: "${userMessage}"

Current ${component.toLowerCase()}: ${currentItem?.name ?? 'none'} (${currentItem?.sku ?? 'n/a'})

Available ${productTypeFilter.toLowerCase()} compatible with the ${deviceName}:
${candidateList}

Select the best match for the user's request. Respond with a JSON object ONLY — no markdown:
{
  "selected_index": <1-based number from the list above>,
  "reason": "<one concise sentence explaining why this product best fits what the user asked for>",
  "confidence": "high" | "low"
}

Set confidence to "low" if none of the candidates are a genuinely good match for the request.`,
        },
      ],
    });

    const pass2Text =
      pass2Response.content[0].type === 'text' ? pass2Response.content[0].text : '';

    let pass2: Pass2Result;
    try {
      pass2 = JSON.parse(extractJson(pass2Text)) as Pass2Result;
    } catch {
      console.error('[/api/ai-edit] Pass 2 JSON parse error:', pass2Text);
      return NextResponse.json({ matched: false, fallback: true });
    }

    // Low confidence or bad index → escalate
    if (pass2.confidence === 'low') {
      console.log('[/api/ai-edit] Pass 2 returned low confidence — escalating');
      return NextResponse.json({ matched: false, fallback: true });
    }

    const selectedProduct = pricedCandidates[pass2.selected_index - 1];
    if (!selectedProduct) {
      console.error('[/api/ai-edit] Pass 2 selected_index out of range:', pass2.selected_index);
      return NextResponse.json({ matched: false, fallback: true });
    }

    // Fetch the variant ID for the selected product
    const variantIds = await getFirstVariantIds([selectedProduct.id]);

    const updatedItem: BundleItem = {
      type: component,
      icon: iconForProduct(selectedProduct.name, productTypeFilter),
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      unitPrice: selectedProduct.price,
      bcProductId: selectedProduct.id,
      bcVariantId: variantIds[selectedProduct.id],
      imageUrl: selectedProduct.image_url,
    };

    console.log(`[/api/ai-edit] Swapped ${component}: ${currentItem?.sku ?? 'none'} → ${selectedProduct.sku}`);

    return NextResponse.json({
      matched: true,
      action: 'swap',
      component,
      updatedItem,
      reason: pass2.reason,
    });
  } catch (error) {
    console.error('[/api/ai-edit error]:', error);
    return NextResponse.json({ matched: false, fallback: true }, { status: 500 });
  }
}
