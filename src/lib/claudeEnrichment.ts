// Server-side only — called from API routes, never from client components
import Anthropic from '@anthropic-ai/sdk';
import { ProductEnrichment, runtimeEnrichmentCache } from './enrichment';

export interface ProductForEnrichment {
  sku: string;
  name: string;
  product_type: string; // 'Cases' | 'Mounts' | 'Accessories'
  series?: string;      // existing BC custom field value if present
  certifications?: string;
}

type InferredItem = { sku: string } & ProductEnrichment;

export async function inferEnrichmentBatch(
  products: ProductForEnrichment[]
): Promise<Record<string, ProductEnrichment>> {
  if (products.length === 0) return {};

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are enriching a B2B device accessory product catalog for a guided product configurator.

For each product, output one JSON object. Respond with a JSON array ONLY — no markdown, no explanation.

Fields:
- sku: copy from input (required)
- mount_surface: Mounts only — which surface/scenario does this mount serve?
  Options: "wall" | "vehicle" | "desk" | "pole" | "na" | null
  Guidance: on-wall/counter/kiosk → "wall"; seat/c-clamp/wheelchair/forklift → "vehicle"; desk stand/tabletop → "desk"; tripod/pole/mic stand → "pole"; universal plate with no surface → "na"; null for non-mounts
- features: Cases and Accessories only — which user needs does this address? (array, may be empty)
  Options: "shoulder_strap" | "hand_strap" | "screen_protector" | "kensington_lock" | "magsafe"
  Guidance: shoulder/carrying strap → shoulder_strap; hand grip strap → hand_strap; screen glass protector → screen_protector; cable lock slot → kensington_lock; MagSafe compatible → magsafe
- series: Cases only — product line tier
  Options: "Extreme" | "Bold" | "Slim" | "Edge" | "Standard" | null
- bundle_priority: Cases only — integer ranking; 1 = most rugged/full-featured (show as Option 1), 2 = slim/everyday. Null for non-cases.

Products:
${JSON.stringify(products, null, 2)}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('[claudeEnrichment] No JSON array found in Claude response');
    return {};
  }

  let results: InferredItem[] = [];
  try {
    results = JSON.parse(jsonMatch[0]);
  } catch {
    console.error('[claudeEnrichment] Failed to parse Claude response:', text.slice(0, 300));
    return {};
  }

  const out: Record<string, ProductEnrichment> = {};
  for (const r of results) {
    const { sku, ...rest } = r;
    if (!sku) continue;
    const clean: ProductEnrichment = {};
    if (rest.mount_surface) clean.mount_surface = rest.mount_surface;
    if (Array.isArray(rest.features) && rest.features.length > 0) clean.features = rest.features;
    if (rest.series) clean.series = rest.series;
    if (typeof rest.bundle_priority === 'number') clean.bundle_priority = rest.bundle_priority;
    out[sku] = clean;
    runtimeEnrichmentCache.set(sku, clean);
  }

  console.log(`[claudeEnrichment] Inferred enrichment for ${Object.keys(out).length}/${products.length} SKUs`);
  return out;
}
