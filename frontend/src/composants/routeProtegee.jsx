import { Navigate, Outlet } from "react-router-dom";

export default function RouteProtegee({ role }) {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role"); // "user" ou "admin"

    // Pas connecté → 401
    if (!token) {
        return <Navigate to="/erreur401" replace />;
    }

    // Route admin → vérifier rôle
    if (role === "admin" && userRole !== "admin") {
        return <Navigate to="/erreur403" replace />;
    }

    return <Outlet />;
}
