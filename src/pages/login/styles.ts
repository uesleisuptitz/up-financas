import { Paper } from "@mui/material";
import styled from "styled-components";

export const Screen = styled.div`
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const Card = styled(Paper)`
  width: 100%;
  max-width: 24rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (min-width: 600px) {
    padding: 2rem;
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  img {
    width: 2.5rem;
    height: 2.5rem;
    display: block;
  }
`;
