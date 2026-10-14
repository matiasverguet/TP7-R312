export const speciesColors = {
  Adelie: '#4169c9',
  Chinstrap: '#f0b313',
  Gentoo: '#ff6258',
} as const;

export const speciesColorDomain = ['Adelie', 'Chinstrap', 'Gentoo'] as const;

export const speciesColorRange = speciesColorDomain.map(
  (species) => speciesColors[species],
);