// POST /api/admin/enrich
// One-shot endpoint: fetches all BC products, runs Claude inference on each,
// returns TypeScript ready to paste into PRODUCT_ENRICHMENT in src/lib/enrichment.ts
// Run this once when the catalog is set up, then re-run when new SKUs are added.

import { NextResponse } from 'next/server';
import { getAllProducts, BcProductFull } from '../../../../lib/bigcommerce';
import { inferEnrichmentBatch, ProductForEnrichment } from '../../../../lib/claudeEnrichment';
import { ProductEnrichment } from '../../../../lib/enrichment';

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

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function formatAsTypescript(enrichment: Record<string, ProductEnrichment>): string {
  const lines = Object.entries(enrichment).map(([sku, e]) => {
    const parts: string[] = [];
    if (e.mount_surface) parts.push(`mount_surface: '${e.mount_surface}'`);
    if (e.features?.length) parts.push(`features: [${e.features.map(f => `'${f}'`).join(', ')}]`);
    if (e.series) parts.push(`series: '${e.series}'`);
    if (e.bundle_priority !== undefined) parts.push(`bundle_priority: ${e.bundle_priority}`);
    if (parts.length === 0) return null; // nothing meaningful inferred
    return `  '${sku}': { ${parts.join(', ')} },`;
  }).filter(Boolean);

  return [
    `// Paste into PRODUCT_ENRICHMENT in src/lib/enrichment.ts`,
    `// Generated: ${new Date().toISOString()}`,
    `{`,
    ...lines,
    `}`,
  ].join('\n');
}

export async function POST() {
  try {
    const allProducts = await getAllProducts();

    const enrichable: ProductForEnrichment[] = allProducts
      .map(p => {
        const cf = parseCustomFields(p.custom_fields);
        const product_type = cf.product_type as string | undefined;
        if (!product_type || !['Cases', 'Mounts', 'Accessories'].includes(product_type)) return null;
        return {
          sku: p.sku,
          name: p.name,
          product_type,
          series: cf.series as string | undefined,
          certifications: cf.certifications as string | undefined,
        };
      })
      .filter(Boolean) as ProductForEnrichment[];

    console.log(`[/api/admin/enrich] ${enrichable.length} products to enrich (${allProducts.length} total in BC)`);

    // Claude processes 20 products per call — stays comfortably within token limits
    const batches = chunkArray(enrichable, 20);
    const allInferred: Record<string, ProductEnrichment> = {};

    for (let i = 0; i < batches.length; i++) {
      console.log(`[/api/admin/enrich] Batch ${i + 1}/${batches.length}...`);
      const inferred = await inferEnrichmentBatch(batches[i]);
      Object.assign(allInferred, inferred);
    }

    const typescript = formatAsTypescript(allInferred);

    console.log(`[/api/admin/enrich] Done — enriched ${Object.keys(allInferred).length} SKUs`);

    return NextResponse.json({
      count: Object.keys(allInferred).length,
      typescript,          // paste this into enrichment.ts
      enrichment: allInferred, // structured JSON if you prefer to process programmatically
    });
  } catch (error) {
    console.error('[/api/admin/enrich error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
