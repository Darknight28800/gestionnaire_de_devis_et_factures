import { createPortal } from "react-dom";
import "../styles/composants/_modal.scss";

export default function Modal({ open, title, children, onClose, taille }) {
    if (!open) return null;

    const classeTaille = taille ? `modal--${taille}` : "";

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal ${classeTaille}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal__close" onClick={onClose} aria-label="Fermer">
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
