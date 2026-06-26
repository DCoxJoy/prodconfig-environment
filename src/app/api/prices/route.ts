// GET /api/prices?skus=SKU1,SKU2,SKU3
// Returns live prices from BC catalog.
// Uses SKU_TO_BC_IDS to look up product IDs directly — avoids unreliable sku:in variant filtering.

import { NextResponse } from 'next/server';
import { getProductsByIds } from '../../../lib/bigcommerce';
import { SKU_TO_BC_IDS } from '../../../lib/catalog';

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
    // Map SKUs → product IDs using the catalog's verified BC ID map
    const skuToProductId: Record<string, number> = {};
    const productIds: number[] = [];
    for (const sku of skus) {
      const ids = SKU_TO_BC_IDS[sku];
      if (ids && ids.product_id > 0) {
        skuToProductId[sku] = ids.product_id;
        if (!productIds.includes(ids.product_id)) productIds.push(ids.product_id);
      }
    }

    if (productIds.length === 0) {
      console.warn('[/api/prices] No known BC product IDs for skus:', skus);
      return NextResponse.json({ prices: {} });
    }

    // Single BC API call: fetch products by ID (reliable — id:in is well-supported)
    const products = await getProductsByIds(productIds);
    console.log(`[/api/prices] BC returned ${products.length} products for IDs:`, productIds);

    const productPriceMap: Record<number, number> = {};
    for (const p of products) productPriceMap[p.id] = p.price;

    const prices: Record<string, number> = {};
    for (const sku of skus) {
      const pid = skuToProductId[sku];
      if (pid !== undefined && productPriceMap[pid] !== undefined) {
        prices[sku] = productPriceMap[pid];
      }
    }

    console.log('[/api/prices] resolved prices:', prices);
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('[/api/prices error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
