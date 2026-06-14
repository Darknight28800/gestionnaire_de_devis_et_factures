export default function Erreur403() {
    return (
        <div className="page page-erreur">
            <h1 className="erreur-code">403</h1>
            <p className="erreur-message">Vous n’avez pas les permissions nécessaires.</p>

            <a href="/" className="erreur-btn">Retour au tableau de bord</a>
        </div>
    );
}
