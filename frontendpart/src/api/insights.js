const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct:cheapest"; // cheapest over fastest

const CACHE_KEY = "fintrack_insights_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Create a stable hash from transactions so we only re-call if data actually changed
const hashTransactions = (transactions) => {
  const str = transactions
    .map((tx) => `${tx.type}:${tx.amount}:${tx.category}`)
    .join("|");
  return str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0).toString();
};

export const generateInsights = async (transactions) => {
  //  Check cache first — skip API call if data hasn't changed within 24hrs
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    const currentHash = hashTransactions(transactions);

    if (
      cached &&
      cached.hash === currentHash &&
      Date.now() - cached.timestamp < CACHE_DURATION_MS
    ) {
      console.log("✅ Returning cached insights — no API call made");
      return { success: true, insights: cached.insights, fromCache: true };
    }
  } catch (_) {}

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

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a financial advisor. Respond ONLY with a valid JSON array. No markdown, no explanation, just raw JSON.",
            },
            {
              role: "user",
              content: `Give 3 money-saving insights as a JSON array.

Total Income: ₹${totalIncome.toFixed(2)}
Total Spending: ₹${totalSpending.toFixed(2)}
Categories:
${categoryBreakdown}

Format:
[{"title":"...","description":"...","category":"...","savingPotential": 1234}]`,
            },
          ],
          max_tokens: 512, // ✅ Reduced from 1024 — cuts cost by ~50%
          temperature: 0.5, // ✅ Lower = more focused, fewer wasted tokens
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HF API error: ${response.status}`);
    }

    const result = await response.json();
    const responseText = result?.choices?.[0]?.message?.content?.trim();

    if (!responseText) throw new Error("Empty response from Hugging Face API");

    let insights = [];
    try {
      const cleaned = responseText
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      insights = JSON.parse(cleaned);
    } catch {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
      else throw new Error("Could not parse JSON from model response");
    }

    insights = insights
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        title: String(item.title || "Financial Insight"),
        description: String(item.description || ""),
        category: String(item.category || "General"),
        // ✅ Cap saving potential at 50% of category spend — prevents "100% reduction" oddity
        savingPotential: Math.min(
          Number(item.savingPotential) || 0,
          (spendingByCategory[item.category] || totalSpending) * 0.5
        ),
      }));

    const finalInsights = insights.slice(0, 3);

    // ✅ Save to cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          hash: hashTransactions(transactions),
          timestamp: Date.now(),
          insights: finalInsights,
        })
      );
    } catch (_) {}

    return { success: true, insights: finalInsights, fromCache: false };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      success: false,
      error: error.message,
      insights: [
        {
          title: "Reduce Food & Dining Expenses",
          description: "Consider cooking at home more often to reduce expenses by 20-30%.",
          category: "Food & Dining",
          savingPotential: 2000,
        },
        {
          title: "Create a Budget",
          description: "Setting a monthly budget can help you save up to 15% of your spending.",
          category: "Budgeting",
          savingPotential: 1500,
        },
        {
          title: "Build an Emergency Fund",
          description: "Try to save 10% of your income each month for emergencies.",
          category: "Savings",
          savingPotential: 3000,
        },
      ],
    };
  }
};