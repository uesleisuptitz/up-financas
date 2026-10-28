import { Fab } from "@mui/material";
import styled from "styled-components";

export const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 32rem;
  padding-bottom: 4.5rem;

  @media (min-width: 900px) {
    max-width: none;
  }
`;

export const MonthLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  max-width: 40rem;
`;

export const SpendSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.15rem;
`;

export const SpentAmount = styled.p<{ $over: boolean }>`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${({ theme, $over }) =>
    $over ? theme.palette.error.main : theme.palette.text.primary};
`;

export const PlannedHint = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.3;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const CategoryName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const CategoryAmounts = styled.div`
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
`;

export const Emoji = styled.span`
  font-size: 1.25rem;
  line-height: 1;
`;

export const StatementGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const StatementGroup = styled.section`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.palette.background.paper};

  ul {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
  }

  li + li {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const StatementCategory = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  background: ${({ theme }) => theme.palette.grey[100]};
`;

export const EntryLine = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
`;

export const ModalFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
