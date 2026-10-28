import { Add } from "@mui/icons-material";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { Button } from "../../components";
import { useHomePeriod, useFormatCurrency, useNotification } from "../../contexts";
import { suppressHoldReleaseClick } from "../../utils";
import {
  CategoryKind,
  MonthCategory,
  MonthEntry,
  deleteMonthEntry,
  paymentMethodLabel,
  subscribeMonthCategories,
  subscribeMonthEntries,
} from "../../services";
import EntryModal from "./entry-modal";
import * as S from "./styles";

const HOLD_MS = 500;

interface StatementRowProps {
  entry: MonthEntry;
  onOpen: (entry: MonthEntry) => void;
  onHold: (entry: MonthEntry) => void;
}

const StatementRow = ({ entry, onOpen, onHold }: StatementRowProps) => {
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
      onHold(entry);
      suppressHoldReleaseClick();
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
      component="li"
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
        onOpen(entry);
      }}
      sx={{
        flexDirection: "column",
        alignItems: "stretch",
        gap: "0.1rem",
        px: "0.85rem",
        py: "0.55rem",
        backgroundColor: "transparent",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <S.EntryLine>
        <Typography noWrap fontWeight={500}>
          {entry.name}
        </Typography>
        <Typography sx={{ flexShrink: 0 }}>{formatMoney(entry.value)}</Typography>
      </S.EntryLine>
      <Typography variant="body2" color="text.secondary">
        {entry.paymentMethod
          ? `${formatEntryDate(entry.date)} - ${paymentMethodLabel(entry.paymentMethod)}`
          : formatEntryDate(entry.date)}
      </Typography>
    </ListItemButton>
  );
};

const formatEntryDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

const Home = () => {
  const { handleNotification } = useNotification();
  const { year, month } = useHomePeriod();
  const formatMoney = useFormatCurrency();
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [categories, setCategories] = useState<MonthCategory[]>([]);
  const [entries, setEntries] = useState<MonthEntry[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MonthEntry | null>(null);
  const [deleting, setDeleting] = useState<MonthEntry | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setLoadingCategories(true);
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
        handleNotification("error", "Não foi possível carregar o extrato.");
      }
    );
  }, [year, month, handleNotification]);

  const planned = categories.filter((category) => category.kind === kind);
  const statement = entries.filter((entry) => entry.kind === kind);
  const statementGroups = planned.map((category) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    limit: category.limit,
    entries: statement.filter((entry) => entry.categoryId === category.id),
  }));
  const groupedIds = new Set(planned.map((category) => category.id));
  const extraGroups = statement
    .filter((entry) => !groupedIds.has(entry.categoryId))
    .reduce<typeof statementGroups>((groups, entry) => {
      const current = groups.find((group) => group.id === entry.categoryId);
      if (current) {
        current.entries.push(entry);
        return groups;
      }
      groups.push({
        id: entry.categoryId,
        name: entry.categoryName,
        emoji: entry.emoji,
        limit: 0,
        entries: [entry],
      });
      return groups;
    }, []);
  const extratoGroups = [...statementGroups, ...extraGroups];
  const spentByCategory = statement.reduce((totals, entry) => {
    totals.set(entry.categoryId, (totals.get(entry.categoryId) ?? 0) + entry.value);
    return totals;
  }, new Map<string, number>());

  const spentTotal = statement.reduce((total, entry) => total + entry.value, 0);
  const plannedTotal = planned.reduce((total, category) => total + category.limit, 0);
  const behindPlan = kind === "expense" ? spentTotal > plannedTotal : spentTotal < plannedTotal;

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteMonthEntry({ year, month, id: deleting.id });
      handleNotification("success", "Registro excluído.");
      setDeleting(null);
    } catch {
      handleNotification("error", "Não foi possível excluir o registro.");
    } finally {
      setRemoving(false);
    }
  };

  const loading = loadingCategories || loadingEntries;
  const emptyCategories =
    kind === "income" ? "Nenhuma renda neste mês." : "Nenhuma despesa neste mês.";

  return (
    <S.Page>
      <Tabs
        value={kind}
        onChange={(_, value: CategoryKind) => setKind(value)}
        variant="fullWidth"
      >
        <Tab label="Despesas" value="expense" />
        <Tab label="Renda" value="income" />
      </Tabs>
      {loading ? (
        <CircularProgress size={24} aria-label="Carregando o mês" />
      ) : (
        <S.MonthLayout>
          <S.SpendSummary>
            <S.SpentAmount $over={behindPlan}>{formatMoney(spentTotal)}</S.SpentAmount>
            <S.PlannedHint>de {formatMoney(plannedTotal)}</S.PlannedHint>
          </S.SpendSummary>
          {extratoGroups.length === 0 ? (
            <Typography color="text.secondary">{emptyCategories}</Typography>
          ) : (
            <S.StatementGroups>
              {extratoGroups.map((group) => {
                const spent = spentByCategory.get(group.id) ?? 0;
                const difference = kind === "income" ? spent - group.limit : group.limit - spent;
                const favorable = kind === "expense" ? spent < group.limit : spent > group.limit;
                const unfavorable = kind === "expense" ? spent > group.limit : spent < group.limit;
                const differenceColor = unfavorable ? "error" : favorable ? "primary" : "text.primary";

                return (
                  <S.StatementGroup key={group.id}>
                    <S.StatementCategory>
                      <S.CategoryName>
                        <S.Emoji aria-hidden>{group.emoji}</S.Emoji>
                        <Typography noWrap>{group.name}</Typography>
                      </S.CategoryName>
                      <S.CategoryAmounts>
                        <Typography variant="body2" color={differenceColor} fontWeight={600}>
                          {formatMoney(difference)}
                        </Typography>
                      </S.CategoryAmounts>
                    </S.StatementCategory>
                    {group.entries.length > 0 && (
                      <List disablePadding>
                        {group.entries.map((entry) => (
                          <StatementRow
                            key={entry.id}
                            entry={entry}
                            onOpen={(item) => {
                              setEditing(item);
                              setModalOpen(true);
                            }}
                            onHold={setDeleting}
                          />
                        ))}
                      </List>
                    )}
                  </S.StatementGroup>
                );
              })}
            </S.StatementGroups>
          )}
        </S.MonthLayout>
      )}
      <S.AddButton
        color="primary"
        aria-label={kind === "income" ? "Registrar renda" : "Registrar despesa"}
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      >
        <Add />
      </S.AddButton>
      <EntryModal
        open={modalOpen}
        kind={editing?.kind ?? kind}
        entry={editing}
        sourceYear={year}
        sourceMonth={month}
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

export default Home;
