import styled from "styled-components";

export const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
`;

export const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Scroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  th,
  td {
    padding: 0.45rem 0.65rem;
    white-space: nowrap;
    text-align: right;
    font-weight: 400;
  }

  thead th {
    text-align: right;
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: 500;
  }

  thead th:first-child {
    text-align: left;
  }

  tbody th {
    text-align: left;
    font-weight: 400;
  }

  thead th:first-child,
  tbody th {
    position: sticky;
    left: 0;
    z-index: 1;
    background: #fff;
  }

  tbody tr:nth-child(even) th,
  tbody tr:nth-child(even) td {
    background: ${({ theme }) => theme.palette.grey[100]};
  }

  .total {
    font-weight: 500;
    box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.12);
  }

  tr.footer th,
  tr.footer td {
    border-top: 2px solid rgba(0, 0, 0, 0.2);
  }

  tr.footer + tr.footer th,
  tr.footer + tr.footer td {
    border-top: 0;
  }
`;

export const Amount = styled.span<{ $sign?: "positive" | "negative" | "income" | "expense" }>`
  font-weight: ${({ $sign }) => ($sign === "positive" || $sign === "negative" ? 500 : 400)};
  color: ${({ theme, $sign }) => {
    if ($sign === "income" || $sign === "positive") return theme.palette.primary.main;
    if ($sign === "expense" || $sign === "negative") return theme.palette.error.main;
    return "inherit";
  }};
`;
