import { NextResponse } from 'next/server';
import { SKU_TO_BC_IDS } from '../../../lib/catalog';
import { CartLineItem } from '../../../types';

interface CartRequestBody {
  items: Array<{ sku: string; qty: number }>;
}

export async function POST(request: Request) {
  try {
    const body: CartRequestBody = await request.json();
    const { items } = body;

    const lineItems: CartLineItem[] = [];

    for (const item of items) {
      if (item.qty <= 0) continue;
      const ids = SKU_TO_BC_IDS[item.sku];
      if (!ids) {
        console.warn(`[Cart] SKU not found in map: ${item.sku}`);
        continue;
      }
      lineItems.push({
        quantity: item.qty,
        product_id: ids.product_id,
        variant_id: ids.variant_id,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items to add to cart' }, { status: 400 });
    }

    const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
    const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    const res = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/carts`,
      {
        method: 'POST',
        headers: {
          'X-Auth-Token': accessToken as string,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          line_items: lineItems.map(item => ({
            quantity: item.quantity,
            product_id: item.product_id,
            variant_id: item.variant_id,
          })),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`BigCommerce cart creation failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // TODO Phase 2: use live redirect_urls.checkout_url from BC response
    const checkoutUrl = data?.data?.redirect_urls?.checkout_url
      ?? `https://store-${storeHash}.mybigcommerce.com/checkout`;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('[Cart route error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
