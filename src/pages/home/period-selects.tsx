import { MenuItem, Select } from "@mui/material";
import styled from "styled-components";
import { MONTHS } from "../../constants";
import { useHomePeriod } from "../../contexts";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, index) => currentYear - 5 + index);

const PagePeriod = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 22rem;
`;

const MonthField = styled.div`
  flex: 1.45;
  min-width: 0;
`;

const YearField = styled.div`
  flex: 0.7;
  min-width: 0;
  max-width: 6.5rem;
`;

const HeaderPeriod = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  min-width: 0;
  flex: 1;
  color: inherit;

  @media (min-width: 900px) {
    flex: 0 1 22rem;
    margin-left: 0;
  }

  .MuiInputBase-root,
  .MuiSelect-icon {
    color: inherit;
  }

  && .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.7);
  }

  && .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
  && .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #fff;
  }
`;

const HeaderMonth = styled.div`
  flex: 1;
  min-width: 0;

  .MuiSelect-select {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const HeaderYear = styled.div`
  flex: 0 0 6rem;
`;

const HomePeriodSelects = ({ placement }: { placement: "page" | "header" }) => {
  const { month, year, setMonth, setYear } = useHomePeriod();
  const size = placement === "header" ? "small" : "medium";
  const Fields = placement === "header" ? HeaderPeriod : PagePeriod;
  const Month = placement === "header" ? HeaderMonth : MonthField;
  const Year = placement === "header" ? HeaderYear : YearField;

  return (
    <Fields>
      <Month>
        <Select
          fullWidth
          size={size}
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
      </Month>
      <Year>
        <Select
          fullWidth
          size={size}
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
      </Year>
    </Fields>
  );
};

export default HomePeriodSelects;
