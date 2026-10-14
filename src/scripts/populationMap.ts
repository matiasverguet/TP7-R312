import * as Plot from "@observablehq/plot";
import departements from "../assets/departements.geojson.json";
import populationMain from "../assets/populationMain.json";

export interface PopulationRow {
  Géographie: string;
  Sexe: string;
  Âge: string;
  Période: number;
  Valeur: number;
}

// Nettoie les données : certains libellés INSEE ont des espaces en trop ("De 15 à 24 ans "),
// or le navigateur supprime ces espaces dans la valeur d'un <option> → aucune correspondance.
const population: PopulationRow[] = (populationMain as any[]).map((d) => ({
  Géographie: String(d["Géographie"]).trim(),
  Sexe: String(d.Sexe).trim(),
  Âge: String(d["Âge"]).trim(),
  Période: Number(d["Période"]),
  Valeur: Number(d.Valeur),
}));

// Ordre logique des tranches d'âge (les valeurs inconnues sont placées à la fin)
const ordreAge = [
  "Total",
  "Moins de 15 ans",
  "Moins de 20 ans",
  "De 15 à 24 ans",
  "15 ans ou plus",
  "De 25 à 39 ans",
  "De 40 à 54 ans",
  "De 55 à 64 ans",
  "65 ans ou plus",
  "De 65 à 79 ans",
  "80 ans ou plus",
];
const rangAge = (a: string) => (ordreAge.includes(a) ? ordreAge.indexOf(a) : ordreAge.length);

// Listes des valeurs possibles pour les SELECT (sans doublons)
export const listePeriode = [...new Set(population.map((d) => d.Période))].sort((a, b) => b - a);
export const listeSexe = [...new Set(population.map((d) => d.Sexe))];
export const listeAge = [...new Set(population.map((d) => d.Âge))].sort((a, b) => rangAge(a) - rangAge(b));

// Indique si une combinaison année/sexe/âge existe dans les données
// (ex. 2010 et 2015 n'ont que Sexe = "Total")
export function hasPopulationData(selectedYear: number, selectedSex: string, selectedAge: string) {
  return population.some(
    (p) => p.Période === selectedYear && p.Sexe === selectedSex && p.Âge === selectedAge,
  );
}

// Options Plot de la carte, utilisables côté serveur (PlotFigure) comme côté client
export function populationMapOptions(
  selectedYear: number,
  selectedSex: string,
  selectedAge: string,
): Plot.PlotOptions {
  // Trouve la ligne de population d'un département pour les filtres choisis
  const findPopulation = (deptName: string) =>
    population.find(
      (p) =>
        p.Géographie === deptName &&
        p.Période === selectedYear &&
        p.Sexe === selectedSex &&
        p.Âge === selectedAge,
    );

  return {
    // Accessibilité : Plot construit un <figure> avec <h2>, <h3> et <figcaption>
    title: `Population par département en ${selectedYear}`,
    subtitle: `Sexe : ${selectedSex} — Âge : ${selectedAge}`,
    caption: "Source : INSEE, recensement de la population. Survolez un département pour voir sa valeur.",
    ariaLabel: `Carte choroplèthe de la population des départements français en ${selectedYear}`,
    ariaDescription: "Plus le vert est foncé, plus le département est peuplé.",
    projection: {
      type: "mercator", // projection adaptée à la France métropolitaine
      domain: departements as any, // centre la carte sur les départements
    },
    color: {
      type: "quantile",
      n: 8,
      scheme: "Greens",
      label: "Population en centaine de milliers",
      legend: true,
      transform: (d: number) => Math.round(d / 100000),
    },
    marks: [
      Plot.geo(departements as any, {
        fill: (d: any) => findPopulation(d.properties.nom)?.Valeur,
        stroke: "#999",
        title: (d: any) => {
          const deptName = d.properties.nom;
          const valeur = findPopulation(deptName)?.Valeur;
          return `${deptName} : ${valeur?.toLocaleString("fr-FR") ?? "pas de donnée"}`;
        },
        tip: true,
      }),
    ],
  };
}
