import { MenuItem, Select } from "@mui/material";
import styled from "styled-components";
import { ANNUAL_YEARS, useAnnualYear } from "../../contexts";

const HeaderYear = styled.div`
  width: 6rem;
  margin-left: auto;
  flex-shrink: 0;
  color: inherit;

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

const AnnualYearSelect = () => {
  const { year, setYear } = useAnnualYear();

  return (
    <HeaderYear>
      <Select
        fullWidth
        size="small"
        value={year}
        onChange={(event) => setYear(Number(event.target.value))}
        inputProps={{ "aria-label": "Ano" }}
      >
        {ANNUAL_YEARS.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </HeaderYear>
  );
};

export default AnnualYearSelect;
