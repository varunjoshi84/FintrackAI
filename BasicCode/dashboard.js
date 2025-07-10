// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const transactionList = document.getElementById("transactionList");
  const addTransactionBtn = document.getElementById("addTransactionBtn");
  const transactionCountDisplay = document.getElementById("transactionCount");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const welcomeHeading = document.getElementById("welcomeHeading");
  const ctx = document.getElementById("spendingChart")?.getContext("2d");
  const categoryCtx = document.getElementById("categoryChart")?.getContext("2d");

  let transactionCount = transactionList?.children.length || 0;

  const categories = ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Other'];

  // 🎯 Random transaction generator with category
  const randomTransaction = () => {
    const amount = (Math.random() * 200 - 100).toFixed(2); // -100 to +100
    const today = new Date().toLocaleDateString("en-GB");
    const category = categories[Math.floor(Math.random() * categories.length)];

    return `
      <li class="flex justify-between items-center py-2 border-b border-slate-200">
        <span class="text-sm">${today}</span>
        <span class="text-sm font-medium">₹${amount}</span>
        <span class="text-xs text-gray-500">(${category})</span>
      </li>
    `;
  };

  // ➕ Handle Add Transaction
  addTransactionBtn?.addEventListener("click", () => {
    transactionList.insertAdjacentHTML("afterbegin", randomTransaction());
    transactionCount++;
    transactionCountDisplay.textContent = `${transactionCount} Transactions`;
  });

  // 🌙 Handle Dark Mode Toggle
  const applyDarkMode = (isDark) => {
    document.body.classList.toggle("dark-mode", isDark);
    if (themeIcon) {
      themeIcon.classList.toggle("fa-moon", !isDark);
      themeIcon.classList.toggle("fa-sun", isDark);
    }
  };

  // 🔄 On Load: Apply saved theme
  const savedTheme = localStorage.getItem("fintrack-theme");
  if (savedTheme === "dark") applyDarkMode(true);

  // 🌓 Theme Toggle Click Handler
  themeToggle?.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    applyDarkMode(isDark);
    localStorage.setItem("fintrack-theme", isDark ? "dark" : "light");
  });

  // 👋 Animate welcome heading if exists
  welcomeHeading?.classList.add("animate-fade-in-down");

  // 📊 Chart.js Line Chart: Spending Trend
  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "₹ Spent",
          data: [500, 300, 200, 800, 600, 450, 700],
          backgroundColor: "rgba(59,130,246,0.2)",
          borderColor: "rgba(59,130,246,1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // 🧁 Chart.js Pie Chart: Category Breakdown
  if (categoryCtx) {
    new Chart(categoryCtx, {
      type: "pie",
      data: {
        labels: ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Others'],
        datasets: [{
          label: 'Spending by Category',
          data: [300, 150, 100, 200, 120],
          backgroundColor: [
            '#3b82f6', // blue
            '#f97316', // orange
            '#10b981', // green
            '#facc15', // yellow
            '#a855f7'  // purple
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 13 } }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ₹${value}`;
              }
            }
          }
        }
      }
    });
  }
});
