import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "../../styles/pages/_factures.scss";

export default function Factures() {
    const [factures, setFactures] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const charger = async () => {
            try {
                const res = await api.get(
                    `/factures?search=${search}&page=${page}&limit=5&sort=date_facture&order=desc`
                );

                setFactures(res.data.factures);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Erreur lors du chargement des factures :", err);
            }
        };

        charger();
    }, [search, page]);


    return (
        <div className="factures-page">

            {/* HEADER PREMIUM */}
            <div className="factures-header">
                <h1>Factures</h1>

                <input
                    type="text"
                    className="input-search"
                    placeholder="Rechercher une facture..."
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                />
            </div>

            {/* TABLE PREMIUM */}
            <table className="table-factures">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Détails</th>
                    </tr>
                </thead>

                <tbody>
                    {factures.map((f) => (
                        <tr key={f.id}>
                            <td>#{f.id}</td>
                            <td>{f.montant} €</td>
                            <td>{new Date(f.date_facture).toLocaleDateString()}</td>

                            <td>
                                <span className={`statut statut--${f.statut}`}>
                                    {f.statut}
                                </span>
                            </td>

                            <td>
                                <Link className="btn-lien" to={`/factures/${f.id}`}>
                                    Voir →
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAGINATION PREMIUM */}
            <div className="pagination">
                <button
                    className="btn-texte"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    ← Précédent
                </button>

                <span className="pagination__info">
                    Page {page} / {totalPages}
                </span>

                <button
                    className="btn-texte"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
}
