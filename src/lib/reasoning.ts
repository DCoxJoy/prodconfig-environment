import { DeviceFamily, FeatureId, IphoneScenarios, TabletScenarios, BundleItem, AppliedEdit } from '../types';

const FEAT_LABELS: Record<FeatureId, string> = {
  ip_rating:          'IP68 waterproof protection',
  mil_rating:         'MIL-STD-810H drop rating',
  screen_protector:   'integrated screen protection',
  reinforced_corners: 'reinforced corner cushioning',
  chemical_resistant: 'chemical resistance',
  thermo_defend:      'ThermoDefend thermal insulation',
  vesa_compatible:    'VESA mount compatibility',
  magconnect:         'MagConnect quick-attach capability',
  magsafe:            'MagSafe pass-through charging',
  shoulder_strap:     'shoulder strap anchors',
  hand_strap:         'an adjustable hand strap',
  kick_stand:         'a built-in kickstand',
  pencil_holder:      'a pencil holder slot',
  asset_tag:          'an asset tag window',
  kensington_lock:    'a Kensington lock point',
};

export function buildReasoningParagraph(
  deviceName: string,
  deviceFamily: DeviceFamily,
  features: FeatureId[],
  scenarios: Partial<IphoneScenarios & TabletScenarios>,
  products: BundleItem[],
  appliedEdits: AppliedEdit[]
): string {
  const caseName = products[0]?.name ?? 'the case';
  const sentences: string[] = [];

  if (deviceFamily === 'iphone') {
    sentences.push(`The ${caseName} is precision-fit for the ${deviceName}, maintaining full button, port, and MagSafe access throughout the work day.`);
  } else if (deviceFamily === 'surface') {
    sentences.push(`The ${caseName} is engineered specifically for the ${deviceName}, preserving keyboard connector access and Surface Pen compatibility.`);
  } else {
    sentences.push(`The ${caseName} is precision-built for the ${deviceName}, preserving full Apple Pencil and Smart Connector access.`);
  }

  const fp = features.map(f => FEAT_LABELS[f]).filter(Boolean);
  if (fp.length === 1) {
    sentences.push(`You selected ${fp[0]} as a priority, and every item in this bundle is spec'd to deliver that.`);
  } else if (fp.length > 1) {
    sentences.push(`Based on your selections, this bundle delivers ${fp.slice(0, -1).join(', ')}, and ${fp[fp.length - 1]}.`);
  }

  const sc = scenarios;

  if (deviceFamily === 'iphone') {
    if (sc.carry_style === 'holster' || sc.hands_free === 'yes' || sc.active === 'yes') {
      sentences.push('Because your role is active and you need both hands free, the Belt Clip Holster (CPX302) keeps the phone securely on your belt and instantly accessible.');
    } else if (sc.carry_style === 'pocket' || sc.carry_style === 'bag') {
      sentences.push('For everyday pocket or bag carry, the bundle focuses on protection and screen integrity over an external holster.');
    }
    if (sc.gloves === 'yes') {
      sentences.push('Glove-compatible button sizing and touch sensitivity are factored in throughout.');
    }
    if (sc.sharing === 'shared') {
      sentences.push('The MIL-rated case is selected to handle the wear of daily shift handoffs between multiple users.');
    }
  } else {
    if (sc.motion === 'stationed' || sc.motion === 'both') {
      let mt = 'wall or counter mount';
      if (sc.mount_surface === 'vehicle') mt = 'vehicle or forklift mount';
      else if (sc.mount_surface === 'wall') mt = 'VESA wall plate';
      else if (sc.mount_surface === 'desk') mt = 'counter or desk mount';
      else if (sc.mount_surface === 'pole') mt = 'pole or articulating arm mount';
      sentences.push(`Because the device is stationed, the bundle includes a ${mt} chosen for your installation surface.`);
    }
    if (sc.mount_rotation === 'yes') {
      sentences.push('An articulating mount is recommended over a fixed plate so the screen angle can be adjusted.');
    }
    if (sc.power_needed === 'yes') {
      sentences.push('Cable management is built into the mount selection because the device needs active charging at its mounted position.');
    }
    if (sc.location === 'outdoor' || sc.location === 'both') {
      sentences.push('Outdoor-rated hardware is specified throughout to handle UV exposure, temperature variation, and moisture.');
    }
    if (sc.hands_free === 'yes' || sc.motion === 'carried' || sc.motion === 'both') {
      sentences.push('A shoulder strap is included so both hands stay free whether the device is mounted or being carried between locations.');
    }
    if (sc.sharing === 'shared') {
      sentences.push('Asset tag visibility and Kensington lock compatibility are prioritized because this device will be shared across shifts.');
    }
  }

  const lastEdit = appliedEdits.filter(e => e.matched).pop();
  if (lastEdit) {
    sentences.push(`Your requested adjustment ("“${lastEdit.text}”") has been applied: ${lastEdit.detail}.`);
  }

  return sentences.join(' ');
}
