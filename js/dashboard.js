import {
  getState,
  getSpent,
  getIncome,
  getSaved,
  getAvailableBalance,
  getBudgetRemaining,
  getUnpaidCommitments
} from "./state.js";

import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  getPercentage,
  escapeHTML
} from "./format.js";

export function renderDashboard() {
  const state = getState();

  // Update the main financial summary.
  document.getElementById("availableBalance").textContent =
    formatCurrency(getAvailableBalance());

  document.getElementById("totalSpent").textContent =
    formatCurrency(getSpent());

  document.getElementById("totalSaved").textContent =
    formatCurrency(getSaved());

  document.getElementById("budgetRemaining").textContent =
    formatCurrency(getBudgetRemaining());

  renderRecentTransactions(state);
  renderSpendingBreakdown(state);
  renderUpcomingCommitments(state);
  renderHealthPreview(state);
}

function renderRecentTransactions(state) {
  const container = document.getElementById("recentTransactions");

  if (!state.transactions.length) {
    container.innerHTML = `
      <p class="empty-state">
        No transactions yet. Add your first transaction to get started.
      </p>
    `;
    return;
  }

  container.innerHTML = state.transactions
    .slice(0, 5)
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
        </div>
      `;
    })
    .join("");
}

function renderSpendingBreakdown(state) {
  const container = document.getElementById("spendingBreakdown");

  const expenses = state.transactions.filter(
    transaction => transaction.type === "expense"
  );

  const totals = {};

  expenses.forEach(transaction => {
    const category = transaction.category || "Other";
    totals[category] = (totals[category] || 0) + transaction.amount;
  });

  const totalSpent = getSpent();

  if (totalSpent === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Your spending breakdown will appear after you record expenses.
      </p>
    `;
    return;
  }

  container.innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const percentage = getPercentage(amount, totalSpent);

      return `
        <div class="breakdown-item">
          <div class="breakdown-heading">
            <span>
              ${getCategoryIcon(category)}
              ${escapeHTML(category)}
            </span>
            <strong>${formatCurrency(amount)}</strong>
          </div>

          <div class="progress-track">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>

          <div class="breakdown-heading">
            <span>${percentage.toFixed(0)}% of spending</span>
            <span>${formatCurrency(amount)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderUpcomingCommitments(state) {
  const container = document.getElementById("upcomingCommitments");

  const commitments = state.commitments
    .filter(commitment => !commitment.paid)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;

      return a.date.localeCompare(b.date);
    })
    .slice(0, 4);

  if (!commitments.length) {
    container.innerHTML = `
      <p class="empty-state">
        No pending commitments. You're all caught up!
      </p>
    `;
    return;
  }

  container.innerHTML = commitments
    .map(commitment => `
      <div class="commitment-row">
        <div class="commitment-info">
          <strong>${escapeHTML(commitment.name)}</strong>
          <small>${formatDate(commitment.date)}</small>
        </div>

        <div class="commitment-meta">
          <strong>${formatCurrency(commitment.amount)}</strong>
          <span class="status-pill status-pending">Pending</span>
        </div>
      </div>
    `)
    .join("");
}

function renderHealthPreview(state) {
  const container = document.getElementById("healthPreview");

  const startingBalance = state.startingBalance;
  const spent = getSpent();
  const saved = getSaved();
  const balance = getAvailableBalance();
  const unpaid = getUnpaidCommitments();

  let score = 100;

  if (startingBalance > 0) {
    score -= Math.min(45, (spent / startingBalance) * 45);
    score -= Math.min(30, (unpaid / startingBalance) * 30);
  }

  if (balance < 0) {
    score -= 25;
  }

  if (saved > 0 && balance >= 0) {
    score += Math.min(10, (saved / startingBalance) * 10);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  let status = "Needs attention";

  if (score >= 80) {
    status = "Looking healthy";
  } else if (score >= 60) {
    status = "Room to improve";
  }

  container.innerHTML = `
    <div class="health-preview">
      <div class="health-score-circle">
        <strong>${score}</strong>
      </div>

      <div>
        <strong>${status}</strong>
        <p>
          ${formatCurrency(balance)} available and
          ${formatCurrency(saved)} saved.
        </p>
      </div>
    </div>

    <button
      class="text-button"
      data-section="health"
      style="margin-top: 16px"
    >
      View financial health →
    </button>
  `;
}
