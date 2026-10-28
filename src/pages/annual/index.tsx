import { CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { MONTHS } from "../../constants";
import { useAnnualYear, useFormatCurrency, useNotification } from "../../contexts";
import {
  CategoryKind,
  MonthCategory,
  MonthEntry,
  subscribeMonthCategories,
  subscribeMonthEntries,
} from "../../services";
import * as S from "./styles";

type AnnualTab = CategoryKind | "summary";

interface MonthSnapshot {
  categories: MonthCategory[];
  entries: MonthEntry[];
}

interface AnnualRow {
  name: string;
  emoji: string;
  values: Array<number | null>;
}

const emptyYear = (): MonthSnapshot[] =>
  Array.from({ length: 12 }, () => ({ categories: [], entries: [] }));

const sumKind = (kind: CategoryKind, items: { kind: CategoryKind; amount: number }[]) =>
  items.reduce((total, item) => (item.kind === kind ? total + item.amount : total), 0);

const monthTotal = (values: Array<number | null>) =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0);

const monthAverage = (values: Array<number | null>) => {
  const filled = values.filter((value): value is number => value !== null);
  if (filled.length === 0) return null;
  return filled.reduce((total, value) => total + value, 0) / filled.length;
};

const buildRows = (months: MonthSnapshot[], kind: CategoryKind): { planned: AnnualRow[]; actual: AnnualRow[] } => {
  const order: string[] = [];
  const emojis = new Map<string, string>();
  const planned = new Map<string, Array<number | null>>();
  const actual = new Map<string, Array<number | null>>();

  const ensure = (name: string, emoji: string) => {
    if (!planned.has(name)) {
      order.push(name);
      planned.set(name, Array(12).fill(null));
      actual.set(name, Array(12).fill(null));
    }
    if (emoji && !emojis.get(name)) emojis.set(name, emoji);
  };

  months.forEach((month, monthIndex) => {
    month.categories
      .filter((category) => category.kind === kind)
      .forEach((category) => {
        ensure(category.name, category.emoji);
        const values = planned.get(category.name);
        if (!values) return;
        values[monthIndex] = (values[monthIndex] ?? 0) + category.limit;
      });

    month.entries
      .filter((entry) => entry.kind === kind)
      .forEach((entry) => {
        ensure(entry.categoryName, entry.emoji);
        const values = actual.get(entry.categoryName);
        if (!values) return;
        values[monthIndex] = (values[monthIndex] ?? 0) + entry.value;
      });
  });

  const toRows = (source: Map<string, Array<number | null>>) =>
    order.map((name) => ({
      name,
      emoji: emojis.get(name) ?? "",
      values: source.get(name) ?? Array(12).fill(null),
    }));

  return { planned: toRows(planned), actual: toRows(actual) };
};

const Matrix = ({ title, rows }: { title: string; rows: AnnualRow[] }) => {
  const formatMoney = useFormatCurrency();
  const cell = (value: number | null) => (value === null ? "—" : formatMoney(value));

  return (
    <section>
      <Typography variant="h6" component="h2" id={`${title}-titulo`} gutterBottom>
        {title}
      </Typography>
      <S.Scroll>
        <S.Table aria-labelledby={`${title}-titulo`}>
          <thead>
            <tr>
              <th>Mês</th>
              {rows.map((row) => (
                <th key={row.name}>
                  {row.emoji} {row.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2}>Nenhuma categoria neste ano.</td>
              </tr>
            ) : (
              <>
                {MONTHS.map((month, monthIndex) => (
                  <tr key={month}>
                    <th>{month}</th>
                    {rows.map((row) => (
                      <td key={row.name}>{cell(row.values[monthIndex])}</td>
                    ))}
                  </tr>
                ))}
                <tr className="footer">
                  <th>Total</th>
                  {rows.map((row) => {
                    const total = row.values.some((value) => value !== null)
                      ? monthTotal(row.values)
                      : null;
                    return <td key={row.name}>{cell(total)}</td>;
                  })}
                </tr>
                <tr className="footer">
                  <th>Média</th>
                  {rows.map((row) => (
                    <td key={row.name}>{cell(monthAverage(row.values))}</td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </S.Table>
      </S.Scroll>
    </section>
  );
};

const signOf = (value: number) => (value < 0 ? "negative" : value > 0 ? "positive" : undefined);

interface SummaryMonth {
  income: number;
  expenses: number;
  economy: number;
}

const SummaryTable = ({ title, months }: { title: string; months: SummaryMonth[] }) => {
  const formatMoney = useFormatCurrency();
  const balances = months.reduce<number[]>((list, month) => {
    const previous = list[list.length - 1] ?? 0;
    list.push(previous + month.economy);
    return list;
  }, []);
  const incomeTotal = months.reduce((total, month) => total + month.income, 0);
  const expenseTotal = months.reduce((total, month) => total + month.expenses, 0);
  const economyTotal = months.reduce((total, month) => total + month.economy, 0);
  const balanceAverage = balances.reduce((total, value) => total + value, 0) / 12;

  return (
    <section>
      <Typography variant="h6" component="h2" id={`${title}-resumo`} gutterBottom>
        {title}
      </Typography>
      <S.Scroll>
        <S.Table aria-labelledby={`${title}-resumo`}>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Renda</th>
              <th>Despesas</th>
              <th>Economia</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={MONTHS[index]}>
                <th>{MONTHS[index]}</th>
                <td>
                  <S.Amount $sign="income">{formatMoney(month.income)}</S.Amount>
                </td>
                <td>
                  <S.Amount $sign="expense">{formatMoney(month.expenses)}</S.Amount>
                </td>
                <td>
                  <S.Amount $sign={signOf(month.economy)}>{formatMoney(month.economy)}</S.Amount>
                </td>
                <td>
                  <S.Amount $sign={signOf(balances[index])}>{formatMoney(balances[index])}</S.Amount>
                </td>
              </tr>
            ))}
            <tr className="footer">
              <th>Total</th>
              <td>
                <S.Amount $sign="income">{formatMoney(incomeTotal)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign="expense">{formatMoney(expenseTotal)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign={signOf(economyTotal)}>{formatMoney(economyTotal)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign={signOf(economyTotal)}>{formatMoney(economyTotal)}</S.Amount>
              </td>
            </tr>
            <tr className="footer">
              <th>Média</th>
              <td>
                <S.Amount $sign="income">{formatMoney(incomeTotal / 12)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign="expense">{formatMoney(expenseTotal / 12)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign={signOf(economyTotal / 12)}>{formatMoney(economyTotal / 12)}</S.Amount>
              </td>
              <td>
                <S.Amount $sign={signOf(balanceAverage)}>{formatMoney(balanceAverage)}</S.Amount>
              </td>
            </tr>
          </tbody>
        </S.Table>
      </S.Scroll>
    </section>
  );
};

const monthSummary = (months: MonthSnapshot[], source: "planned" | "actual"): SummaryMonth[] =>
  months.map((month) => {
    const items =
      source === "planned"
        ? month.categories.map((category) => ({ kind: category.kind, amount: category.limit }))
        : month.entries.map((entry) => ({ kind: entry.kind, amount: entry.value }));
    const income = sumKind("income", items);
    const expenses = sumKind("expense", items);
    return { income, expenses, economy: income - expenses };
  });

const Annual = () => {
  const { handleNotification } = useNotification();
  const { year } = useAnnualYear();
  const [tab, setTab] = useState<AnnualTab>("expense");
  const [months, setMonths] = useState<MonthSnapshot[]>(emptyYear);
  const [loading, setLoading] = useState(true);
  const notified = useRef(false);

  useEffect(() => {
    let active = true;
    notified.current = false;
    const ready = { categories: Array(12).fill(false), entries: Array(12).fill(false) };
    const finish = (bucket: "categories" | "entries", month: number) => {
      ready[bucket][month] = true;
      if (ready.categories.every(Boolean) && ready.entries.every(Boolean) && active) {
        setLoading(false);
      }
    };

    setLoading(true);
    setMonths(emptyYear());

    const unsubscribers = MONTHS.flatMap((_, month) => [
      subscribeMonthCategories(
        year,
        month,
        (categories) => {
          if (!active) return;
          setMonths((current) =>
            current.map((snapshot, index) => (index === month ? { ...snapshot, categories } : snapshot))
          );
          finish("categories", month);
        },
        () => {
          if (active && !notified.current) {
            notified.current = true;
            handleNotification("error", "Não foi possível carregar o ano.");
          }
          finish("categories", month);
        }
      ),
      subscribeMonthEntries(
        year,
        month,
        (entries) => {
          if (!active) return;
          setMonths((current) =>
            current.map((snapshot, index) => (index === month ? { ...snapshot, entries } : snapshot))
          );
          finish("entries", month);
        },
        () => {
          if (active && !notified.current) {
            notified.current = true;
            handleNotification("error", "Não foi possível carregar o ano.");
          }
          finish("entries", month);
        }
      ),
    ]);

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [year, handleNotification]);

  const kind: CategoryKind = tab === "income" ? "income" : "expense";
  const rows = buildRows(months, kind);

  return (
    <S.Page>
      <S.Block>
        <Tabs value={tab} onChange={(_, value: AnnualTab) => setTab(value)} variant="fullWidth">
          <Tab label="Despesas" value="expense" />
          <Tab label="Renda" value="income" />
          <Tab label="Resumo" value="summary" />
        </Tabs>
        {loading ? (
          <CircularProgress size={24} aria-label="Carregando ano" />
        ) : tab === "summary" ? (
          <S.Sections>
            <SummaryTable title="Planejado" months={monthSummary(months, "planned")} />
            <SummaryTable title="Real" months={monthSummary(months, "actual")} />
          </S.Sections>
        ) : (
          <S.Sections>
            <Matrix title="Planejado" rows={rows.planned} />
            <Matrix title="Real" rows={rows.actual} />
          </S.Sections>
        )}
      </S.Block>
    </S.Page>
  );
};

export default Annual;
