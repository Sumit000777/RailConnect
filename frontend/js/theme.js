/**
 * theme.js
 * Handles the Dark / Light theme toggle. Persists the choice in
 * localStorage so it's remembered across pages and visits.
 */
(function () {
  const STORAGE_KEY = "rms_theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeBtn === theme);
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    applyTheme(saved);

    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.themeBtn;
        localStorage.setItem(STORAGE_KEY, theme);
        applyTheme(theme);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initTheme);
})();
