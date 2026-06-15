import { NextResponse } from "next/server";
import { getClaudeCaseRecommendation } from "../../../lib/claude";
import { findDeviceModel } from "../../../lib/deviceTypes";
import { useCases } from "../../../lib/useCases";
import {
  getAccessoryProduct,
  getCaseOptionsForModel,
  getMountProduct,
} from "../../../lib/redzoneCatalog";
import { Bundle, CustomerAnswers, Product } from "../../../types";

export async function POST(request: Request) {
  try {
    const { customerAnswers } = (await request.json()) as {
      customerAnswers: CustomerAnswers;
    };

    if (
      !customerAnswers?.deviceType ||
      !customerAnswers?.industry ||
      !customerAnswers?.useCase ||
      !customerAnswers?.jobTitle
    ) {
      return NextResponse.json(
        { success: false, error: "Missing customer answers." },
        { status: 400 }
      );
    }

    const caseOptions = getCaseOptionsForModel(customerAnswers.deviceType);
    if (caseOptions.length === 0) {
      return NextResponse.json(
        { success: false, error: `No RedZone cases found for device "${customerAnswers.deviceType}".` },
        { status: 400 }
      );
    }

    const useCase = useCases.find((uc) => uc.id === customerAnswers.useCase);
    if (!useCase) {
      return NextResponse.json(
        { success: false, error: `Unknown use case "${customerAnswers.useCase}".` },
        { status: 400 }
      );
    }

    // TODO (Phase 2): replace caseCatalog/mountCatalog/accessoryCatalog with live, filtered
    // catalog data from /api/products (BigCommerce).
    const { caseSku, reasoning } = await getClaudeCaseRecommendation(customerAnswers, caseOptions, useCase);
    const chosenCase = caseOptions.find((c) => c.sku === caseSku) ?? caseOptions[0];

    const products: Product[] = [
      { sku: chosenCase.sku, name: chosenCase.name, image: "/placeholder-product.png", price: chosenCase.price },
    ];

    if (useCase.recommendedMount) {
      const mount = getMountProduct(useCase.recommendedMount.sku);
      if (mount) {
        products.push({ sku: mount.sku, name: mount.name, image: "/placeholder-product.png", price: mount.price });
      }
    }

    for (const accessory of useCase.recommendedAccessories) {
      const product = getAccessoryProduct(accessory.sku);
      if (product) {
        products.push({ sku: product.sku, name: product.name, image: "/placeholder-product.png", price: product.price });
      }
    }

    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
    const deviceModel = findDeviceModel(customerAnswers.deviceType);

    const bundle: Bundle = {
      id: `${customerAnswers.deviceType}-${customerAnswers.useCase}-${chosenCase.sku}`,
      name: `${deviceModel?.name ?? "iPad"} — ${useCase.title} Kit`,
      description: `${chosenCase.styleDescription} Includes ${useCase.title.toLowerCase()} mounting and accessories.`,
      products,
      totalPrice,
    };

    return NextResponse.json({ success: true, recommendation: { bundle, reasoning } });
  } catch (error) {
    console.error("[Recommend Error]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
