import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Les fichiers uploadés (logo...) sont renvoyés en chemin relatif (/uploads/...) par le
// serveur : en local frontend et backend partagent la même origine implicite, mais en
// production (frontend sur Vercel, backend sur Railway) ce chemin doit être résolu contre
// l'URL du backend, pas celle du frontend.
export function resoudreUrlFichier(chemin) {
    if (!chemin) return chemin;
    if (/^(https?:|blob:|data:)/.test(chemin)) return chemin;
    return `${API_URL}${chemin}`;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 402 = abonnement expiré / essai terminé (voir intergiciels/verifierAbonnement.js côté serveur)
api.interceptors.response.use(
    (response) => response,
    (erreur) => {
        if (erreur.response?.status === 402) {
            window.dispatchEvent(new CustomEvent("abonnement-bloque", { detail: erreur.response.data }));
        }
        return Promise.reject(erreur);
    }
);

export default api;