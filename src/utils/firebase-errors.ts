import { FirebaseError } from "firebase/app";

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Login cancelado.",
  "auth/cancelled-popup-request": "Login cancelado.",
  "auth/popup-blocked":
    "O navegador bloqueou a janela de login. Permita pop-ups e tente de novo.",
  "auth/unauthorized-domain":
    "Este domínio não está autorizado no login do Firebase.",
  "auth/network-request-failed": "Sem conexão. Tente novamente.",
  "auth/operation-not-allowed":
    "O login com Google ainda não está ativado no Firebase.",
  "auth/account-exists-with-different-credential":
    "Esta conta já existe com outro método de login.",
};

export const firebaseErrorsHandler = (error: unknown) => {
  if (error instanceof FirebaseError) {
    return (
      FIREBASE_ERROR_MESSAGES[error.code] ??
      "Não foi possível entrar com o Google."
    );
  }

  return "Não foi possível entrar com o Google.";
};
