export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

export function formatDate(dateString) {
  if (!dateString) {
    return "Date not set";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date not set";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function getCategoryIcon(category) {
  const icons = {
    Food: "🍔",
    Transport: "🚌",
    Education: "📚",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Bills: "🧾",
    Subscription: "📱",
    Salary: "💼",
    Savings: "🐷",
    Health: "💊",
    Other: "💳"
  };

  return icons[category] || "💳";
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

export function getPercentage(part, total) {
  if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
    return 0;
  }

  const percentage = (Number(part) / Number(total)) * 100;

  return Math.max(0, Math.min(100, percentage));
}

export function createId(prefix = "item") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}