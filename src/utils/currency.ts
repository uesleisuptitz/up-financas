export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const parseCurrency = (value: string) => {
  const cleaned = value.trim().replace(/\s/g, "").replace(/^R\$/, "");
  if (!cleaned) return Number.NaN;
  if (cleaned.includes(",")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned);
};
