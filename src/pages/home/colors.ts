export const CATEGORY_COLORS = [
  "#1565c0",
  "#6a1b9a",
  "#00695c",
  "#e65100",
  "#ad1457",
  "#4527a0",
  "#2e7d32",
  "#00838f",
  "#c62828",
  "#283593",
  "#4e342e",
  "#0277bd",
  "#558b2f",
  "#ef6c00",
  "#6d4c41",
  "#006064",
];

export const categoryColor = (index: number) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];
