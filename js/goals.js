import {
  getState,
  addGoal,
  contributeToGoal,
  deleteGoal
} from "./state.js";

import {
  formatCurrency,
  escapeHTML,
  getPercentage
} from "./format.js";

export function renderGoals() {
  const goalsList = document.getElementById("goalsList");
  const { goals } = getState();

  if (!goals.length) {
    goalsList.innerHTML = `
      <div class="empty-state">
        <h3>No savings goals yet</h3>
        <p>Create a goal and start planning your savings!</p>
      </div>
    `;
    return;
  }

  goalsList.innerHTML = goals.map((goal) => {
    const target = Number(goal.target) || 0;
    const saved = Number(goal.saved) || 0;
    const percentage = getPercentage(saved, target);
    const remaining = Math.max(0, target - saved);

    return `
      <article class="goal-card">
        <div class="goal-card-header">
          <div>
            <h3>${escapeHTML(goal.name)}</h3>
            <p class="muted">Savings goal</p>
          </div>

          <button
            class="icon-button delete-goal-button"
            data-id="${escapeHTML(goal.id)}"
            aria-label="Delete ${escapeHTML(goal.name)}"
            title="Delete goal"
          >
            ✕
          </button>
        </div>

        <div class="goal-progress-info">
          <strong>${formatCurrency(saved)}</strong>
          <span>of ${formatCurrency(target)}</span>
        </div>

        <div
          class="progress-track"
          role="progressbar"
          aria-label="${escapeHTML(goal.name)} progress"
          aria-valuenow="${percentage}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="progress-fill"
            style="width: ${percentage}%"
          ></div>
        </div>

        <div class="goal-footer">
          <span>${percentage}% completed</span>
          <span>
            ${remaining > 0
              ? `${formatCurrency(remaining)} left`
              : "Goal achieved! 🎉"}
          </span>
        </div>

        ${
          remaining > 0
            ? `
              <form class="contribute-form" data-id="${escapeHTML(goal.id)}">
                <label for="contribution-${escapeHTML(goal.id)}">
                  Add to savings
                </label>

                <div class="contribute-controls">
                  <input
                    id="contribution-${escapeHTML(goal.id)}"
                    name="contribution"
                    type="number"
                    min="1"
                    max="${remaining}"
                    step="1"
                    placeholder="Amount in ₹"
                    required
                  />

                  <button class="btn btn-primary" type="submit">
                    Save
                  </button>
                </div>
              </form>
            `
            : ""
        }
      </article>
    `;
  }).join("");
}

export function setupGoalForm(showToast) {
  const dialog = document.getElementById("goalDialog");
  const form = document.getElementById("goalForm");
  const addButton = document.getElementById("addGoalBtn");

  addButton.addEventListener("click", () => {
    form.reset();
    dialog.showModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const target = Number(formData.get("target"));
    const saved = Number(formData.get("saved") || 0);

    if (!name) {
      showToast("Please enter a goal name.");
      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      showToast("Your target must be greater than ₹0.");
      return;
    }

    if (!Number.isFinite(saved) || saved < 0 || saved > target) {
      showToast("Enter savings between ₹0 and your target.");
      return;
    }

    try {
      addGoal({ name, target, saved });
      renderGoals();
      form.reset();
      dialog.close();
      showToast("Savings goal created!");
    } catch (error) {
      showToast(error.message || "Could not create the goal.");
    }
  });

  document.getElementById("goalsList").addEventListener("submit", (event) => {
    const form = event.target.closest(".contribute-form");

    if (!form) return;

    event.preventDefault();

    const goalId = form.dataset.id;
    const contribution = Number(
      new FormData(form).get("contribution")
    );

    if (!Number.isFinite(contribution) || contribution <= 0) {
      showToast("Enter a contribution greater than ₹0.");
      return;
    }

    try {
      contributeToGoal(goalId, contribution);
      renderGoals();
      showToast("Savings contribution added!");
    } catch (error) {
      showToast(error.message || "Could not add your contribution.");
    }
  });

  document.getElementById("goalsList").addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-goal-button");

    if (!deleteButton) return;

    const goalId = deleteButton.dataset.id;
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmed) return;

    deleteGoal(goalId);
    renderGoals();
    showToast("Savings goal deleted.");
  });
}
