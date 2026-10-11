import {
  getState,
  getSpent,
  getIncome,
  getSaved,
  getAvailableBalance,
  getUnpaidCommitments
} from "./state.js";

import {
  formatCurrency,
  escapeHTML,
  getPercentage
} from "./format.js";

export function calculateFinancialHealth() {
  const state = getState();

  const startingBalance = Number(state.startingBalance) || 0;
  const income = getIncome();
  const spent = getSpent();
  const saved = getSaved();
  const balance = getAvailableBalance();

  const unpaidCommitments = getUnpaidCommitments();

  const upcomingTotal = unpaidCommitments.reduce(
    (total, commitment) => total + Number(commitment.amount || 0),
    0
  );

  // Calculate the share of starting funds spent.
  const spendingPercentage = getPercentage(
    spent,
    startingBalance + income
  );

  // Calculate the share of starting funds saved.
  const savingsPercentage = getPercentage(
    saved,
    startingBalance + income
  );

  // Calculate the balance remaining after planned commitments.
  const balanceAfterCommitments = balance - upcomingTotal;

  let score = 100;

  // Spending reduces the score when a large share of funds is used.
  if (spendingPercentage > 50) {
    score -= Math.min(25, Math.round((spendingPercentage - 50) / 2));
  }

  // Having savings improves the score.
  if (savingsPercentage >= 20) {
    score += 10;
  } else if (savingsPercentage >= 10) {
    score += 5;
  }

  // Unpaid commitments that exceed the current balance create risk.
  if (balanceAfterCommitments < 0) {
    score -= 30;
  } else if (upcomingTotal > 0 && balanceAfterCommitments < balance * 0.2) {
    score -= 10;
  }

  // A negative balance is a major warning.
  if (balance < 0) {
    score = Math.min(score, 20);
  }

  score = Math.max(0, Math.min(100, score));

  let rating = "Needs attention";
  let message = "Review your spending and upcoming expenses.";

  if (score >= 80) {
    rating = "Healthy";
    message = "Your finances look relatively stable based on the current data.";
  } else if (score >= 60) {
    rating = "Fair";
    message = "You are on your way. Keep tracking spending and building savings.";
  } else if (score >= 40) {
    rating = "At risk";
    message = "Review non-essential expenses and plan for upcoming commitments.";
  }

  return {
    score,
    rating,
    message,
    startingBalance,
    income,
    spent,
    saved,
    balance,
    spendingPercentage,
    savingsPercentage,
    upcomingTotal,
    balanceAfterCommitments
  };
}

export function renderFinancialHealth() {
  const container = document.getElementById("financialHealthDetails");

  if (!container) return;

  const health = calculateFinancialHealth();

  const scoreClass =
    health.score >= 80
      ? "success"
      : health.score >= 60
        ? "warning"
        : "danger";

  container.innerHTML = `
    <div class="health-score-panel">
      <div class="health-score-circle ${scoreClass}">
        <span class="health-score-number">${health.score}</span>
        <span class="health-score-label">out of 100</span>
      </div>

      <div class="health-score-description">
        <h3>${escapeHTML(health.rating)}</h3>
        <p>${escapeHTML(health.message)}</p>
        <p class="muted">
          This is an illustrative score based on your current app data,
          not a professional financial assessment.
        </p>
      </div>
    </div>

    <div class="health-details-grid">
      <article class="health-detail-card">
        <span>Starting balance</span>
        <strong>${formatCurrency(health.startingBalance)}</strong>
      </article>

      <article class="health-detail-card">
        <span>Additional income</span>
        <strong>${formatCurrency(health.income)}</strong>
      </article>

      <article class="health-detail-card">
        <span>Total spent</span>
        <strong>${formatCurrency(health.spent)}</strong>
        <p>${health.spendingPercentage}% of available funds used</p>
      </article>

      <article class="health-detail-card">
        <span>Total saved</span>
        <strong>${formatCurrency(health.saved)}</strong>
        <p>${health.savingsPercentage}% saved</p>
      </article>

      <article class="health-detail-card">
        <span>Available balance</span>
        <strong class="${health.balance < 0 ? "danger" : "success"}">
          ${formatCurrency(health.balance)}
        </strong>
      </article>

      <article class="health-detail-card">
        <span>Upcoming commitments</span>
        <strong>${formatCurrency(health.upcomingTotal)}</strong>
      </article>

      <article class="health-detail-card">
        <span>Balance after commitments</span>
        <strong class="${health.balanceAfterCommitments < 0 ? "danger" : "success"}">
          ${formatCurrency(health.balanceAfterCommitments)}
        </strong>
      </article>
    </div>

    <div class="health-recommendations">
      <h3>Suggestions for you</h3>
      <ul>
        ${getRecommendations(health)
          .map((recommendation) => `<li>${escapeHTML(recommendation)}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function getRecommendations(health) {
  const recommendations = [];

  if (health.balanceAfterCommitments < 0) {
    recommendations.push(
      "Your planned commitments exceed your available balance. Review their timing and amounts before spending more."
    );
  } else if (
    health.upcomingTotal > 0 &&
    health.balanceAfterCommitments < health.balance * 0.2
  ) {
    recommendations.push(
      "Upcoming commitments will use most of your remaining balance. Consider postponing optional purchases."
    );
  }

  if (health.spendingPercentage > 70) {
    recommendations.push(
      "A large share of your available funds has been spent. Review your transaction history to identify areas where you can cut back."
    );
  }

  if (health.savingsPercentage < 10) {
    recommendations.push(
      "Consider setting a realistic savings target that fits your essential expenses and current budget."
    );
  }

  if (health.saved > 0) {
    recommendations.push(
      "Keep tracking your savings contributions so you can see your progress toward your goals."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Keep recording expenses, planning commitments, and reviewing your balance regularly."
    );
  }

  return recommendations;
}
