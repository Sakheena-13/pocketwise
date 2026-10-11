import { getAvailableBalance, addSimulation } from "./state.js";
import { formatCurrency, escapeHTML } from "./format.js";

export function setupSimulator(showToast) {
  const nameInput = document.getElementById("simName");
  const amountInput = document.getElementById("simAmount");
  const frequencyInput = document.getElementById("simFrequency");
  const categoryInput = document.getElementById("simCategory");
  const result = document.getElementById("simulationResult");
  const runButton = document.getElementById("runSimulationBtn");

  runButton.addEventListener("click", runSimulation);

  // Handle the quick scenario buttons
  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => {
      nameInput.value = button.dataset.name || "";
      amountInput.value = button.dataset.amount || "";
      frequencyInput.value = button.dataset.frequency || "once";

      runSimulation();
    });
  });

  function runSimulation() {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const frequency = frequencyInput.value;
    const category = categoryInput.value;

    if (!name) {
      showToast("Please enter a name for your expense.");
      nameInput.focus();
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Please enter an amount greater than ₹0.");
      amountInput.focus();
      return;
    }

    // Estimate the expense over a one-month period.
    let projectedCost = amount;

    if (frequency === "weekly") {
      projectedCost = amount * 4;
    }

    const currentBalance = getAvailableBalance();
    const futureBalance = currentBalance - projectedCost;
    const isAffordable = futureBalance >= 0;

    let frequencyLabel = "one-time expense";

    if (frequency === "weekly") {
      frequencyLabel = "weekly expense, estimated over 4 weeks";
    } else if (frequency === "monthly") {
      frequencyLabel = "monthly expense";
    }

    const statusClass = isAffordable ? "success" : "danger";

    const statusMessage = isAffordable
      ? "This expense fits within your available balance."
      : "This expense exceeds your available balance.";

    result.innerHTML = `
      <div class="simulation-summary">
        <h3>${escapeHTML(name)}</h3>
        <p class="muted">${escapeHTML(category)} · ${frequencyLabel}</p>

        <div class="simulation-metrics">
          <div class="simulation-metric">
            <span>Current balance</span>
            <strong>${formatCurrency(currentBalance)}</strong>
          </div>

          <div class="simulation-metric">
            <span>Projected expense</span>
            <strong>${formatCurrency(projectedCost)}</strong>
          </div>

          <div class="simulation-metric">
            <span>Balance afterward</span>
            <strong class="${statusClass}">
              ${formatCurrency(futureBalance)}
            </strong>
          </div>
        </div>

        <div class="simulation-notice ${statusClass}">
          ${statusMessage}
        </div>

        <p class="muted simulation-note">
          This is a simulation only. Your actual balance and transactions
          have not been changed.
        </p>
      </div>
    `;

    // Save the scenario in simulation history.
    addSimulation({
      name,
      amount,
      frequency,
      category,
      projectedCost,
      currentBalance,
      futureBalance,
      isAffordable,
      createdAt: new Date().toISOString()
    });

    showToast("Simulation complete!");
  }
}
