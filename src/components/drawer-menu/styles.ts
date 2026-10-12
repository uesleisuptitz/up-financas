import styled from "styled-components";

export const Shell = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const LogoutSlot = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 4rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.palette.primary.main};
  color: #fff;
`;

export const BrandMark = styled.svg`
  width: 2.25rem;
  height: 2.25rem;
  display: block;
  flex-shrink: 0;

  text {
    fill: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const BrandName = styled.p`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
`;

export const HeaderTitle = styled.div`
  margin-left: 0.5rem;
  min-width: 0;

  @media (min-width: 900px) {
    margin-left: 0;
  }

  h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 0 var(--page-spacing) var(--page-spacing);
`;
