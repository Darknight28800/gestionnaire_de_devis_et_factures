import { createContext, useState, useEffect } from "react";

export const AuthContexte = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("utilisateur");

    if (token && userData) {
      setUtilisateur(JSON.parse(userData));
    } else {
      setUtilisateur(false);
    }
  }, []);

  const connexion = (token, dataUtilisateur) => {
    localStorage.setItem("token", token);
    localStorage.setItem("utilisateur", JSON.stringify(dataUtilisateur));
    setUtilisateur(dataUtilisateur);
  };

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setUtilisateur(false);
  };

  const valeur = { utilisateur, connexion, deconnexion };

  return (
    <AuthContexte.Provider value={valeur}>
      {children}
    </AuthContexte.Provider>
  );
}
