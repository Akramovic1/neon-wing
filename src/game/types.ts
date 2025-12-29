export interface BirdConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
  wingSpan: number;
  bodyType: 'sleek' | 'heavy' | 'sharp';
}

export const BIRD_MODELS: BirdConfig[] = [
  {
    id: 'phoenix',
    name: 'NEON PHOENIX',
    primaryColor: '#9E7FFF',
    secondaryColor: '#38bdf8',
    accentColor: '#f472b6',
    description: 'Standard high-mobility interceptor.',
    wingSpan: 35,
    bodyType: 'sleek'
  },
  {
    id: 'vanguard',
    name: 'VANGUARD',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    accentColor: '#fbbf24',
    description: 'Heavy armored scout with emerald plating.',
    wingSpan: 45,
    bodyType: 'heavy'
  },
  {
    id: 'wraith',
    name: 'WRAITH',
    primaryColor: '#f43f5e',
    secondaryColor: '#fb7185',
    accentColor: '#ffffff',
    description: 'Experimental stealth unit with crimson core.',
    wingSpan: 30,
    bodyType: 'sharp'
  }
];
