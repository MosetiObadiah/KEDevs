// src/lib/constants.ts

export const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay',
  'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
  'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
].sort();

export const INDUSTRIES = [
  'Software Development',
  'Fintech',
  'E-commerce',
  'Healthtech',
  'Agritech',
  'Edtech',
  'Cybersecurity',
  'Blockchain',
  'AI & Machine Learning',
  'Cloud Computing',
  'Data Analytics',
  'IoT',
  'Gaming',
  'Telecommunications',
  'Media & Entertainment',
  'Logistics & Supply Chain',
  'Consulting',
  'Other'
].sort();

export const LAYOUT = {
  maxWidth: 'max-w-7xl',
  padding: 'px-6',
  verticalSpacing: 'py-8',
} as const;

export const SPACING = {
  section: 'space-y-8',
  cards: 'gap-6',
  cardPadding: 'p-6',
  formFields: 'space-y-4',
} as const;

export const TYPOGRAPHY = {
  pageTitle: 'text-2xl font-bold',
  sectionHeading: 'text-lg font-semibold',
  cardTitle: 'text-base font-semibold',
  body: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
} as const;
