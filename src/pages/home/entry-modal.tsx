import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../../components";
import { useNotification } from "../../contexts";
import {
  CategoryKind,
  MonthCategory,
  MonthEntry,
  createMonthEntry,
  paymentMethodLabel,
  deleteMonthEntry,
  subscribeMonthCategories,
  updateMonthEntry,
} from "../../services";
import { parseCurrency } from "../../utils";
import * as S from "./styles";

interface EntryModalProps {
  open: boolean;
  kind: CategoryKind;
  entry?: MonthEntry | null;
  sourceYear: number;
  sourceMonth: number;
  onClose: () => void;
}

const formatValueInput = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PAYMENT_METHODS = [
  "Pix Nubank",
  "Crédito Nubank",
  "Débito Nubank",
  "Crédito Caju",
  "Pix Itaú",
  "Crédito Flash",
  "Dinheiro",
];

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseEntryDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, month };
};

const EntryModal = ({
  open,
  kind,
  entry = null,
  sourceYear,
  sourceMonth,
  onClose,
}: EntryModalProps) => {
  const { handleNotification } = useNotification();
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(today);
  const [payment, setPayment] = useState("");
  const [categories, setCategories] = useState<MonthCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [valueError, setValueError] = useState("");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);

  const parsedDate = parseEntryDate(date);

  const editing = entry !== null;

  useEffect(() => {
    if (!open) return;
    setCategoryId(entry?.categoryId ?? "");
    setName(entry?.name ?? "");
    setValue(entry ? formatValueInput(entry.value) : "");
    setDate(entry?.date ?? today());
    setPayment(entry?.paymentMethod ? paymentMethodLabel(entry.paymentMethod) : "");
    setCategoryError("");
    setValueError("");
    setDateError("");
  }, [open, kind, entry]);

  useEffect(() => {
    if (!open || !parsedDate) {
      setCategories([]);
      setLoadingCategories(false);
      return;
    }

    setLoadingCategories(true);
    return subscribeMonthCategories(
      parsedDate.year,
      parsedDate.month,
      (items) => {
        setCategories(items.filter((item) => item.kind === kind));
        setLoadingCategories(false);
      },
      () => {
        setLoadingCategories(false);
        handleNotification("error", "Não foi possível carregar as categorias.");
      }
    );
  }, [open, kind, parsedDate?.year, parsedDate?.month, handleNotification]);

  useEffect(() => {
    if (!categoryId || loadingCategories) return;
    if (!categories.some((item) => item.id === categoryId)) setCategoryId("");
  }, [categories, categoryId, loadingCategories]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    const amount = parseCurrency(value);
    const nextCategoryError = categoryId ? "" : "Selecione a categoria.";
    const nextValueError =
      Number.isFinite(amount) && amount > 0 ? "" : "Informe um valor maior que zero.";
    const nextDateError = parsedDate ? "" : "Informe uma data válida.";

    setCategoryError(nextCategoryError);
    setValueError(nextValueError);
    setDateError(nextDateError);
    if (nextCategoryError || nextValueError || nextDateError || !parsedDate) return;

    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      setCategoryError("Selecione a categoria.");
      return;
    }

    const payload = {
      categoryId: category.id,
      categoryName: category.name,
      name: nextName || category.name,
      emoji: category.emoji,
      value: amount,
      date,
      kind,
      paymentMethod: kind === "expense" ? payment.trim() : null,
    };

    setSaving(true);
    try {
      if (entry && parsedDate.year === sourceYear && parsedDate.month === sourceMonth) {
        await updateMonthEntry({
          year: sourceYear,
          month: sourceMonth,
          id: entry.id,
          ...payload,
        });
      } else if (entry) {
        await createMonthEntry({
          year: parsedDate.year,
          month: parsedDate.month,
          ...payload,
        });
        await deleteMonthEntry({
          year: sourceYear,
          month: sourceMonth,
          id: entry.id,
        });
      } else {
        await createMonthEntry({
          year: parsedDate.year,
          month: parsedDate.month,
          ...payload,
        });
      }
      handleNotification("success", entry ? "Registro atualizado." : "Registro salvo.");
      onClose();
    } catch {
      handleNotification("error", "Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {editing
            ? kind === "income"
              ? "Editar renda"
              : "Editar despesa"
            : kind === "income"
              ? "Nova renda"
              : "Nova despesa"}
        </DialogTitle>
        <DialogContent>
          <S.ModalFields>
            <FormControl
              fullWidth
              error={!!categoryError}
              disabled={saving || loadingCategories}
            >
              <InputLabel id="entry-category">Categoria</InputLabel>
              <Select
                labelId="entry-category"
                label="Categoria"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </MenuItem>
                ))}
              </Select>
              {(categoryError || (categories.length === 0 && !loadingCategories)) && (
                <FormHelperText>
                  {categoryError || "Nenhuma categoria neste mês."}
                </FormHelperText>
              )}
            </FormControl>
            <TextField
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={saving}
            />
            <TextField
              label="Valor"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={!!valueError}
              helperText={valueError}
              disabled={saving}
              inputProps={{ inputMode: "decimal", "aria-label": "Valor" }}
            />
            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              error={!!dateError}
              helperText={dateError}
              disabled={saving}
              InputLabelProps={{ shrink: true }}
              inputProps={{ "aria-label": "Data" }}
            />
            {kind === "expense" && (
              <FormControl fullWidth disabled={saving}>
                <InputLabel id="entry-payment">Forma de pagamento</InputLabel>
                <Select
                  labelId="entry-payment"
                  label="Forma de pagamento"
                  value={payment}
                  onChange={(event) => setPayment(event.target.value)}
                >
                  <MenuItem value="">Nenhuma</MenuItem>
                  {payment && !PAYMENT_METHODS.includes(payment) && (
                    <MenuItem value={payment}>{payment}</MenuItem>
                  )}
                  {PAYMENT_METHODS.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </S.ModalFields>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={saving} loadingText="Salvando">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EntryModal;
