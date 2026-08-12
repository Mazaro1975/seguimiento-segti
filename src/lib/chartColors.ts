// Paleta validada (ver skill dataviz / references/palette.md).
export const SERIES_1 = "#2a78d6"; // azul, único color para series simples

export const SEQUENTIAL_BLUE = [
  "#cde2fb", // 100
  "#9ec5f4", // 200
  "#6da7ec", // 300
  "#3987e5", // 400
  "#256abf", // 500
  "#184f95", // 600
  "#0d366b", // 700
];

export const CHART_INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
};

/** Selecciona un paso de la rampa secuencial azul según una fracción 0..1. */
export function sequentialStep(fraction: number): string {
  const idx = Math.min(
    SEQUENTIAL_BLUE.length - 1,
    Math.max(0, Math.round(fraction * (SEQUENTIAL_BLUE.length - 1)))
  );
  return SEQUENTIAL_BLUE[idx];
}
