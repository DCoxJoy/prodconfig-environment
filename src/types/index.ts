export interface Product {
  sku: string;
  name: string;
  image: string;
  price: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  products: Product[];
  totalPrice: number;
  /** Categories this bundle is tagged with in the catalog (device type, industry, use case). */
  tags?: string[];
}

export interface BundleRecommendation {
  bundle: Bundle;
  reasoning: string;
}

export interface CustomerAnswers {
  deviceType: string;
  industry: string;
  useCase: string;
  jobTitle: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export type SalesPath = "contact_sales" | "purchase_now";

export interface HubSpotDealPayload {
  customerAnswers: CustomerAnswers;
  selectedBundle: {
    id: string;
    name: string;
    totalPrice: number;
  };
  path: SalesPath;
  contactInfo: ContactInfo;
}
