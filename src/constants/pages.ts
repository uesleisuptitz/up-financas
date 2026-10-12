export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const formatMonthTitle = (date: Date) => {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/mensal")) return "Mensal";
  if (pathname.startsWith("/anual")) return "Anual";
  return formatMonthTitle(new Date());
};
