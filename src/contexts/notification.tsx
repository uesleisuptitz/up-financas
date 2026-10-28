import { Alert, AlertProps, Snackbar } from "@mui/material";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface NotificationContextModel {
  handleNotification: (
    type: AlertProps["severity"],
    message: string,
    duration?: number
  ) => void;
}

interface Notification {
  type: AlertProps["severity"];
  message: string;
  duration?: number;
}

export const NotificationContext = createContext<NotificationContextModel>(
  {} as NotificationContextModel
);

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const handleNotification: NotificationContextModel["handleNotification"] =
    useCallback(
      (type, message, duration = 6000) =>
        setNotification({ type, message, duration }),
      []
    );

  return (
    <NotificationContext.Provider value={{ handleNotification }}>
      <Snackbar
        open={!!notification?.type}
        autoHideDuration={notification?.duration}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: { xs: "calc(56px + 0.75rem)", sm: "calc(64px + 0.75rem)" },
        }}
      >
        {notification?.type ? (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
