import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../../components";
import { useNotification } from "../../contexts";
import {
  CategoryKind,
  MonthCategory,
  createMonthCategory,
  updateMonthCategory,
} from "../../services";
import { parseCurrency } from "../../utils";
import * as S from "./styles";

interface CategoryModalProps {
  open: boolean;
  year: number;
  month: number;
  kind: CategoryKind;
  category?: MonthCategory | null;
  onClose: () => void;
}

const formatLimitInput = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CategoryModal = ({
  open,
  year,
  month,
  kind,
  category = null,
  onClose,
}: CategoryModalProps) => {
  const { handleNotification } = useNotification();
  const [emoji, setEmoji] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [emojiError, setEmojiError] = useState("");
  const [nameError, setNameError] = useState("");
  const [valueError, setValueError] = useState("");
  const [saving, setSaving] = useState(false);

  const editing = category !== null;

  useEffect(() => {
    if (!open) return;
    setEmoji(category?.emoji ?? "");
    setName(category?.name ?? "");
    setValue(category ? formatLimitInput(category.limit) : "");
    setEmojiError("");
    setNameError("");
    setValueError("");
  }, [open, category]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextEmoji = emoji.trim();
    const nextName = name.trim();
    const limit = parseCurrency(value);
    const nextEmojiError = nextEmoji ? "" : "Informe um emoji.";
    const nextNameError = nextName ? "" : "Informe o nome.";
    const nextValueError =
      Number.isFinite(limit) && limit > 0
        ? ""
        : "Informe um valor maior que zero.";

    setEmojiError(nextEmojiError);
    setNameError(nextNameError);
    setValueError(nextValueError);
    if (nextEmojiError || nextNameError || nextValueError) return;

    setSaving(true);
    try {
      if (category) {
        await updateMonthCategory({
          year,
          month,
          id: category.id,
          emoji: nextEmoji,
          name: nextName,
          limit,
        });
        handleNotification("success", "Categoria atualizada.");
      } else {
        await createMonthCategory({
          year,
          month,
          emoji: nextEmoji,
          name: nextName,
          limit,
          kind,
        });
        handleNotification("success", "Categoria salva.");
      }
      onClose();
    } catch {
      handleNotification("error", "Não foi possível salvar a categoria.");
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
            <TextField
              label="Emoji"
              value={emoji}
              onChange={(event) => setEmoji(event.target.value)}
              error={!!emojiError}
              helperText={emojiError}
              autoFocus={!editing}
              disabled={saving}
              inputProps={{ maxLength: 16, "aria-label": "Emoji" }}
            />
            <TextField
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={!!nameError}
              helperText={nameError}
              disabled={saving}
            />
            <TextField
              label="Valor"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={!!valueError}
              helperText={valueError}
              autoFocus={editing}
              disabled={saving}
              inputProps={{ inputMode: "decimal", "aria-label": "Valor" }}
            />
          </S.ModalFields>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={saving}
            loadingText="Salvando"
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryModal;
