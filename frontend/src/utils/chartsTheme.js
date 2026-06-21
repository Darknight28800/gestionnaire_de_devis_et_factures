/* ============================
   MISE À JOUR DES CHARTS EN DARK MODE
============================ */

window.updateChartsTheme = function () {
    const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--texte")
        .trim();

    const gridColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--gris-300")
        .trim();

    if (window.myCharts) {
        window.myCharts.forEach(chart => {
            chart.options.plugins.legend.labels.color = textColor;

            if (chart.options.scales) {
                Object.values(chart.options.scales).forEach(scale => {
                    scale.ticks.color = textColor;
                    scale.grid.color = gridColor;
                });
            }

            chart.update();
        });
    }
};