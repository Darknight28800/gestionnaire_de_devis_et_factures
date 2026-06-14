import { useState } from "react";
import { AuthContexte } from "./authContexte";

export function AuthProvider({ children }) {
    const [utilisateur, setUtilisateur] = useState(null);

    const connexion = (token, dataUtilisateur) => {
        localStorage.setItem("token", token);
        setUtilisateur(dataUtilisateur);
    };

    const deconnexion = () => {
        localStorage.removeItem("token");
        setUtilisateur(null);
    };

    return (
        <AuthContexte.Provider value={{ utilisateur, connexion, deconnexion }}>
            {children}
        </AuthContexte.Provider>
    );
}

