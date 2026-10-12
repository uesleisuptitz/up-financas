import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { AuthProvider, NotificationProvider } from "./contexts";
import Router from "./router";
import { GLOBAL_STYLES, THEME } from "./styles/theme";

function App() {
  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <GlobalStyles styles={GLOBAL_STYLES} />
      <NotificationProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
