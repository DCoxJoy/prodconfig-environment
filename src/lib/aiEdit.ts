// Superseded by Phase 2 Step 4 — /api/ai-edit handles all AI edit logic server-side.
// This file is retained for reference only and is no longer imported.

import { BundleItem } from '../types';
import { SWAP_CATALOG_IPHONE, SWAP_CATALOG_TABLET } from './catalog';

export interface EditResult {
  matched: boolean;
  detail?: string;
  updatedProducts?: BundleItem[];
  updatedQtys?: number[];
}

export function interpretEditRequest(
  text: string,
  products: BundleItem[],
  qtys: number[],
  isIphone: boolean
): EditResult {
  const lower = text.toLowerCase();
  const catalog = isIphone ? SWAP_CATALOG_IPHONE : SWAP_CATALOG_TABLET;
  let targetType: string | null = null;

  if (isIphone) {
    if (
      lower.includes('holster') || lower.includes('belt') || lower.includes('clip') ||
      lower.includes('shoulder') || lower.includes('strap') || lower.includes('sling') ||
      lower.includes('screen') || lower.includes('protector') || lower.includes('glass')
    ) {
      targetType = 'Accessory';
    } else if (
      lower.includes('case') || lower.includes('extreme') ||
      lower.includes('rugged') || lower.includes('edge')
    ) {
      targetType = 'Case';
    }
  } else {
    if (
      lower.includes('mount') || lower.includes('vesa') || lower.includes('vehicle') ||
      lower.includes('forklift') || lower.includes('wall arm') || lower.includes('counter') ||
      lower.includes('kiosk')
    ) {
      targetType = 'Mount';
    } else if (
      lower.includes('case') || lower.includes('slim') ||
      lower.includes('bold') || lower.includes('extreme')
    ) {
      targetType = 'Case';
    } else if (
      lower.includes('shoulder') || lower.includes('strap') ||
      lower.includes('screen') || lower.includes('protector') || lower.includes('hand strap')
    ) {
      targetType = 'Accessory';
    }
  }

  if (!targetType) return { matched: false };

  const prodIdx = products.findIndex(p => p.type === targetType);
  if (prodIdx === -1) return { matched: false };

  // Check for explicit quantity change
  const qtyMatch = lower.match(/\b(\d{1,3})\b/);
  const hasQtyLang = /(need|qty|quantity|x\s*\d|of the|units?)/.test(lower);
  if (qtyMatch && hasQtyLang) {
    const nq = parseInt(qtyMatch[1], 10);
    if (nq >= 0 && nq < 100) {
      const updatedQtys = [...qtys];
      updatedQtys[prodIdx] = nq;
      return {
        matched: true,
        detail: `Quantity for ${products[prodIdx].name} updated to ${nq}`,
        updatedProducts: [...products],
        updatedQtys,
      };
    }
  }

  // Find best matching SKU from swap catalog
  const candidates = catalog[targetType] ?? [];
  let best = null;
  let bestScore = 0;

  for (const cand of candidates) {
    let score = 0;
    for (const kw of cand.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }

  if (best && best.sku !== products[prodIdx].sku) {
    const updatedProducts = products.map((p, i) =>
      i === prodIdx
        // Clear BC IDs — swapped product is from the keyword catalog, not a live BC fetch
        ? { ...p, name: best!.name, sku: best!.sku, unitPrice: best!.unitPrice, bcProductId: undefined, bcVariantId: undefined }
        : p
    );
    const updatedQtys = qtys.map((q, i) => (i === prodIdx ? 1 : q));
    return {
      matched: true,
      detail: `${targetType} updated to ${best.name} (${best.sku})`,
      updatedProducts,
      updatedQtys,
    };
  } else if (best) {
    return {
      matched: true,
      detail: `Your bundle already includes ${best.name}`,
      updatedProducts: [...products],
      updatedQtys: [...qtys],
    };
  }

  return { matched: false };
}
