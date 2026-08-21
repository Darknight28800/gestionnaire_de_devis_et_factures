import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../styles/composants/_modal.scss";

export default function Modal({ open, title, children, onClose, taille }) {
    const { t } = useTranslation();
    if (!open) return null;

    const classeTaille = taille ? `modal--${taille}` : "";

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal ${classeTaille}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal__close" onClick={onClose} aria-label={t("commun.fermer")}>
                    ✕
                </button>

                {title && <h2>{title}</h2>}

                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
