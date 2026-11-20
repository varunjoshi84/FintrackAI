const CACHE_KEY = "fintrack_insights_cache";

/**
 * Generates AI insights by calling the secure backend endpoint.
 * Keeps Hugging Face API keys and third-party credentials strictly on the backend.
 */
export async function generateSavingsInsights(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, count, timestamp } = JSON.parse(cached);
      const isFresh = Date.now() - timestamp < 1000 * 60 * 60 * 24; // 24 hours
      if (count === transactions.length && isFresh) {
        return data;
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    const spendingByCategory = {};
    let totalSpending = 0;
    let totalIncome = 0;

    transactions.forEach((tx) => {
      if (tx.type === "debit") {
        const category = tx.category || "Other";
        if (!spendingByCategory[category]) spendingByCategory[category] = 0;
        spendingByCategory[category] += tx.amount;
        totalSpending += tx.amount;
      } else if (tx.type === "credit") {
        totalIncome += tx.amount;
      }
    });

    const categoryBreakdown = Object.entries(spendingByCategory)
      .map(
        ([cat, amt]) =>
          `${cat}: ₹${amt.toFixed(2)} (${((amt / totalSpending) * 100).toFixed(1)}%)`
      )
      .join("\n");

    const token = localStorage.getItem('authToken');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const response = await fetch(`${apiUrl}/insights/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        transactions,
        categoryBreakdown,
        totalIncome,
        totalSpending,
      }),
    });

    if (!response.ok) {
      throw new Error(`Insights API error: ${response.status}`);
    }

    const result = await response.json();
    const insights = result.insights || [];

    if (insights.length > 0) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: insights,
          count: transactions.length,
          timestamp: Date.now(),
        })
      );
    }

    return insights;
  } catch (error) {
    console.error("Error generating insights:", error.message);
    return [
      {
        title: "Track Monthly Subscriptions",
        description: "Review recurring debits to identify unused services and optimize household cashflow.",
        category: "Utilities",
        savingPotential: 500,
      },
      {
        title: "Build Emergency Cushion",
        description: "Set aside a minimum of 10-15% from every income deposit toward a liquid reserve fund.",
        category: "Savings",
        savingPotential: 2000,
      },
    ];
  }
}

export const generateInsights = generateSavingsInsights;
export default generateSavingsInsights;
