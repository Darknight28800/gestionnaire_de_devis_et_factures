// Durée de la période d'essai gratuite, en jours.
export const DUREE_ESSAI_JOURS = 7;

// Statuts possibles de l'abonnement de l'installation.
export const STATUTS_ABONNEMENT = {
    ATTENTE_CARTE: "attente_carte", // premier compte créé, carte pas encore enregistrée
    ESSAI: "essai",                 // période d'essai en cours (carte enregistrée)
    ACTIF: "actif",                 // abonnement payant actif
    IMPAYE: "impaye",               // paiement échoué après l'essai
    ANNULE: "annule"                // abonnement résilié
};

// Statuts qui donnent accès à l'application.
export const STATUTS_AUTORISES = [STATUTS_ABONNEMENT.ESSAI, STATUTS_ABONNEMENT.ACTIF];
