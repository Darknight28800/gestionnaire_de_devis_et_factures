import { useEffect, useState } from "react";
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
    const [stats, setStats] = useState(null);
    const [recentDevis, setRecentDevis] = useState([]);
    const [recentFactures, setRecentFactures] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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
            }
        };

        charger();
    }, []);

    if (!stats) return <p>Chargement...</p>;

    /* Couleurs dynamiques selon le thème */
    const textColor = theme === "dark" ? "#f8fafc" : "#111827";
    const gridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    /* BAR CHART */
    const barData = {
        labels: ["Devis", "Factures"],
        datasets: [
            {
                label: "Nombre",
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
        labels: ["Payées", "Non payées"],
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
            <h1 className="dashboard__title">Tableau de bord</h1>

            {/* CARTES PREMIUM */}
            <div className="dashboard__cards">
                <div className="card">
                    <div className="card__icon">👥</div>
                    <div className="card__info">
                        <h3>{stats.total_clients}</h3>
                        <p>Clients</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">📄</div>
                    <div className="card__info">
                        <h3>{stats.total_devis}</h3>
                        <p>Devis</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">💰</div>
                    <div className="card__info">
                        <h3>{stats.total_factures}</h3>
                        <p>Factures</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">✔️</div>
                    <div className="card__info">
                        <h3>{stats.factures_payees}</h3>
                        <p>Payées</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">⏳</div>
                    <div className="card__info">
                        <h3>{stats.factures_non_payees}</h3>
                        <p>Non payées</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">💵</div>
                    <div className="card__info">
                        <h3>{stats.montant_total} €</h3>
                        <p>Total facturé</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">🟢</div>
                    <div className="card__info">
                        <h3>{stats.montant_paye} €</h3>
                        <p>Montant payé</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card__icon">🟡</div>
                    <div className="card__info">
                        <h3>{stats.montant_attente} €</h3>
                        <p>En attente</p>
                    </div>
                </div>
            </div>

            {/* GRAPHIQUES PREMIUM */}
            <div className="dashboard__charts">

                {/* BAR CHART */}
                <div className="chart">
                    <h3>Devis vs Factures</h3>
                    <Bar data={barData} options={barOptions} />
                </div>

                {/* DOUGHNUT */}
                <div className="chart">
                    <h3>Répartition des factures</h3>
                    <Doughnut data={donutData} options={donutOptions} />
                </div>
            </div>

            {/* LISTES PREMIUM */}
            <div className="dashboard__lists">

                {/* DERNIERS DEVIS */}
                <div className="list">
                    <h3>Derniers devis</h3>
                    <ul>
                        {recentDevis.map((d) => (
                            <li key={d.id}>
                                <span>#{d.id}</span>
                                <span>Client {d.client_id}</span>
                                <span>{new Date(d.date_creation).toLocaleDateString()}</span>
                                <span>{d.montant || "—"} €</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* DERNIÈRES FACTURES */}
                <div className="list">
                    <h3>Dernières factures</h3>
                    <ul>
                        {recentFactures.map((f) => (
                            <li key={f.id}>
                                <span>#{f.id}</span>
                                <span>Devis {f.devis_id}</span>
                                <span className={f.statut === "payee" ? "statut-payee" : "statut-non-payee"}>
                                    {f.statut}
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
