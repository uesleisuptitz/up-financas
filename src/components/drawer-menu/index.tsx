import { ReactNode, useEffect, useState } from "react";
import {
  DateRangeOutlined,
  EventNoteOutlined,
  HomeOutlined,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { getPageTitle } from "../../constants";
import { useAuth, useHideValues } from "../../contexts";
import HomePeriodSelects from "../../pages/home/period-selects";
import Button from "../button";
import DrawerItem from "./drawer-item";
import * as S from "./styles";

const DRAWER_WIDTH = 240;

const MENU = [
  { label: "Início", path: "/", icon: <HomeOutlined /> },
  { label: "Mensal", path: "/mensal", icon: <EventNoteOutlined /> },
  { label: "Anual", path: "/anual", icon: <DateRangeOutlined /> },
];

interface ResponsiveDrawerProps {
  children: ReactNode;
}

const ResponsiveDrawer = ({ children }: ResponsiveDrawerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { hidden, setHidden } = useHideValues();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const drawer = (
    <S.DrawerContent>
      <S.Brand>
        <S.BrandMark viewBox="0 0 32 32" aria-hidden>
          <rect width="32" height="32" rx="8" fill="#fff" />
          <text
            x="16"
            y="21.5"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="13"
            fontWeight="700"
          >
            UP
          </text>
        </S.BrandMark>
        <S.BrandName>Finanças</S.BrandName>
      </S.Brand>
      <List>
        {MENU.map((item) => (
          <DrawerItem key={item.path} {...item} />
        ))}
      </List>
      <S.LogoutSlot>
        <FormControlLabel
          label="Ocultar valores"
          labelPlacement="start"
          control={
            <Switch
              checked={hidden}
              onChange={(_, value) => setHidden(value)}
              inputProps={{ "aria-label": "Ocultar valores" }}
            />
          }
          sx={{ mx: 0, width: "100%", justifyContent: "space-between" }}
        />
        <Button fullWidth startIcon={<Logout />} onClick={() => signOut()}>
          Sair
        </Button>
      </S.LogoutSlot>
    </S.DrawerContent>
  );

  return (
    <S.Shell>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          {pathname === "/" ? (
            <HomePeriodSelects placement="header" />
          ) : (
            <S.HeaderTitle>
              <Typography variant="h6" component="h1">
                {getPageTitle(pathname)}
              </Typography>
            </S.HeaderTitle>
          )}
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <S.Main>
        <Toolbar />
        {children}
      </S.Main>
    </S.Shell>
  );
};

export default ResponsiveDrawer;
