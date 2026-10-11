import { initialData } from "../data/initial-data.js";
import { createId } from "./format.js";

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

let state = cloneData(initialData);

const listeners = new Set();

function notify() {
  listeners.forEach(listener => listener(state));
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function getSpent() {
  return state.transactions
    .filter(transaction => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getIncome() {
  return state.transactions
    .filter(transaction => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getSaved() {
  return state.goals.reduce((total, goal) => total + goal.saved, 0);
}

export function getPaidCommitments() {
  return state.commitments
    .filter(commitment => commitment.paid)
    .reduce((total, commitment) => total + commitment.amount, 0);
}

export function getUnpaidCommitments() {
  return state.commitments
    .filter(commitment => !commitment.paid)
    .reduce((total, commitment) => total + commitment.amount, 0);
}

export function getAvailableBalance() {
  return state.startingBalance + getIncome() - getSpent() - getSaved();
}

export function getBudgetRemaining() {
  return state.startingBalance - getSpent() - getSaved();
}

export function addTransaction(transaction) {
  const amount = Number(transaction.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid transaction amount.");
  }

  if (!["income", "expense"].includes(transaction.type)) {
    throw new Error("Choose a valid transaction type.");
  }

  if (transaction.type === "expense" && amount > getAvailableBalance()) {
    throw new Error("This expense exceeds your available balance.");
  }

  const newTransaction = {
    id: createId("transaction"),
    description: String(transaction.description || "Transaction").trim(),
    amount,
    type: transaction.type,
    category: transaction.category || "Other",
    date: transaction.date || new Date().toISOString().slice(0, 10)
  };

  state.transactions.unshift(newTransaction);
  notify();

  return newTransaction;
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter(
    transaction => transaction.id !== id
  );

  notify();
}

export function addCommitment(commitment) {
  const amount = Number(commitment.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid commitment amount.");
  }

  const newCommitment = {
    id: createId("commitment"),
    name: String(commitment.name || "Payment").trim(),
    amount,
    category: commitment.category || "Other",
    date: commitment.date || "",
    paid: false
  };

  state.commitments.push(newCommitment);
  notify();

  return newCommitment;
}

export function toggleCommitmentPaid(id) {
  const commitment = state.commitments.find(item => item.id === id);

  if (!commitment) {
    throw new Error("Commitment not found.");
  }

  if (!commitment.paid) {
    if (commitment.amount > getAvailableBalance()) {
      throw new Error("Not enough available balance to pay this commitment.");
    }

    commitment.paid = true;

    state.transactions.unshift({
      id: createId("transaction"),
      description: commitment.name,
      amount: commitment.amount,
      type: "expense",
      category: commitment.category,
      date: new Date().toISOString().slice(0, 10),
      commitmentId: commitment.id
    });
  } else {
    commitment.paid = false;

    state.transactions = state.transactions.filter(
      transaction => transaction.commitmentId !== commitment.id
    );
  }

  notify();
}

export function deleteCommitment(id) {
  state.commitments = state.commitments.filter(
    commitment => commitment.id !== id
  );

  notify();
}

export function addGoal(goal) {
  const target = Number(goal.target);
  const saved = Number(goal.saved) || 0;

  if (!Number.isFinite(target) || target <= 0) {
    throw new Error("Enter a valid savings target.");
  }

  if (!Number.isFinite(saved) || saved < 0 || saved > target) {
    throw new Error("Enter a valid amount already saved.");
  }

  if (saved > getAvailableBalance()) {
    throw new Error("Your starting contribution exceeds available balance.");
  }

  const newGoal = {
    id: createId("goal"),
    name: String(goal.name || "Savings goal").trim(),
    target,
    saved
  };

  state.goals.push(newGoal);
  notify();

  return newGoal;
}

export function contributeToGoal(id, amount) {
  const goal = state.goals.find(item => item.id === id);
  const contribution = Number(amount);

  if (!goal) {
    throw new Error("Savings goal not found.");
  }

  if (!Number.isFinite(contribution) || contribution <= 0) {
    throw new Error("Enter a valid contribution amount.");
  }

  if (contribution > getAvailableBalance()) {
    throw new Error("Not enough available balance.");
  }

  const remaining = goal.target - goal.saved;

  if (remaining <= 0) {
    throw new Error("This goal is already complete.");
  }

  goal.saved += Math.min(contribution, remaining);
  notify();
}

export function deleteGoal(id) {
  state.goals = state.goals.filter(goal => goal.id !== id);
  notify();
}

export function addSimulation(simulation) {
  state.simulationHistory.unshift({
    id: createId("simulation"),
    ...simulation,
    createdAt: new Date().toISOString()
  });

  state.simulationHistory = state.simulationHistory.slice(0, 20);
  notify();
}

export function resetState() {
  state = cloneData(initialData);
  notify();
}