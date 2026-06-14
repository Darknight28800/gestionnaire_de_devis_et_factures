export default function Erreur500() {
    return (
        <div className="page page-erreur">
            <h1 className="erreur-code">500</h1>
            <p className="erreur-message">Une erreur interne est survenue.</p>

            <a href="/" className="erreur-btn">Retour au tableau de bord</a>
        </div>
    );
}
