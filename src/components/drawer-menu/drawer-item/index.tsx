import { ReactNode, useCallback } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface DrawerItemProps {
  label: string;
  path: string;
  icon: ReactNode;
}

const DrawerItem = ({ label, path, icon }: DrawerItemProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const selected =
    path === "/" ? pathname === "/" : pathname.startsWith(path);
  const color = selected
    ? theme.palette.primary.main
    : theme.palette.text.secondary;

  const handleNavigate = useCallback(() => {
    navigate(path);
  }, [navigate, path]);

  return (
    <ListItem disablePadding>
      <ListItemButton selected={selected} onClick={handleNavigate}>
        <ListItemIcon sx={{ color }}>{icon}</ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{ color: "inherit", sx: { color } }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;
