
import {
  getState,
  addTransaction,
  deleteTransaction
} from "./state.js";

import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  escapeHTML
} from "./format.js";

export function renderTransactions() {
  const container = document.getElementById("allTransactions");
  const state = getState();

  if (!state.transactions.length) {
    container.innerHTML = `
      <p class="empty-state">
        No transactions recorded yet. Click "Add transaction" to begin.
      </p>
    `;
    return;
  }

  container.innerHTML = state.transactions
    .map(transaction => {
      const isIncome = transaction.type === "income";
      const sign = isIncome ? "+" : "−";

      return `
        <div class="transaction-row">
          <div class="transaction-icon">
            ${getCategoryIcon(transaction.category)}
          </div>

          <div class="transaction-info">
            <strong>${escapeHTML(transaction.description)}</strong>
            <small>
              ${escapeHTML(transaction.category)} ·
              ${formatDate(transaction.date)}
            </small>
          </div>

          <div class="transaction-amount ${
            isIncome ? "amount-income" : "amount-expense"
          }">
            ${sign}${formatCurrency(transaction.amount)}
          </div>

          <button
            class="small-button danger"
            data-delete-transaction="${escapeHTML(transaction.id)}"
            aria-label="Delete transaction"
          >
            Delete
          </button>
        </div>
      `;
    })
    .join("");
}

export function setupTransactionForm(showToast) {
  const dialog = document.getElementById("transactionDialog");
  const form = document.getElementById("transactionForm");

  document.getElementById("addExpenseBtn").addEventListener("click", () => {
    openTransactionDialog(dialog, form);
  });

  document.getElementById("addTransactionPageBtn").addEventListener(
    "click",
    () => openTransactionDialog(dialog, form)
  );

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      addTransaction({
        description: formData.get("description"),
        amount: formData.get("amount"),
        type: formData.get("type"),
        category: formData.get("category"),
        date: formData.get("date")
      });

      form.reset();
      dialog.close();

      showToast("Transaction added successfully!");
    } catch (error) {
      showToast(error.message || "Could not add transaction.", true);
    }
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-delete-transaction]");

    if (!button) {
      return;
    }

    const id = button.dataset.deleteTransaction;
    const transaction = getState().transactions.find(item => item.id === id);

    if (!transaction) {
      showToast("Transaction not found.", true);
      return;
    }

    if (transaction.commitmentId) {
      showToast(
        "This transaction belongs to a paid commitment. Undo its payment in Commitments.",
        true
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${transaction.description}"?`
    );

    if (!confirmed) {
      return;
    }

    deleteTransaction(id);
    showToast("Transaction deleted.");
  });
}

function openTransactionDialog(dialog, form) {
  form.reset();

  const dateInput = document.getElementById("transactionDate");
  dateInput.value = new Date().toISOString().slice(0, 10);

  dialog.showModal();
}