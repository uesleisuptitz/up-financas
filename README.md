# UP Finanças

Controle de gastos e rendas do casal. Login com Google (Firebase Auth), dados no Firestore e publicação no Firebase Hosting.

## Rodar local

```bash
yarn
yarn start
```

## Liberar as duas contas

O login só aceita os e-mails cadastrados. Coloque o seu e o dela nos dois arquivos, com o mesmo texto:

- `src/constants/allowed-users.ts`
- `firestore.rules`

No Firebase Console, em Authentication, ative o provedor Google.

## Deploy

Há só o ambiente de produção, no projeto Firebase `up-financas`. O `yarn start` local usa o mesmo projeto.

O workflow `.github/workflows/firebase-hosting.yml` publica a `master` no Firebase Hosting e envia as regras do Firestore.

No GitHub, crie o secret `FIREBASE_SERVICE_ACCOUNT_UP_FINANCAS` com o JSON de uma conta de serviço do projeto `up-financas`. Essa conta precisa dos papéis **Firebase Hosting Admin** e **Firebase Rules Admin**.
