import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../styles/composants/_dialog.scss";

const DialogContexte = createContext(null);

export function DialogProvider({ children }) {
    const { t } = useTranslation();
    const [dialogue, setDialogue] = useState(null);
    const resolveRef = useRef(null);

    const fermer = useCallback((resultat) => {
        if (resolveRef.current) {
            resolveRef.current(resultat);
            resolveRef.current = null;
        }
        setDialogue(null);
    }, []);

    const confirmer = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setDialogue({ type: "confirm", message, ...options });
        });
    }, []);

    const alerter = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setDialogue({ type: "alert", message, ...options });
        });
    }, []);

    return (
        <DialogContexte.Provider value={{ confirmer, alerter }}>
            {children}

            {dialogue && createPortal(
                <div
                    className="dialog-overlay"
                    onClick={() => fermer(dialogue.type === "confirm" ? false : undefined)}
                >
                    <div
                        className={`dialog dialog--${dialogue.variante === "danger" ? "danger" : "info"}`}
                        onClick={(e) => e.stopPropagation()}
                        role="alertdialog"
                        aria-modal="true"
                    >
                        <span className="dialog__icone">
                            {dialogue.icone || (dialogue.variante === "danger" ? "⚠️" : dialogue.type === "confirm" ? "❓" : "ℹ️")}
                        </span>

                        {dialogue.titre && <h3>{dialogue.titre}</h3>}
                        <p>{dialogue.message}</p>

                        <div className="dialog__actions">
                            {dialogue.type === "confirm" && (
                                <button
                                    type="button"
                                    className="dialog__btn dialog__btn--fantome"
                                    onClick={() => fermer(false)}
                                >
                                    {t("commun.annuler")}
                                </button>
                            )}
                            <button
                                type="button"
                                className={`dialog__btn ${dialogue.variante === "danger" ? "dialog__btn--danger" : "dialog__btn--primaire"}`}
                                onClick={() => fermer(dialogue.type === "confirm" ? true : undefined)}
                                autoFocus
                            >
                                {dialogue.type === "confirm" ? (dialogue.texteConfirmer || t("commun.confirmer")) : "OK"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </DialogContexte.Provider>
    );
}

export function useDialog() {
    return useContext(DialogContexte);
}
