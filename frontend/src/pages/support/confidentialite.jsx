export default function Confidentialite() {
    return (
        <div className="page page-legal">
            <h1>Politique de confidentialité</h1>
            <p className="page-legal__maj">Dernière mise à jour : [à compléter]</p>

            <section>
                <h2>Données collectées</h2>
                <p>
                    Dans le cadre de l'utilisation de l'application, nous collectons les données que vous
                    renseignez vous-même : informations de compte (nom, email), données de vos clients,
                    devis et factures, ainsi que les informations de paiement nécessaires à la gestion de
                    votre abonnement.
                </p>
            </section>

            <section>
                <h2>Utilisation des données</h2>
                <p>
                    Ces données sont utilisées exclusivement pour fournir le service : gestion de vos
                    devis et factures, authentification, facturation de votre abonnement et support.
                    Elles ne sont ni vendues ni partagées à des fins commerciales avec des tiers.
                </p>
            </section>

            <section>
                <h2>Conservation</h2>
                <p>
                    Les devis et factures archivés sont conservés 5 ans à compter de leur archivage, puis
                    supprimés définitivement. Les autres données sont conservées tant que votre compte est
                    actif.
                </p>
            </section>

            <section>
                <h2>Vos droits</h2>
                <p>
                    Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
                    suppression de vos données. Pour exercer ces droits, contactez-nous via le{" "}
                    <a href="/support">Centre d'aide</a>.
                </p>
            </section>
        </div>
    );
}
