export default function Erreur401() {
    return (
        <div className="page page-erreur">
            <h1 className="erreur-code">401</h1>
            <p className="erreur-message">Vous devez être connecté pour accéder à cette page.</p>

            <a href="/connexion" className="erreur-btn">Se connecter</a>
        </div>
    );
}
