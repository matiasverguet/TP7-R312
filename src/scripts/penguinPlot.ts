import * as Plot from '@observablehq/plot';

export interface PenguinObservation {
  species: string;
  culmen_length_mm: number | null;
  culmen_depth_mm: number | null;
  island: string;
  sex: string | null;
}

export function renderPenguinPlot(
  container: HTMLElement,
  penguins: PenguinObservation[],
): void {
  const data = penguins.filter(
    (penguin) => penguin.culmen_length_mm && penguin.culmen_depth_mm,
  );

  container.replaceChildren(
    Plot.plot({
      grid: true,
      x: { label: 'Longueur du bec (mm)' },
      y: { label: 'Profondeur du bec (mm)' },
      color: { legend: true },
      marks: [
        Plot.dot(data, {
          x: 'culmen_length_mm',
          y: 'culmen_depth_mm',
          stroke: 'species',
        }),
      ],
    }),
  );
}
