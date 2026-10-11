// ========================================
// PocketWise - Main Application
// File: js/app.js
// ========================================

import { subscribe } from "./state.js";

import { renderDashboard } from "./dashboard.js";

import {
    renderTransactions,
    setupTransactionForm
} from "./transactions.js";

import {
    renderCommitments,
    setupCommitmentForm
} from "./commitments.js";

import {
    renderGoals,
    setupGoalForm
} from "./goals.js";

import { setupSimulator } from "./simulator.js";

import { renderFinancialHealth } from "./financial-health.js";

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // Navigation mapping
    // ========================================

    const sectionMap = {
        dashboard: "dashboardSection",
        transactions: "transactionsSection",
        commitments: "commitmentsSection",
        goals: "goalsSection",
        simulator: "simulatorSection",
        health: "healthSection"
    };

    const navigationLinks = document.querySelectorAll("[data-section]");
    const sections = document.querySelectorAll(".page-section");

    // ========================================
    // Navigation functionality
    // ========================================

    navigationLinks.forEach(link => {

        link.addEventListener("click", event => {
            event.preventDefault();

            const target = sectionMap[link.dataset.section];

            if (!target) {
                console.warn(
                    "Unknown navigation section:",
                    link.dataset.section
                );
                return;
            }

            sections.forEach(section => {
                section.classList.toggle(
                    "active",
                    section.id === target
                );

                section.classList.toggle(
                    "hidden",
                    section.id !== target
                );
            });

            // Update active navigation item.
            document.querySelectorAll(".navigation .nav-item")
                .forEach(navLink => {
                    navLink.classList.toggle(
                        "active",
                        navLink === link
                    );
                });

            // Update page heading.
            const headings = {
                dashboard: [
                    "Your money, in focus.",
                    "Make every rupee work smarter."
                ],
                transactions: [
                    "Your transactions.",
                    "Track money coming in and going out."
                ],
                commitments: [
                    "Stay ahead of your bills.",
                    "Keep track of upcoming payments."
                ],
                goals: [
                    "Make your goals happen.",
                    "Build your savings one step at a time."
                ],
                simulator: [
                    "Think before you spend.",
                    "Explore financial decisions before committing."
                ],
                health: [
                    "Your financial wellness.",
                    "Understand your financial habits."
                ]
            };

            const heading = headings[link.dataset.section];

            if (heading) {
                document.getElementById("pageTitle").textContent =
                    heading[0];

                document.getElementById("pageSubtitle").textContent =
                    heading[1];
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

    });

    // ========================================
    // Set today's transaction date
    // ========================================

    const transactionDate = document.getElementById("transactionDate");

    if (transactionDate) {
        const today = new Date();

        transactionDate.value =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }

    // ========================================
    // Close dialog buttons
    // ========================================

    document.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", () => {
            const dialog = document.getElementById(button.dataset.close);

            if (dialog && dialog.open) {
                dialog.close();
            }
        });
    });

    // ========================================
    // Toast notification
    // ========================================

    function showToast(message, isError = false) {
        const toast = document.getElementById("toast");

        if (!toast) {
            console.log(message);
            return;
        }

        toast.textContent = message;
        toast.classList.toggle("error", isError);
        toast.classList.add("show");

        clearTimeout(window.pocketWiseToastTimer);

        window.pocketWiseToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // ========================================
    // Initialize all feature modules
    // ========================================

    try {

        // Transaction form and buttons.
        // These functions handle their own button events.
        setupTransactionForm(showToast);

        // Commitments.
        setupCommitmentForm(showToast);

        // Savings goals.
        setupGoalForm(showToast);

        // Money Lab simulator.
        setupSimulator(showToast);

        // ========================================
        // Render all modules
        // ========================================

        function renderApplication() {
            renderDashboard();
            renderTransactions();
            renderCommitments();
            renderGoals();
            renderFinancialHealth();
        }

        // Initial rendering.
        renderApplication();

        // Automatically refresh after financial data changes.
        subscribe(() => {
            renderApplication();
        });

        console.log(
            "PocketWise application initialized successfully!"
        );

    } catch (error) {

        console.error(
            "PocketWise initialization failed:",
            error
        );

        showToast(
            "A feature failed to initialize. Check the browser console.",
            true
        );
    }

});