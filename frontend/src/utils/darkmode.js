/* ============================
   DARK MODE — VERSION REACT PREMIUM
============================ */

// 1) Appliquer le thème stocké AVANT le rendu React
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
} else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
}

// 2) Fonction d’activation du dark mode
export function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Mise à jour des charts si présents
    if (window.updateChartsTheme) {
        window.updateChartsTheme();
    }
}

// 3) Fonction pour récupérer l’état actuel
export function isDarkMode() {
    return document.documentElement.classList.contains("dark");
}
