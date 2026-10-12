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
  gap: 1.5rem;

  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: minmax(0, 32rem) minmax(16rem, 1fr);
    align-items: start;
    gap: 2rem;
  }
`;

export const Statement = styled.section`
  @media (max-width: 899px) {
    min-height: calc(100dvh - 3.5rem);
  }
`;

export const PlanColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

export const ChartWrap = styled.div`
  position: relative;
  width: 100%;
  height: 16rem;
  overflow: visible;

  .recharts-wrapper,
  .recharts-surface {
    overflow: visible;
  }

  @media (max-width: 899px) {
    -webkit-tap-highlight-color: transparent;

    svg,
    svg:focus,
    .recharts-surface:focus,
    .recharts-sector:focus,
    .recharts-pie-sector,
    .recharts-pie-sector:focus,
    .recharts-pie-sector:focus-visible,
    .recharts-pie-sector path:focus {
      outline: none;
    }
  }
`;

export const EmptyRing = styled.div`
  position: absolute;
  inset: 1rem;
  border-radius: 50%;
  border: 1.35rem solid rgba(0, 0, 0, 0.12);
`;

export const ChartCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const CategoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const CategoryItem = styled.li``;

export const CategoryButton = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  padding: 0.35rem 0;
  margin: 0;
  border: 0;
  border-radius: 4px;
  background: ${({ $selected }) => ($selected ? "rgba(28, 124, 69, 0.12)" : "none")};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
`;

export const CategoryHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
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

export const EntryText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
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
