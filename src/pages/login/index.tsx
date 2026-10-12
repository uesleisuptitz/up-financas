import { Google } from "@mui/icons-material";
import { Alert, Fade, Typography } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { Button } from "../../components";
import { hasAllowedUsers } from "../../constants";
import { useNotification } from "../../contexts";
import { signInWithGoogle } from "../../services";
import { firebaseErrorsHandler } from "../../utils";
import * as S from "./styles";

const Login = () => {
  const { handleNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const onGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        (error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request")
      ) {
        return;
      }
      handleNotification("error", firebaseErrorsHandler(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Screen>
      <Fade in timeout={600}>
        <S.Card elevation={2}>
          <S.Header>
            <S.Brand>
              <img src={`${process.env.PUBLIC_URL}/favicon.svg`} alt="" />
              <Typography variant="h4" component="h1">
                Finanças
              </Typography>
            </S.Brand>
            <Typography color="text.secondary">
              Os gastos e as rendas do casal, no mesmo lugar.
            </Typography>
          </S.Header>

          {!hasAllowedUsers && (
            <Alert severity="info">
              Nenhuma conta foi liberada para entrar ainda.
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Google />}
            onClick={onGoogleLogin}
            loading={loading}
            loadingText="Entrando"
          >
            Entrar com Google
          </Button>
        </S.Card>
      </Fade>
    </S.Screen>
  );
};

export default Login;
