import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import "../../styles/pages/_tableauDeBord.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function TableauDeBord() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [recentDevis, setRecentDevis] = useState([]);
    const [recentFactures, setRecentFactures] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [erreur, setErreur] = useState(null);

    /* Observer le changement de thème (dark/light) */
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.body.classList.contains("dark");
            setTheme(isDark ? "dark" : "light");
        });

        observer.observe(document.body, { attributes: true });
        return () => observer.disconnect();
    }, []);

    /* Charger les stats */
    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get("/tableau-de-bord/statistiques");

                setStats(res.data.stats);
                setRecentDevis(res.data.recent_devis);
                setRecentFactures(res.data.recent_factures);
            } catch (err) {
                console.error("Erreur lors du chargement du tableau de bord :", err);
                setErreur(
                    err.response?.status === 401
                        ? t("dashboard.sessionExpiree")
                        : t("dashboard.erreurChargement")
                );
            }
        };

        charger();
    }, [t]);

    if (erreur) return <p className="dashboard__erreur">{erreur}</p>;
    if (!stats) return <p>{t("commun.chargement")}</p>;

    /* Couleurs dynamiques selon le thème */
    const textColor = theme === "dark" ? "#f8fafc" : "#111827";
    const gridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    /* BAR CHART */
    const barData = {
        labels: [t("dashboard.devis"), t("dashboard.factures")],
        datasets: [
            {
                label: t("dashboard.nombre"),
                data: [stats.total_devis, stats.total_factures],
                backgroundColor: ["#2563eb", "#10b981"]
            }
        ]
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { labels: { color: textColor } }
        },
        scales: {
            x: {
                ticks: { color: textColor },
                grid: { color: gridColor }
            },
            y: {
                ticks: { color: textColor },
                grid: { color: gridColor }
            }
        }
    };

    /* DOUGHNUT */
    const donutData = {
        labels: [t("dashboard.payees"), t("dashboard.nonPayees")],
        datasets: [
            {
                data: [stats.factures_payees, stats.factures_non_payees],
                backgroundColor: ["#10b981", "#ef4444"]
            }
        ]
    };

    const donutOptions = {
        plugins: {
            legend: {
                labels: { color: textColor }
            }
        }
    };

    return (
        <div className="dashboard">

            {/* TITRE */}
            <h1 className="dashboard__title">{t("nav.tableauDeBord")}</h1>

            {/* CARTES PREMIUM */}
            <div className="dashboard__cards" data-tour="dashboard-cartes">
                <div className="card card--violet">
                    <div className="card__icon">👥</div>
                    <div className="card__info">
                        <h3>{stats.total_clients}</h3>
                        <p>{t("nav.clients")}</p>
                    </div>
                </div>

                <div className="card card--bleu">
                    <div className="card__icon">📄</div>
                    <div className="card__info">
                        <h3>{stats.total_devis}</h3>
                        <p>{t("dashboard.devis")}</p>
                    </div>
                </div>

                <div className="card card--ambre">
                    <div className="card__icon">💰</div>
                    <div className="card__info">
                        <h3>{stats.total_factures}</h3>
                        <p>{t("dashboard.factures")}</p>
                    </div>
                </div>

                <div className="card card--bleu">
                    <div className="card__icon">✔️</div>
                    <div className="card__info">
                        <h3>{stats.factures_payees}</h3>
                        <p>{t("dashboard.payees")}</p>
                    </div>
                </div>

                <div className="card card--rose">
                    <div className="card__icon">⏳</div>
                    <div className="card__info">
                        <h3>{stats.factures_non_payees}</h3>
                        <p>{t("dashboard.nonPayees")}</p>
                    </div>
                </div>

                <div className="card card--vert">
                    <div className="card__icon">💵</div>
                    <div className="card__info">
                        <h3>{stats.montant_total} €</h3>
                        <p>{t("dashboard.totalFacture")}</p>
                    </div>
                </div>

                <div className="card card--vert">
                    <div className="card__icon">🟢</div>
                    <div className="card__info">
                        <h3>{stats.montant_paye} €</h3>
                        <p>{t("dashboard.montantPaye")}</p>
                    </div>
                </div>

                <div className="card card--jaune">
                    <div className="card__icon">🟡</div>
                    <div className="card__info">
                        <h3>{stats.montant_attente} €</h3>
                        <p>{t("dashboard.enAttente")}</p>
                    </div>
                </div>
            </div>

            {/* GRAPHIQUES PREMIUM */}
            <div className="dashboard__charts" data-tour="dashboard-graphiques">

                {/* BAR CHART */}
                <div className="chart">
                    <h3>{t("dashboard.devisVsFactures")}</h3>
                    <Bar data={barData} options={barOptions} />
                </div>

                {/* DOUGHNUT */}
                <div className="chart">
                    <h3>{t("dashboard.repartitionFactures")}</h3>
                    <Doughnut data={donutData} options={donutOptions} />
                </div>
            </div>

            {/* LISTES PREMIUM */}
            <div className="dashboard__lists" data-tour="dashboard-listes">

                {/* DERNIERS DEVIS */}
                <div className="list">
                    <h3>{t("dashboard.derniersDevis")}</h3>
                    <ul>
                        {recentDevis.map((d) => (
                            <li key={d.id}>
                                <span>#{d.id}</span>
                                <span>{d.client_nom}</span>
                                <span>{new Date(d.date_creation).toLocaleDateString()}</span>
                                <span>{d.montant || "—"} €</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* DERNIÈRES FACTURES */}
                <div className="list">
                    <h3>{t("dashboard.dernieresFactures")}</h3>
                    <ul>
                        {recentFactures.map((f) => (
                            <li key={f.id}>
                                <span>#{f.id}</span>
                                <span>{f.client_nom}</span>
                                <span className={f.statut === "payee" ? "statut-payee" : "statut-non-payee"}>
                                    {t(`statuts.facture.${f.statut}`, f.statut)}
                                </span>
                                <span>{f.montant} €</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
