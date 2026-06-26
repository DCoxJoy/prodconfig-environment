// GET /api/products?skus=SKU1,SKU2,SKU3
// Resolves SKUs to real BC product_id + variant_id pairs.
// Phase 2 replacement for the hardcoded SKU_TO_BC_IDS map in catalog.ts.

import { NextResponse } from 'next/server';
import { getVariantsBySkus } from '../../../lib/bigcommerce';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skusParam = searchParams.get('skus');

  if (!skusParam) {
    return NextResponse.json({ error: 'Missing skus query parameter' }, { status: 400 });
  }

  const skus = skusParam.split(',').map(s => s.trim()).filter(Boolean);

  if (skus.length === 0) {
    return NextResponse.json({ error: 'No valid SKUs provided' }, { status: 400 });
  }

  try {
    const variants = await getVariantsBySkus(skus);

    const products: Record<string, { product_id: number; variant_id: number }> = {};
    for (const v of variants) {
      products[v.sku] = { product_id: v.product_id, variant_id: v.id };
    }

    const missing = skus.filter(sku => !products[sku]);
    if (missing.length > 0) {
      console.warn('[/api/products] SKUs not found in BC catalog:', missing);
    }

    return NextResponse.json({ products, missing });
  } catch (error) {
    console.error('[/api/products error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
