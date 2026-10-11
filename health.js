import { renderFinancialHealth } from "./financial-health.js";

export function renderHealth() {
  renderFinancialHealth();
}

export function setupHealth() {
  const healthSection = document.getElementById("healthSection");

  if (!healthSection) {
    console.warn("Health section was not found.");
    return;
  }

  // Render the financial-health report when the page is opened.
  const healthNavButton = document.querySelector(
    '.nav-item[data-section="health"]'
  );

  if (healthNavButton) {
    healthNavButton.addEventListener("click", () => {
      renderHealth();
    });
  }

  // Display the initial report.
  renderHealth();
}