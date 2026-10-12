import { createTheme } from "@mui/material";

export const THEME = createTheme({
  palette: {
    primary: {
      main: "#1C7C45",
    },
  },
  components: {
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px 24px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: "calc(var(--page-spacing) * -1)",
          marginRight: "calc(var(--page-spacing) * -1)",
          width: "calc(100% + 2 * var(--page-spacing))",
          maxWidth: "none",
          flexShrink: 0,
        },
      },
    },
  },
});

export const GLOBAL_STYLES = {
  "html, body, #root": {
    margin: 0,
    padding: 0,
    height: "100%",
  },
  html: {
    "--page-spacing": "1rem",
  },
  "#root": {
    display: "flex",
    flexDirection: "column",
  },
  "@media only screen and (min-width: 900px)": {
    html: {
      "--page-spacing": "2rem",
    },
  },
};
