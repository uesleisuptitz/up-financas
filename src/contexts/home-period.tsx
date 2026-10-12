import { createContext, ReactNode, useContext, useState } from "react";

interface HomePeriodContextModel {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const HomePeriodContext = createContext<HomePeriodContextModel | null>(null);

export const HomePeriodProvider = ({ children }: { children: ReactNode }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  return (
    <HomePeriodContext.Provider value={{ month, year, setMonth, setYear }}>
      {children}
    </HomePeriodContext.Provider>
  );
};

export const useHomePeriod = () => {
  const context = useContext(HomePeriodContext);
  if (!context) throw new Error("useHomePeriod deve ficar dentro de HomePeriodProvider.");
  return context;
};
