import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContexte } from "../contexte/authProvider";

export default function RouteProtegee({ role }) {
  const { utilisateur } = useContext(AuthContexte);

  // 1) Pendant le chargement du contexte
  if (utilisateur === null) {
    return <div>Chargement...</div>;
  }

  // 2) Pas connecté
  if (!utilisateur) {
    return <Navigate to="/connexion" replace />;
  }

  // 3) Rôle insuffisant
  if (role === "admin" && utilisateur.role !== "admin") {
    return <Navigate to="/erreur403" replace />;
  }

  // 4) OK
  return <Outlet />;
}
