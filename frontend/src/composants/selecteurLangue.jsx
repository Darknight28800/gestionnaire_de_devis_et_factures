import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUES_DISPONIBLES } from "../i18n";
import "../styles/composants/_selecteurLangue.scss";

export default function SelecteurLangue({ className = "" }) {
    const { i18n, t } = useTranslation();
    const [ouvert, setOuvert] = useState(false);

    const langueActuelle = LANGUES_DISPONIBLES.find((l) => l.code === i18n.language) || LANGUES_DISPONIBLES[0];

    const choisir = (code) => {
        i18n.changeLanguage(code);
        setOuvert(false);
    };

    return (
        <div className={`selecteur-langue ${className} ${ouvert ? "selecteur-langue--ouvert" : ""}`}>
            <button
                type="button"
                className="selecteur-langue__bouton"
                onClick={() => setOuvert(!ouvert)}
                aria-label={t("langue.selectionner")}
                aria-expanded={ouvert}
            >
                <span className="selecteur-langue__drapeau">{langueActuelle.drapeau}</span>
                <span className="selecteur-langue__code">{langueActuelle.code.toUpperCase()}</span>
                <span className="selecteur-langue__chevron">⌄</span>
            </button>

            {ouvert && (
                <>
                    <div className="selecteur-langue__fond" onClick={() => setOuvert(false)} />
                    <div className="selecteur-langue__menu">
                        {LANGUES_DISPONIBLES.map((langue) => (
                            <button
                                key={langue.code}
                                type="button"
                                className={langue.code === langueActuelle.code ? "actif" : ""}
                                onClick={() => choisir(langue.code)}
                            >
                                <span className="selecteur-langue__drapeau">{langue.drapeau}</span>
                                <span>{langue.label}</span>
                                {langue.code === langueActuelle.code && (
                                    <span className="selecteur-langue__coche">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
