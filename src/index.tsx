import ReactDOM from "react-dom/client";
import App from "./App";
import { register } from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);
register();
