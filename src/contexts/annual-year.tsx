import { createContext, ReactNode, useContext, useState } from "react";

const currentYear = new Date().getFullYear();

export const ANNUAL_YEARS = Array.from({ length: 7 }, (_, index) => currentYear - 5 + index);

interface AnnualYearContextModel {
  year: number;
  setYear: (year: number) => void;
}

const AnnualYearContext = createContext<AnnualYearContextModel | null>(null);

export const AnnualYearProvider = ({ children }: { children: ReactNode }) => {
  const [year, setYear] = useState(currentYear);

  return (
    <AnnualYearContext.Provider value={{ year, setYear }}>
      {children}
    </AnnualYearContext.Provider>
  );
};

export const useAnnualYear = () => {
  const context = useContext(AnnualYearContext);
  if (!context) throw new Error("useAnnualYear deve ficar dentro de AnnualYearProvider.");
  return context;
};
