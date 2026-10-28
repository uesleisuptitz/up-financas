import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { CategoryKind, formatCategoryName, monthPlanId } from "./categories";
import { firestore } from "./firebase";

const STORED_PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  debit: "Débito",
  credit: "Crédito",
  cash: "Dinheiro",
};

export const paymentMethodLabel = (method: string) =>
  STORED_PAYMENT_LABELS[method] ?? method;

export interface MonthEntry {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  emoji: string;
  value: number;
  date: string;
  kind: CategoryKind;
  paymentMethod: string | null;
}

const entriesCollection = (year: number, month: number) =>
  collection(firestore, "monthPlans", monthPlanId(year, month), "entries");

const entryDoc = (year: number, month: number, id: string) =>
  doc(firestore, "monthPlans", monthPlanId(year, month), "entries", id);

const readPaymentMethod = (value: unknown) => {
  if (typeof value !== "string") return null;
  const method = value.trim();
  return method ? method : null;
};

export const subscribeMonthEntries = (
  year: number,
  month: number,
  onChange: (entries: MonthEntry[]) => void,
  onError: () => void
) => {
  const entriesQuery = query(entriesCollection(year, month), orderBy("date", "desc"));

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((document) => {
        const data = document.data();
        const createdAt = typeof data.createdAt?.toMillis === "function"
          ? data.createdAt.toMillis()
          : 0;
        const kind: CategoryKind = data.kind === "income" ? "income" : "expense";
        return {
          id: document.id,
          categoryId: String(data.categoryId ?? ""),
          categoryName: formatCategoryName(String(data.categoryName ?? "")),
          name: String(data.name ?? ""),
          emoji: String(data.emoji ?? ""),
          value: Number(data.value ?? 0),
          date: String(data.date ?? ""),
          kind,
          paymentMethod: readPaymentMethod(data.paymentMethod),
          createdAt,
        };
      });

      entries.sort(
        (left, right) =>
          right.date.localeCompare(left.date) || right.createdAt - left.createdAt
      );

      onChange(
        entries.map((entry) => ({
          id: entry.id,
          categoryId: entry.categoryId,
          categoryName: entry.categoryName,
          name: entry.name,
          emoji: entry.emoji,
          value: entry.value,
          date: entry.date,
          kind: entry.kind,
          paymentMethod: entry.paymentMethod,
        }))
      );
    },
    onError
  );
};

export const createMonthEntry = (input: {
  year: number;
  month: number;
  categoryId: string;
  categoryName: string;
  name: string;
  emoji: string;
  value: number;
  date: string;
  kind: CategoryKind;
  paymentMethod: string | null;
}) =>
  addDoc(entriesCollection(input.year, input.month), {
    ...entryFields(input),
    createdAt: serverTimestamp(),
  });

const entryFields = (input: {
  categoryId: string;
  categoryName: string;
  name: string;
  emoji: string;
  value: number;
  date: string;
  kind: CategoryKind;
  paymentMethod: string | null;
}) => ({
  categoryId: input.categoryId,
  categoryName: formatCategoryName(input.categoryName),
  name: input.name.trim(),
  emoji: input.emoji,
  value: input.value,
  date: input.date,
  kind: input.kind,
  paymentMethod:
    input.kind === "expense" && input.paymentMethod
      ? input.paymentMethod.trim()
      : null,
});

export const updateMonthEntry = (input: {
  year: number;
  month: number;
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  emoji: string;
  value: number;
  date: string;
  kind: CategoryKind;
  paymentMethod: string | null;
}) => updateDoc(entryDoc(input.year, input.month, input.id), entryFields(input));

export const deleteMonthEntry = (input: { year: number; month: number; id: string }) =>
  deleteDoc(entryDoc(input.year, input.month, input.id));
