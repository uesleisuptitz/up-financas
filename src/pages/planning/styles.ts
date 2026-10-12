import { Fab, FormControl } from "@mui/material";
import styled from "styled-components";

export const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 4.5rem;
`;

export const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const SummaryTitle = styled.h2<{ $tone: "expense" | "income" }>`
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  color: ${({ theme, $tone }) =>
    $tone === "expense" ? theme.palette.error.main : theme.palette.primary.main};
`;

export const SummaryRows = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SummaryRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.2rem 0.75rem;

  &:nth-child(odd) {
    background: ${({ theme }) => theme.palette.grey[200]};
  }
`;

export const PeriodSelectors = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;

  @media (min-width: 600px) {
    gap: 0.75rem;
    max-width: 22rem;
  }

  @media (max-width: 599px) {
    .MuiSelect-select {
      padding-top: 8.5px;
      padding-bottom: 8.5px;
      padding-left: 8px;
      padding-right: 22px;
      font-size: 0.8125rem;
    }

    .MuiSelect-icon {
      right: 0;
    }
  }
`;

export const MonthField = styled(FormControl)`
  flex: 1.45;
  min-width: 0;
`;

export const YearField = styled(FormControl)`
  flex: 0.7;
  min-width: 0;
  max-width: 4.75rem;

  @media (min-width: 600px) {
    max-width: 6.5rem;
  }
`;

export const Emoji = styled.span`
  font-size: 1.5rem;
  line-height: 1;
`;

export const ModalFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;

  @media (max-width: 899px) {
    gap: 0.75rem;
  }
`;

export const AddButton = styled(Fab)`
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 1100;
`;

export const SuggestButton = styled(Fab)`
  position: fixed;
  right: 1rem;
  bottom: calc(1rem + 56px + 1rem + env(safe-area-inset-bottom));
  z-index: 1100;
`;
