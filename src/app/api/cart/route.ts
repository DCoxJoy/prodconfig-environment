import { NextResponse } from 'next/server';
import { SKU_TO_BC_IDS } from '../../../lib/catalog';
import { CartLineItem } from '../../../types';

interface CartItem {
  sku: string;
  qty: number;
  // Live BC IDs from /api/bundle response — preferred over SKU_TO_BC_IDS lookup
  bcProductId?: number;
  bcVariantId?: number;
}

interface CartRequestBody {
  items: CartItem[];
}

export async function POST(request: Request) {
  try {
    const body: CartRequestBody = await request.json();
    const { items } = body;

    const lineItems: CartLineItem[] = [];

    for (const item of items) {
      if (item.qty <= 0) continue;

      // Prefer live BC IDs from bundle fetch when present
      if (item.bcProductId && item.bcVariantId) {
        lineItems.push({
          quantity: item.qty,
          product_id: item.bcProductId,
          variant_id: item.bcVariantId,
        });
        continue;
      }

      // Fall back to SKU_TO_BC_IDS map for AI-swapped items and catalog fallback
      const ids = SKU_TO_BC_IDS[item.sku];
      if (!ids || ids.product_id === 0) {
        console.warn(`[Cart] SKU not in BC catalog, skipping: ${item.sku}`);
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

    const storeHash = process.env.BC_STORE_HASH;
    const accessToken = process.env.BC_ACCESS_TOKEN;

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
    const cartId = data?.data?.id;

    // Cart creation doesn't return redirect_urls — a separate call is required
    // to get the tokenized checkout URL tied to this specific cart.
    const redirectRes = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartId}/redirect_urls`,
      {
        method: 'POST',
        headers: {
          'X-Auth-Token': accessToken as string,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!redirectRes.ok) {
      const text = await redirectRes.text();
      throw new Error(`BigCommerce redirect URL creation failed: ${redirectRes.status} ${text}`);
    }

    const redirectData = await redirectRes.json();
    const checkoutUrl = redirectData?.data?.checkout_url;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('[Cart route error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
