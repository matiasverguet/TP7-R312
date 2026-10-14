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

const population = populationMain as PopulationRow[];

// Listes des valeurs possibles pour les SELECT (sans doublons)
export const listePeriode = [...new Set(population.map((d) => d.Période))].sort((a, b) => b - a);
export const listeSexe = [...new Set(population.map((d) => d.Sexe))];
export const listeAge = [...new Set(population.map((d) => d.Âge))];

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
        p["Âge"] === selectedAge,
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
