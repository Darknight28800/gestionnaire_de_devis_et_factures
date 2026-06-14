import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../composants/layout";
import RouteProtegee from "../composants/routeProtegee";

/* Pages */
import Connexion from "../pages/connexion/connexion";
import TableauDeBord from "../pages/tableauDeBord/tableauDeBord";

import Clients from "../pages/clients/clients";
import Devis from "../pages/devis/devis";
import Factures from "../pages/factures/factures";

import Profil from "../pages/profil/profil";
import Admin from "../pages/admin/admin";
import Utilisateurs from "../pages/admin/utilisateurs";
import Roles from "../pages/admin/roles";
import Logs from "../pages/admin/logs";
import Support from "../pages/support/support";
import Parametres from "../pages/parametres/parametres";

import Logout from "../pages/logout/logout";

/* Pages d’erreur */
import Erreur404 from "../pages/erreurs/erreur404";
import Erreur500 from "../pages/erreurs/erreur500";
import Erreur403 from "../pages/erreurs/erreur403";
import Erreur401 from "../pages/erreurs/erreur401";

export default function RouteurApp() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Connexion */}
                <Route path="/connexion" element={<Connexion />} />

                {/* Routes protégées (user) */}
                <Route element={<RouteProtegee role="user" />}>
                    <Route element={<Layout />}>

                        <Route path="/" element={<TableauDeBord />} />

                        <Route path="/clients" element={<Clients />} />
                        <Route path="/devis" element={<Devis />} />
                        <Route path="/factures" element={<Factures />} />

                        <Route path="/profil" element={<Profil />} />
                        <Route path="/parametres" element={<Parametres />} />
                        <Route path="/support" element={<Support />} />

                        {/* Déconnexion */}
                        <Route path="/logout" element={<Logout />} />

                    </Route>
                </Route>

                {/* Routes admin */}
                <Route element={<RouteProtegee role="admin" />}>
                    <Route element={<Layout />}>
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
                        <Route path="/admin/roles" element={<Roles />} />
                        <Route path="/admin/logs" element={<Logs />} />
                    </Route>
                </Route>

                {/* Pages d’erreur */}
                <Route path="/erreur401" element={<Erreur401 />} />
                <Route path="/erreur403" element={<Erreur403 />} />
                <Route path="/erreur500" element={<Erreur500 />} />

                {/* 404 */}
                <Route path="*" element={<Erreur404 />} />

            </Routes>
        </BrowserRouter>
    );
}
