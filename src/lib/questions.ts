export interface EnvQuestion {
  key: string;
  q: string;
  hint: string;
  choices: Array<{ id: string; label: string }>;
}

export const ENV_QUESTIONS_IPHONE: EnvQuestion[] = [
  {
    key: 'carry_style',
    q: 'How do you primarily carry your iPhone at work?',
    hint: 'Determines the best carry accessory',
    choices: [
      { id: 'pocket',  label: 'In my pocket' },
      { id: 'holster', label: 'On my belt / holster' },
      { id: 'hand',    label: 'In my hand' },
      { id: 'bag',     label: 'In a bag or pack' },
    ],
  },
  {
    key: 'hands_free',
    q: 'Do you need both hands free while the phone is accessible?',
    hint: 'Drives belt clip holster recommendation',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no',  label: 'No' },
    ],
  },
  {
    key: 'active',
    q: 'Is your role physically active?',
    hint: 'Active roles benefit from a secured holster',
    choices: [
      { id: 'yes', label: 'Yes, active role' },
      { id: 'no',  label: 'No, mostly stationary' },
    ],
  },
  {
    key: 'gloves',
    q: 'Do you wear gloves while using the phone?',
    hint: 'Affects grip and screen protector recommendations',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no',  label: 'No' },
    ],
  },
  {
    key: 'sharing',
    q: 'Will this phone be shared between multiple users?',
    hint: 'Shared phones benefit from asset tag windows',
    choices: [
      { id: 'shared',   label: 'Shared device' },
      { id: 'personal', label: 'Single user' },
    ],
  },
];

export const ENV_QUESTIONS_TABLET: EnvQuestion[] = [
  {
    key: 'motion',
    q: 'Will the device be carried with you or stationed in one place?',
    hint: 'Determines whether a carry solution or fixed mount is recommended',
    choices: [
      { id: 'carried',   label: 'Carried with me' },
      { id: 'stationed', label: 'Fixed / stationed' },
      { id: 'both',      label: 'Both' },
    ],
  },
  {
    key: 'mount_surface',
    q: 'If mounted, where will it attach?',
    hint: 'Drives the specific mount type',
    choices: [
      { id: 'wall',    label: 'Wall / panel' },
      { id: 'vehicle', label: 'Vehicle / forklift' },
      { id: 'desk',    label: 'Desk / counter' },
      { id: 'pole',    label: 'Pole / arm' },
      { id: 'na',      label: 'Not mounted' },
    ],
  },
  {
    key: 'mount_rotation',
    q: 'Does the mount need to rotate or tilt?',
    hint: 'Determines fixed plate vs. articulating arm',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no',  label: 'No' },
    ],
  },
  {
    key: 'power_needed',
    q: 'Does the device need power at its mounted location?',
    hint: 'Determines whether a powered dock is included',
    choices: [
      { id: 'yes', label: 'Yes, needs power' },
      { id: 'no',  label: 'No, battery only' },
    ],
  },
  {
    key: 'location',
    q: 'Where will the device primarily be used?',
    hint: 'Indoor vs. outdoor affects mount material',
    choices: [
      { id: 'indoor',  label: 'Indoors' },
      { id: 'outdoor', label: 'Outdoors / field' },
      { id: 'both',    label: 'Both' },
    ],
  },
  {
    key: 'hands_free',
    q: 'Does the user need both hands free?',
    hint: 'Drives shoulder strap recommendation',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no',  label: 'No' },
    ],
  },
  {
    key: 'sharing',
    q: 'Will this device be shared between multiple users?',
    hint: 'Shared devices benefit from asset tag and lock compatibility',
    choices: [
      { id: 'shared',   label: 'Shared device' },
      { id: 'personal', label: 'Single user' },
    ],
  },
];
