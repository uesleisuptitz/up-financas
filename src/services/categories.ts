import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";

export type CategoryKind = "expense" | "income";

export interface MonthCategory {
  id: string;
  emoji: string;
  name: string;
  limit: number;
  kind: CategoryKind;
}

export const monthPlanId = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

export const formatCategoryName = (value: string) =>
  value.trim().toLocaleUpperCase("pt-BR");

const categoriesCollection = (year: number, month: number) =>
  collection(firestore, "monthPlans", monthPlanId(year, month), "categories");

export const subscribeMonthCategories = (
  year: number,
  month: number,
  onChange: (categories: MonthCategory[]) => void,
  onError: () => void
) => {
  const categoriesQuery = query(
    categoriesCollection(year, month),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    categoriesQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            emoji: String(data.emoji ?? ""),
            name: formatCategoryName(String(data.name ?? "")),
            limit: Number(data.limit ?? 0),
            kind: data.kind === "income" ? "income" : "expense",
          };
        })
      );
    },
    onError
  );
};

export const createMonthCategory = (input: {
  year: number;
  month: number;
  emoji: string;
  name: string;
  limit: number;
  kind: CategoryKind;
}) =>
  addDoc(categoriesCollection(input.year, input.month), {
    emoji: input.emoji.trim(),
    name: formatCategoryName(input.name),
    limit: input.limit,
    kind: input.kind,
    createdAt: serverTimestamp(),
  });

export const updateMonthCategory = (input: {
  year: number;
  month: number;
  id: string;
  emoji: string;
  name: string;
  limit: number;
}) =>
  updateDoc(
    doc(
      firestore,
      "monthPlans",
      monthPlanId(input.year, input.month),
      "categories",
      input.id
    ),
    {
      emoji: input.emoji.trim(),
      name: formatCategoryName(input.name),
      limit: input.limit,
    }
  );

export const copyMonthCategories = async (input: {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
  kind: CategoryKind;
}) => {
  const snapshot = await getDocs(
    query(
      categoriesCollection(input.fromYear, input.fromMonth),
      orderBy("createdAt", "asc")
    )
  );
  const items = snapshot.docs
    .map((document) => document.data())
    .filter(
      (data) => (data.kind === "income" ? "income" : "expense") === input.kind
    );

  const createdAt = Date.now();
  await Promise.all(
    items.map((data, index) =>
      addDoc(categoriesCollection(input.toYear, input.toMonth), {
        emoji: String(data.emoji ?? "").trim(),
        name: formatCategoryName(String(data.name ?? "")),
        limit: Number(data.limit ?? 0),
        kind: input.kind,
        createdAt: Timestamp.fromMillis(createdAt + index),
      })
    )
  );

  return items.length;
};

export const deleteMonthCategory = (input: {
  year: number;
  month: number;
  id: string;
}) =>
  deleteDoc(
    doc(
      firestore,
      "monthPlans",
      monthPlanId(input.year, input.month),
      "categories",
      input.id
    )
  );
