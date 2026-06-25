import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { DeviceFamily, FeatureId, IphoneScenarios, TabletScenarios, BundleItem, AppliedEdit } from '../../../types';
import { buildReasoningParagraph } from '../../../lib/reasoning';

interface ClaudeRequestBody {
  deviceName: string;
  deviceFamily: DeviceFamily;
  features: FeatureId[];
  scenarios: Partial<IphoneScenarios & TabletScenarios>;
  bundle: Array<{ type: string; name: string; sku: string; qty: number }>;
  appliedEdits: AppliedEdit[];
}

export async function POST(request: Request) {
  try {
    const body: ClaudeRequestBody = await request.json();
    const { deviceName, deviceFamily, features, scenarios, bundle, appliedEdits } = body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const featureList = features.length
      ? `Selected features: ${features.join(', ')}`
      : 'No specific features selected.';

    const scenarioList = Object.entries(scenarios)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'No environment answers.';

    const bundleList = bundle
      .map(item => `- ${item.type}: ${item.name} (${item.sku}) ×${item.qty}`)
      .join('\n');

    const editsList = appliedEdits.filter(e => e.matched)
      .map(e => `"${e.text}" → ${e.detail}`)
      .join(', ');

    const prompt = `You are writing a product recommendation explanation for a B2B configurator tool for The Joy Factory, which makes rugged cases and mounts for tablets and smartphones.

Device: ${deviceName} (${deviceFamily})
${featureList}
Environment answers: ${scenarioList}
Bundle:
${bundleList}
${editsList ? `Applied customizations: ${editsList}` : ''}

Write 3–5 sentences in second person ("Your bundle...") explaining why this bundle fits the user's needs. Use plain prose — no bullet points, no markdown, no headers. Be specific about the device, environment answers, and bundle items. Make it feel like a confident recommendation, not a generic description.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    const paragraph = textBlock?.type === 'text' ? textBlock.text.trim() : null;

    if (!paragraph) throw new Error('No text in Claude response');

    return NextResponse.json({ paragraph });
  } catch (error) {
    console.error('[Claude route error]:', error);

    // Fallback to deterministic paragraph
    try {
      const body: ClaudeRequestBody = await request.clone().json();
      const fakeProducts: BundleItem[] = body.bundle.map(item => ({
        type: item.type as BundleItem['type'],
        icon: 'shield',
        name: item.name,
        sku: item.sku,
        unitPrice: 0,
      }));
      const paragraph = buildReasoningParagraph(
        body.deviceName,
        body.deviceFamily,
        body.features,
        body.scenarios,
        fakeProducts,
        body.appliedEdits
      );
      return NextResponse.json({ paragraph });
    } catch {
      return NextResponse.json(
        { error: 'Claude unavailable', paragraph: null },
        { status: 500 }
      );
    }
  }
}
