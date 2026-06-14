import "../styles/composants/_modal.scss";

export default function Modal({ open, title, children, onClose }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <div className="modal__content">{children}</div>

                <button className="modal__close" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
}
