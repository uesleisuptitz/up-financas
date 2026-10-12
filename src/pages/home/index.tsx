import { Add } from "@mui/icons-material";
import {
  CircularProgress,
  Dialog,
  Divider,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  List,
  ListItemButton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Fragment, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { Button } from "../../components";
import { useHomePeriod, useFormatCurrency, useNotification } from "../../contexts";
import {
  CategoryKind,
  MonthCategory,
  MonthEntry,
  deleteMonthEntry,
  paymentMethodLabel,
  subscribeMonthCategories,
  subscribeMonthEntries,
} from "../../services";
import { categoryColor } from "./colors";
import EntryModal from "./entry-modal";
import MonthChart from "./month-chart";
import * as S from "./styles";

const HOLD_MS = 500;

interface StatementRowProps {
  entry: MonthEntry;
  striped: boolean;
  onOpen: (entry: MonthEntry) => void;
  onHold: (entry: MonthEntry) => void;
}

const StatementRow = ({ entry, striped, onOpen, onHold }: StatementRowProps) => {
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
        gap: "0.75rem",
        px: "0.75rem",
        backgroundColor: striped ? "grey.200" : "transparent",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <S.Emoji aria-hidden>{entry.emoji}</S.Emoji>
      <S.EntryText>
        <Typography>{entry.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {[
            entry.categoryName,
            formatEntryDate(entry.date),
            entry.paymentMethod ? paymentMethodLabel(entry.paymentMethod) : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
      </S.EntryText>
      <Typography>{formatMoney(entry.value)}</Typography>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const statementTitleRef = useRef<HTMLHeadingElement>(null);
  const { handleNotification } = useNotification();
  const { year, month } = useHomePeriod();
  const formatMoney = useFormatCurrency();
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
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

  useEffect(() => {
    setSelectedCategoryId(null);
  }, [year, month]);

  const planned = categories.filter((category) => category.kind === kind);
  const statement = entries.filter((entry) => entry.kind === kind);
  const visibleStatement = selectedCategoryId
    ? statement.filter((entry) => entry.categoryId === selectedCategoryId)
    : statement;
  const spentByCategory = statement.reduce((totals, entry) => {
    totals.set(entry.categoryId, (totals.get(entry.categoryId) ?? 0) + entry.value);
    return totals;
  }, new Map<string, number>());

  const chartItems = planned.flatMap((category, index) => {
    if (category.limit <= 0) return [];
    return [
      {
        name: category.name,
        emoji: category.emoji,
        value: category.limit,
        color: categoryColor(index),
      },
    ];
  });

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
  const emptyStatement = selectedCategoryId
    ? kind === "income"
      ? "Nenhuma renda nesta categoria."
      : "Nenhuma despesa nesta categoria."
    : kind === "income"
      ? "Nenhuma renda lançada neste mês."
      : "Nenhuma despesa lançada neste mês.";

  return (
    <S.Page>
      <Tabs
        value={kind}
        onChange={(_, value: CategoryKind) => {
          setKind(value);
          setSelectedCategoryId(null);
        }}
        variant="fullWidth"
      >
        <Tab label="Despesas" value="expense" />
        <Tab label="Renda" value="income" />
      </Tabs>
      {loading ? (
        <CircularProgress size={24} aria-label="Carregando o mês" />
      ) : (
        <S.MonthLayout>
          <S.PlanColumn>
          <MonthChart items={chartItems} />
          <section>
            {planned.length === 0 ? (
              <Typography color="text.secondary">{emptyCategories}</Typography>
            ) : (
              <S.CategoryList>
                {planned.map((category) => {
                  const spent = spentByCategory.get(category.id) ?? 0;
                  const remaining = category.limit - spent;
                  const percent =
                    category.limit <= 0
                      ? spent > 0
                        ? 100
                        : 0
                      : Math.min(100, (spent / category.limit) * 100);
                  const over = remaining < 0;

                  const selected = selectedCategoryId === category.id;

                  return (
                    <S.CategoryItem key={category.id}>
                      <S.CategoryButton
                        type="button"
                        $selected={selected}
                        aria-pressed={selected}
                        onClick={() => {
                          const next = selected ? null : category.id;
                          setSelectedCategoryId(next);
                          if (!next || !isMobile) return;
                          const title = statementTitleRef.current;
                          const scroller = title?.closest("main");
                          if (!title || !(scroller instanceof HTMLElement)) return;
                          const headerHeight =
                            scroller.parentElement
                              ?.querySelector(".MuiAppBar-root")
                              ?.getBoundingClientRect().height ?? 0;
                          const top =
                            scroller.scrollTop +
                            title.getBoundingClientRect().top -
                            scroller.getBoundingClientRect().top -
                            headerHeight;
                          scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
                        }}
                      >
                      <S.CategoryHeading>
                        <S.CategoryName>
                          <S.Emoji aria-hidden>{category.emoji}</S.Emoji>
                          <Typography noWrap>{category.name}</Typography>
                        </S.CategoryName>
                        <S.CategoryAmounts>
                          <Typography variant="body2" color="text.secondary">
                            {formatMoney(spent)} / {formatMoney(category.limit)}{" "}
                            {over ? (
                              <Typography component="span" variant="body2" color="error">
                                {`(${formatMoney(remaining)})`}
                              </Typography>
                            ) : (
                              `(${formatMoney(remaining)})`
                            )}
                          </Typography>
                        </S.CategoryAmounts>
                      </S.CategoryHeading>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        aria-label={`${category.name}: ${formatMoney(spent)} de ${formatMoney(category.limit)}`}
                      />
                      </S.CategoryButton>
                    </S.CategoryItem>
                  );
                })}
              </S.CategoryList>
            )}
          </section>
          </S.PlanColumn>
          <S.Statement>
            <Typography ref={statementTitleRef} variant="h6" component="h2" gutterBottom>
              Extrato
            </Typography>
            {visibleStatement.length === 0 ? (
              <Typography color="text.secondary">{emptyStatement}</Typography>
            ) : (
              <List disablePadding>
                {visibleStatement.map((entry, index) => (
                  <Fragment key={entry.id}>
                    {index > 0 && <Divider component="li" />}
                    <StatementRow
                      entry={entry}
                      striped={index % 2 === 1}
                      onOpen={(item) => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      onHold={setDeleting}
                    />
                  </Fragment>
                ))}
              </List>
            )}
          </S.Statement>
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
