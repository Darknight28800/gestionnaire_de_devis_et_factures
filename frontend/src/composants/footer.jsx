export default function Footer() {
    return (
        <footer className="footer-premium">
            <div className="footer-container">

                <div className="footer-col brand">
                    <h3>Mon Entreprise</h3>
                    <p>© {new Date().getFullYear()} — Tous droits réservés.</p>
                </div>

                <div className="footer-col">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/clients">Clients</a></li>
                        <li><a href="/devis">Devis</a></li>
                        <li><a href="/factures">Factures</a></li>
                        <li><a href="/parametres">Paramètres</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="/support">Centre d’aide</a></li>
                        <li><a href="/support/contact">Contact</a></li>
                        <li><a href="/support/mentions-legales">Mentions légales</a></li>
                        <li><a href="/support/confidentialite">Confidentialité</a></li>
                    </ul>
                </div>

            </div>
        </footer>
    );
}
