export default function Erreur404() {
    return (
        <div className="page page-erreur">
            <h1 className="erreur-code">404</h1>
            <p className="erreur-message">La page que vous recherchez est introuvable.</p>

            <a href="/" className="erreur-btn">Retour au tableau de bord</a>
        </div>
    );
}
