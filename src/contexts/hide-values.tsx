import { createContext, ReactNode, useContext, useState } from "react";
import { formatCurrency } from "../utils";

const STORAGE_KEY = "up-financas-hide-values";
const MASK = "*****";

interface HideValuesContextModel {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

const HideValuesContext = createContext<HideValuesContextModel | null>(null);

const readHidden = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const HideValuesProvider = ({ children }: { children: ReactNode }) => {
  const [hidden, setHiddenState] = useState(readHidden);

  const setHidden = (next: boolean) => {
    setHiddenState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // A preferência segue só nesta sessão se o navegador bloquear o armazenamento.
    }
  };

  return (
    <HideValuesContext.Provider value={{ hidden, setHidden }}>
      {children}
    </HideValuesContext.Provider>
  );
};

export const useHideValues = () => {
  const context = useContext(HideValuesContext);
  if (!context) throw new Error("useHideValues deve ficar dentro de HideValuesProvider.");
  return context;
};

export const useFormatCurrency = () => {
  const { hidden } = useHideValues();
  return (value: number) => (hidden ? MASK : formatCurrency(value));
};
