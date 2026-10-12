import { Backdrop, CircularProgress } from "@mui/material";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { hasAllowedUsers, isAllowedEmail } from "../constants";
import { auth } from "../services/firebase";
import { useNotification } from "./notification";

export interface AuthContextModel {
  user: User | null;
  isLogged: boolean;
  loadingAuth: boolean;
  signOut: (callback?: () => void) => void;
}

export const AuthContext = createContext<AuthContextModel>(
  {} as AuthContextModel
);

const unauthorizedMessage = hasAllowedUsers
  ? "Esta conta do Google não tem acesso ao UP Finanças."
  : "Nenhuma conta foi liberada ainda.";

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const { handleNotification } = useNotification();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const signOut: AuthContextModel["signOut"] = useCallback((callback) => {
    firebaseSignOut(auth).then(() => {
      setUser(null);
      callback?.();
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoadingAuth(false);
        return;
      }

      if (!isAllowedEmail(firebaseUser.email)) {
        setUser(null);
        setLoadingAuth(false);
        handleNotification("error", unauthorizedMessage);
        await firebaseSignOut(auth);
        return;
      }

      setUser(firebaseUser);
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, [handleNotification]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogged: !!user,
        loadingAuth,
        signOut,
      }}
    >
      {loadingAuth ? (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
