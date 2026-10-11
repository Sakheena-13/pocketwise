import {
  getState,
  getUnpaidCommitments,
  addCommitment,
  toggleCommitmentPaid,
  deleteCommitment
} from "./state.js";

import {
  formatCurrency,
  formatDate,
  escapeHTML
} from "./format.js";

export function renderCommitments() {
  const commitmentsList = document.getElementById("commitmentsList");
  const { commitments } = getState();

  if (!commitments.length) {
    commitmentsList.innerHTML = `
      <div class="empty-state">
        <h3>No commitments yet</h3>
        <p>Add upcoming bills, subscriptions, or other planned expenses.</p>
      </div>
    `;
    return;
  }

  commitmentsList.innerHTML = commitments
    .map((commitment) => {
      const isPaid = Boolean(commitment.paid);

      return `
        <article class="commitment-row ${isPaid ? "is-paid" : ""}">
          <div class="commitment-main">
            <div class="commitment-icon">
              ${isPaid ? "✓" : "₹"}
            </div>

            <div class="commitment-info">
              <h3>${escapeHTML(commitment.name)}</h3>

              <p class="muted">
                ${escapeHTML(commitment.category || "Other")}
                ${commitment.date
                  ? ` · ${formatDate(commitment.date)}`
                  : ""}
              </p>

              <span class="status-badge ${isPaid ? "success" : "pending"}">
                ${isPaid ? "Paid" : "Upcoming"}
              </span>
            </div>
          </div>

          <div class="commitment-actions">
            <strong>${formatCurrency(commitment.amount)}</strong>

            <button
              type="button"
              class="btn ${isPaid ? "btn-secondary" : "btn-primary"} toggle-paid-button"
              data-id="${escapeHTML(commitment.id)}"
            >
              ${isPaid ? "Mark unpaid" : "Mark paid"}
            </button>

            <button
              type="button"
              class="icon-button delete-commitment-button"
              data-id="${escapeHTML(commitment.id)}"
              aria-label="Delete ${escapeHTML(commitment.name)}"
              title="Delete commitment"
            >
              ✕
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

export function setupCommitmentForm(showToast) {
  const dialog = document.getElementById("commitmentDialog");
  const form = document.getElementById("commitmentForm");
  const addButton = document.getElementById("addCommitmentBtn");
  const commitmentsList = document.getElementById("commitmentsList");

  addButton.addEventListener("click", () => {
    form.reset();
    dialog.showModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const amount = Number(formData.get("amount"));
    const date = String(formData.get("date") || "");
    const category = String(formData.get("category") || "Other");

    if (!name) {
      showToast("Please enter a commitment name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter an amount greater than ₹0.");
      return;
    }

    try {
      addCommitment({
        name,
        amount,
        date,
        category,
        paid: false
      });

      renderCommitments();
      form.reset();
      dialog.close();

      showToast("Commitment added successfully!");
    } catch (error) {
      showToast(error.message || "Could not add commitment.");
    }
  });

  commitmentsList.addEventListener("click", (event) => {
    const toggleButton = event.target.closest(".toggle-paid-button");
    const deleteButton = event.target.closest(".delete-commitment-button");

    if (toggleButton) {
      const commitmentId = toggleButton.dataset.id;

      try {
        toggleCommitmentPaid(commitmentId);
        renderCommitments();
        showToast("Commitment status updated.");
      } catch (error) {
        showToast(error.message || "Could not update commitment.");
      }

      return;
    }

    if (deleteButton) {
      const commitmentId = deleteButton.dataset.id;

      const confirmed = window.confirm(
        "Are you sure you want to delete this commitment?"
      );

      if (!confirmed) return;

      deleteCommitment(commitmentId);
      renderCommitments();
      showToast("Commitment deleted.");
    }
  });
}
