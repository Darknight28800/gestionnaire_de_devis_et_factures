import { useEffect } from "react";
import "../styles/composants/_toast.scss";

export default function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`toast toast--${type}`}>
            {message}
        </div>
    );
}
