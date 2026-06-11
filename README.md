# Product Configurator — Phase 1 Build

This is a Next.js 14+ App Router project featuring an interactive product configurator wizard. The stack is built using TypeScript and Tailwind CSS, with server-side routes configured to connect to HubSpot CRM and prepared for BigCommerce integrations.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **CRM Integration**: HubSpot CRM (Contacts & Deals)
- **Deployment Target**: Vercel

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher (we recommend using Node.js v20)
- **HubSpot Account**: (Optional for local testing if mock settings are used) A Private App Access Token with `crm.objects.contacts.write` and `crm.objects.deals.write` scopes.

### 2. Environment Variables Setup
Create a `.env.local` file in the root of the project. A template `.env.example` has been provided:

```bash
# HubSpot Credentials
HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token_here
HUBSPOT_PIPELINE_ID=your_hubspot_pipeline_id_here
HUBSPOT_DEAL_STAGE_ID=your_deal_stage_id_here

# BigCommerce Credentials (readiness for Phase 2)
BC_STORE_HASH=your_store_hash_here
BC_ACCESS_TOKEN=your_access_token_here
BC_CLIENT_ID=your_client_id_here

# Gemini API Credentials (readiness for Phase 2)
GEMINI_API_KEY=your_google_cloud_gemini_api_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Running the Development Server
Run the local dev server using Node.js v20:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Folder Layout & Architecture

```
/src
  /app
    /page.tsx                  ← Configurator entry point (wizard flow state management)
    /layout.tsx                ← Root layout importing Tailwind & Geist Sans font
    /api
      /hubspot
        /route.ts              ← HubSpot CRM contact + deal creation endpoint
      /cart
        /route.ts              ← Cart creation stub route (Phase 1 mock)
      /products
        /route.ts              ← Products API placeholder (Phase 2)
      /recommend
        /route.ts              ← Gemini recommendations placeholder (Phase 2)
  /components
    /configurator
      /StepOne.tsx             ← Step 1: Device type question (Tablet, Handheld, etc.)
      /StepTwo.tsx             ← Step 2: Industry selection (Logistics, Field Service, etc.)
      /StepThree.tsx           ← Step 3: Use case selection (Inventory, Inspections, etc.)
      /StepFour.tsx            ← Step 4: Job Title / Position capture (Operations, IT, etc.)
      /BundleDisplay.tsx       ← Custom premium glassmorphic recommended bundle dashboard
      /ConfirmationButtons.tsx ← "Contact Sales" (with input modal) & "Purchase Now" buttons
    /ui
      /LoadingSpinner.tsx      ← Sleek double-spinning loading indicator
  /lib
    /hubspot.ts                ← HubSpot API helper clients (search, create, update, associate)
    /hardcodedBundles.ts       ← Hardcoded starter bundle representation for Phase 1
    /bigcommerce.ts            ← BigCommerce client stub
    /gemini.ts                 ← Gemini API client stub
  /types
    /index.ts                  ← Shared type interfaces
.env.local                     ← Ignored by git
.env.example                   ← Committed template
```

---

## Validation & Verification

### Production Build
Verify TypeScript and next compilation by running:
```bash
npm run build
```
This builds and prerenders all pages, verifying the code compiles successfully.
