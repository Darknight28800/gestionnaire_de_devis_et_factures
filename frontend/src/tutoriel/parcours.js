/* Définition des parcours guidés par route. Chaque étape cible un élément via son
   attribut [data-tour], sauf la première étape "sidebar" qui sert d'introduction
   générale et ne cible aucun élément précis (popover centré). */

export function obtenirParcours(chemin, t) {
    const surNav = (cle) => `[data-tour="nav-${cle}"]`;

    const introduction = {
        popover: {
            title: t("tour.intro.titre"),
            description: t("tour.intro.texte")
        }
    };

    const navigation = [
        { element: surNav("tableauDeBord"), popover: { title: t("tour.nav.tableauDeBord.titre"), description: t("tour.nav.tableauDeBord.texte") } },
        { element: surNav("clients"), popover: { title: t("tour.nav.clients.titre"), description: t("tour.nav.clients.texte") } },
        { element: surNav("devis"), popover: { title: t("tour.nav.devis.titre"), description: t("tour.nav.devis.texte") } },
        { element: surNav("factures"), popover: { title: t("tour.nav.factures.titre"), description: t("tour.nav.factures.texte") } },
        { element: surNav("abonnement"), popover: { title: t("tour.nav.abonnement.titre"), description: t("tour.nav.abonnement.texte") } }
    ];

    const parcours = {
        "/tableau-de-bord": [
            introduction,
            ...navigation,
            { element: '[data-tour="dashboard-cartes"]', popover: { title: t("tour.dashboard.cartes.titre"), description: t("tour.dashboard.cartes.texte") } },
            { element: '[data-tour="dashboard-graphiques"]', popover: { title: t("tour.dashboard.graphiques.titre"), description: t("tour.dashboard.graphiques.texte") } },
            { element: '[data-tour="dashboard-listes"]', popover: { title: t("tour.dashboard.listes.titre"), description: t("tour.dashboard.listes.texte") } }
        ],
        "/clients": [
            { element: '[data-tour="clients-nouveau"]', popover: { title: t("tour.clients.nouveau.titre"), description: t("tour.clients.nouveau.texte") } },
            { element: '[data-tour="clients-tableau"]', popover: { title: t("tour.clients.tableau.titre"), description: t("tour.clients.tableau.texte") } }
        ],
        "/devis": [
            { element: '[data-tour="devis-nouveau"]', popover: { title: t("tour.devis.nouveau.titre"), description: t("tour.devis.nouveau.texte") } },
            { element: '[data-tour="devis-tableau"]', popover: { title: t("tour.devis.tableau.titre"), description: t("tour.devis.tableau.texte") } }
        ],
        "/factures": [
            { element: '[data-tour="factures-nouvelle"]', popover: { title: t("tour.factures.nouvelle.titre"), description: t("tour.factures.nouvelle.texte") } },
            { element: '[data-tour="factures-tableau"]', popover: { title: t("tour.factures.tableau.titre"), description: t("tour.factures.tableau.texte") } }
        ]
    };

    return parcours[chemin] || [introduction, ...navigation];
}
