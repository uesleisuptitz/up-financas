import { Add, AutoAwesome } from "@mui/icons-material";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { Button } from "../../components";
import { MONTHS } from "../../constants";
import { useFormatCurrency, useNotification } from "../../contexts";
import {
  CategoryKind,
  MonthCategory,
  MonthEntry,
  copyMonthCategories,
  deleteMonthCategory,
  subscribeMonthCategories,
  subscribeMonthEntries,
} from "../../services";
import CategoryModal from "./category-modal";
import * as S from "./styles";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, index) => currentYear - 5 + index);

const emptyLabel = (kind: CategoryKind) =>
  kind === "income" ? "Nenhuma renda neste mês." : "Nenhuma despesa neste mês.";

const addLabel = (kind: CategoryKind) =>
  kind === "income" ? "Criar renda" : "Criar despesa";

const previousPeriod = (year: number, month: number) =>
  month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };

type PlanningTab = CategoryKind | "summary";

const sumKind = (kind: CategoryKind, items: { kind: CategoryKind; amount: number }[]) =>
  items.reduce((total, item) => (item.kind === kind ? total + item.amount : total), 0);

const SummarySection = ({
  title,
  tone,
  planned,
  actual,
}: {
  title: string;
  tone: "expense" | "income";
  planned: number;
  actual: number;
}) => {
  const formatMoney = useFormatCurrency();
  const difference = tone === "income" ? actual - planned : planned - actual;
  const favorable = tone === "expense" ? actual < planned : actual > planned;
  const unfavorable = tone === "expense" ? actual > planned : actual < planned;
  const differenceColor = unfavorable ? "error" : favorable ? "primary" : "text.primary";

  return (
    <section>
      <S.SummaryTitle $tone={tone}>{title}</S.SummaryTitle>
      <S.SummaryRows>
        <S.SummaryRow>
          <Typography>Planejado</Typography>
          <Typography>{formatMoney(planned)}</Typography>
        </S.SummaryRow>
        <S.SummaryRow>
          <Typography>Real</Typography>
          <Typography>{formatMoney(actual)}</Typography>
        </S.SummaryRow>
        <S.SummaryRow>
          <Typography>Diferença</Typography>
          <Typography color={differenceColor} fontWeight={500}>
            {formatMoney(difference)}
          </Typography>
        </S.SummaryRow>
      </S.SummaryRows>
    </section>
  );
};

const HOLD_MS = 500;

interface CategoryRowProps {
  category: MonthCategory;
  divider: boolean;
  onOpen: (category: MonthCategory) => void;
  onHold: (category: MonthCategory) => void;
}

const CategoryRow = ({ category, divider, onOpen, onHold }: CategoryRowProps) => {
  const formatMoney = useFormatCurrency();
  const press = useRef({ timer: 0, x: 0, y: 0, held: false });

  useEffect(() => () => window.clearTimeout(press.current.timer), []);

  const clearPress = () => {
    window.clearTimeout(press.current.timer);
    press.current.timer = 0;
  };

  const startPress = (event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    press.current.held = false;
    press.current.x = event.clientX;
    press.current.y = event.clientY;
    clearPress();
    press.current.timer = window.setTimeout(() => {
      press.current.held = true;
      press.current.timer = 0;
      onHold(category);
      window.addEventListener(
        "pointerup",
        () => {
          window.addEventListener(
            "click",
            (clickEvent) => {
              clickEvent.preventDefault();
              clickEvent.stopPropagation();
            },
            { capture: true, once: true }
          );
        },
        { once: true }
      );
    }, HOLD_MS);
  };

  const movePress = (event: ReactPointerEvent) => {
    if (!press.current.timer) return;
    const dx = event.clientX - press.current.x;
    const dy = event.clientY - press.current.y;
    if (dx * dx + dy * dy > 64) clearPress();
  };

  return (
    <ListItemButton
      divider={divider}
      disableGutters
      onPointerDown={startPress}
      onPointerMove={movePress}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        if (press.current.held) {
          press.current.held = false;
          return;
        }
        onOpen(category);
      }}
      sx={{ gap: "0.75rem", userSelect: "none", WebkitTouchCallout: "none" }}
    >
      <S.Emoji aria-hidden>{category.emoji}</S.Emoji>
      <Typography sx={{ flex: 1, minWidth: 0 }}>{category.name}</Typography>
      <Typography>{formatMoney(category.limit)}</Typography>
    </ListItemButton>
  );
};

const Planning = () => {
  const theme = useTheme();
  const isMobileSelect = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });
  const { handleNotification } = useNotification();
  const formatMoney = useFormatCurrency();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(currentYear);
  const [tab, setTab] = useState<PlanningTab>("expense");
  const [categories, setCategories] = useState<MonthCategory[]>([]);
  const [entries, setEntries] = useState<MonthEntry[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MonthCategory | null>(null);
  const [deleting, setDeleting] = useState<MonthCategory | null>(null);
  const [removing, setRemoving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    setLoadingCategories(true);
    setCategories([]);

    return subscribeMonthCategories(
      year,
      month,
      (items) => {
        setCategories(items);
        setLoadingCategories(false);
      },
      () => {
        setLoadingCategories(false);
        handleNotification("error", "Não foi possível carregar as categorias.");
      }
    );
  }, [year, month, handleNotification]);

  useEffect(() => {
    setLoadingEntries(true);
    return subscribeMonthEntries(
      year,
      month,
      (items) => {
        setEntries(items);
        setLoadingEntries(false);
      },
      () => {
        setLoadingEntries(false);
        handleNotification("error", "Não foi possível carregar os lançamentos.");
      }
    );
  }, [year, month, handleNotification]);

  const kind: CategoryKind = tab === "income" ? "income" : "expense";
  const isSummary = tab === "summary";
  const items = categories.filter((category) => category.kind === kind);
  const plannedExpenses = sumKind(
    "expense",
    categories.map((category) => ({ kind: category.kind, amount: category.limit }))
  );
  const plannedIncome = sumKind(
    "income",
    categories.map((category) => ({ kind: category.kind, amount: category.limit }))
  );
  const actualExpenses = sumKind(
    "expense",
    entries.map((entry) => ({ kind: entry.kind, amount: entry.value }))
  );
  const actualIncome = sumKind(
    "income",
    entries.map((entry) => ({ kind: entry.kind, amount: entry.value }))
  );
  const plannedDifference = plannedIncome - plannedExpenses;
  const actualDifference = actualIncome - actualExpenses;
  const planComparison = actualDifference - plannedDifference;

  const suggestPrevious = async () => {
    const previous = previousPeriod(year, month);
    setSuggesting(true);
    try {
      const copied = await copyMonthCategories({
        fromYear: previous.year,
        fromMonth: previous.month,
        toYear: year,
        toMonth: month,
        kind,
      });
      handleNotification(
        copied === 0 ? "info" : "success",
        copied === 0
          ? "O mês anterior não tem planejamento."
          : "Planejamento do mês anterior copiado."
      );
    } catch {
      handleNotification("error", "Não foi possível copiar o planejamento.");
    } finally {
      setSuggesting(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteMonthCategory({ year, month, id: deleting.id });
      handleNotification("success", "Categoria excluída.");
      setDeleting(null);
    } catch {
      handleNotification("error", "Não foi possível excluir a categoria.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <S.Page>
      <S.Block>
        <Tabs
          value={tab}
          onChange={(_, value: PlanningTab) => setTab(value)}
          variant="fullWidth"
        >
          <Tab label="Despesas" value="expense" />
          <Tab label="Renda" value="income" />
          <Tab label="Resumo" value="summary" />
        </Tabs>
        <S.PeriodSelectors>
          <S.MonthField>
            <Select
              fullWidth
              size={isMobileSelect ? "small" : "medium"}
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              inputProps={{ "aria-label": "Mês" }}
            >
              {MONTHS.map((name, index) => (
                <MenuItem key={name} value={index}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </S.MonthField>
          <S.YearField>
            <Select
              fullWidth
              size={isMobileSelect ? "small" : "medium"}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              inputProps={{ "aria-label": "Ano" }}
            >
              {YEARS.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </S.YearField>
        </S.PeriodSelectors>
        {isSummary ? (
          loadingCategories || loadingEntries ? (
            <CircularProgress size={24} aria-label="Carregando resumo" />
          ) : (
            <S.Summary>
              <SummarySection
                title="Despesas"
                tone="expense"
                planned={plannedExpenses}
                actual={actualExpenses}
              />
              <SummarySection
                title="Renda"
                tone="income"
                planned={plannedIncome}
                actual={actualIncome}
              />
              <Alert severity={planComparison < 0 ? "error" : "success"}>
                {planComparison === 0
                  ? "Igual ao planejado"
                  : planComparison > 0
                    ? `${formatMoney(planComparison)} acima do planejado`
                    : `${formatMoney(Math.abs(planComparison))} abaixo do planejado`}
              </Alert>
            </S.Summary>
          )
        ) : loadingCategories ? (
          <CircularProgress size={24} aria-label="Carregando categorias" />
        ) : items.length === 0 ? (
          <Typography color="text.secondary">{emptyLabel(kind)}</Typography>
        ) : (
          <List disablePadding>
            {items.map((category, index) => (
              <CategoryRow
                key={category.id}
                category={category}
                divider={index < items.length - 1}
                onOpen={(item) => {
                  setEditing(item);
                  setModalOpen(true);
                }}
                onHold={setDeleting}
              />
            ))}
          </List>
        )}
      </S.Block>
      {!isSummary && !loadingCategories && items.length === 0 && (
        <S.SuggestButton
          color="primary"
          aria-label="Copiar planejamento do mês anterior"
          disabled={suggesting}
          onClick={suggestPrevious}
        >
          {suggesting ? <CircularProgress size={24} color="inherit" /> : <AutoAwesome />}
        </S.SuggestButton>
      )}
      {!isSummary && (
        <S.AddButton
          color="primary"
          aria-label={addLabel(kind)}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Add />
        </S.AddButton>
      )}
      <CategoryModal
        open={modalOpen}
        year={year}
        month={month}
        kind={kind}
        category={editing}
        onClose={closeModal}
      />
      <Dialog
        open={deleting !== null}
        onClose={removing ? undefined : () => setDeleting(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {deleting?.kind === "income" ? "Excluir renda" : "Excluir despesa"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja excluir {deleting?.emoji} {deleting?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)} disabled={removing}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            loading={removing}
            loadingText="Excluindo"
            onClick={confirmDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </S.Page>
  );
};

export default Planning;
