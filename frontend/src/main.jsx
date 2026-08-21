import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./contexte/authProvider.jsx";
import { DialogProvider } from "./contexte/dialogProvider.jsx";
import "./i18n/index.js";
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <DialogProvider>
            <App />
        </DialogProvider>
    </AuthProvider>
);
