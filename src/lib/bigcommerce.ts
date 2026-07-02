// BigCommerce Management API v3 client
// Server-side only — never import from client components

function bcBase(): string {
  return `https://api.bigcommerce.com/stores/${process.env.BC_STORE_HASH}/v3`;
}

function bcHeaders(): Record<string, string> {
  return {
    'X-Auth-Token': process.env.BC_ACCESS_TOKEN as string,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export interface BcVariant {
  id: number;          // variant_id
  product_id: number;
  sku: string;
  price: number | null; // null = inherits from parent product
}

export interface BcProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  image_url?: string;
}

export interface BcCustomField {
  id: number;
  name: string;
  value: string;
}

export interface BcImage {
  is_thumbnail: boolean;
  url_standard: string;
}

export interface BcProductFull extends BcProduct {
  custom_fields: BcCustomField[];
}

// Picks the product's designated thumbnail image (else the first image) and
// returns a mid-sized URL suitable for small in-app thumbnails.
function extractMainImageUrl(images?: BcImage[]): string | undefined {
  if (!images || images.length === 0) return undefined;
  const main = images.find(img => img.is_thumbnail) ?? images[0];
  return main.url_standard;
}

// Returns all variants whose SKU matches any in the provided list.
export async function getVariantsBySkus(skus: string[]): Promise<BcVariant[]> {
  if (skus.length === 0) return [];
  const res = await fetch(
    `${bcBase()}/catalog/variants?sku:in=${encodeURIComponent(skus.join(','))}&limit=100`,
    { headers: bcHeaders() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BC variants lookup failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.data ?? []) as BcVariant[];
}

// Returns base products whose SKU matches any in the provided list.
export async function getProductsBySkus(skus: string[]): Promise<BcProduct[]> {
  if (skus.length === 0) return [];
  const res = await fetch(
    `${bcBase()}/catalog/products?sku:in=${encodeURIComponent(skus.join(','))}&limit=100`,
    { headers: bcHeaders() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BC products lookup failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.data ?? []) as BcProduct[];
}

// Fetches products by their numeric IDs.
export async function getProductsByIds(ids: number[]): Promise<BcProduct[]> {
  if (ids.length === 0) return [];
  const res = await fetch(
    `${bcBase()}/catalog/products?id:in=${ids.join(',')}&limit=100`,
    { headers: bcHeaders() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BC products by ID lookup failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.data ?? []) as BcProduct[];
}

// Resolves SKU → price, handling the BC pattern where variant.price is null
// when the variant inherits the parent product's price.
export async function getPricesBySkus(skus: string[]): Promise<Record<string, number>> {
  const variants = await getVariantsBySkus(skus);

  const nullPriceIds = [...new Set(
    variants.filter(v => v.price === null).map(v => v.product_id)
  )];
  const products = await getProductsByIds(nullPriceIds);
  const productPrices: Record<number, number> = {};
  for (const p of products) productPrices[p.id] = p.price;

  const prices: Record<string, number> = {};
  for (const v of variants) {
    prices[v.sku] = v.price ?? productPrices[v.product_id] ?? 0;
  }
  return prices;
}

// Fetches all visible products with custom fields, paginating automatically.
// Cached for 5 minutes — BC catalog changes don't need real-time propagation.
export async function getAllProducts(): Promise<BcProductFull[]> {
  const url = (page: number) =>
    `${bcBase()}/catalog/products?include=custom_fields,images&limit=100&page=${page}&is_visible=true`;

  const withImageUrl = (raw: BcProductFull & { images?: BcImage[] }): BcProductFull => ({
    ...raw,
    image_url: extractMainImageUrl(raw.images),
  });

  const page1Res = await fetch(url(1), {
    headers: bcHeaders(),
    next: { revalidate: 300 },
  });
  if (!page1Res.ok) {
    const text = await page1Res.text();
    throw new Error(`BC all-products fetch failed: ${page1Res.status} ${text}`);
  }
  const page1 = await page1Res.json();
  const totalPages: number = page1.meta?.pagination?.total_pages ?? 1;

  if (totalPages <= 1) return (page1.data ?? []).map(withImageUrl);

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetch(url(i + 2), { headers: bcHeaders(), next: { revalidate: 300 } })
        .then(r => r.json())
        .then(d => (d.data ?? []).map(withImageUrl))
    )
  );

  return [...(page1.data ?? []).map(withImageUrl), ...remaining.flat()];
}

// Returns the first variant ID for each of the given product IDs (parallel).
// Used to populate bcVariantId on bundle items for cart creation.
export async function getFirstVariantIds(productIds: number[]): Promise<Record<number, number>> {
  if (productIds.length === 0) return {};
  const results = await Promise.all(
    productIds.map(id =>
      fetch(`${bcBase()}/catalog/products/${id}/variants?limit=1`, {
        headers: bcHeaders(),
        next: { revalidate: 300 },
      })
        .then(r => r.json())
        .then(d => ({ productId: id, variantId: (d.data?.[0]?.id ?? null) as number | null }))
        .catch(() => ({ productId: id, variantId: null }))
    )
  );
  const out: Record<number, number> = {};
  for (const { productId, variantId } of results) {
    if (variantId !== null) out[productId] = variantId;
  }
  return out;
}
