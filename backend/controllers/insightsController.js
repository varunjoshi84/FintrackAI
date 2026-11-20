const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

// Server-side AI insights proxy: keeps API keys secure and allows plan quota enforcement
const generateInsights = async (req, res) => {
  try {
    const userPlan = req.user?.plan || 'Basic';
    const hfToken = process.env.HF_TOKEN;

    const { transactions, categoryBreakdown, totalIncome, totalSpending } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions data is required to generate insights',
      });
    }

    // Default high-quality deterministic insights fallback
    const fallbackInsights = [
      {
        title: 'Optimize Recurring Expenses',
        description: 'Review monthly subscription and utility charges to eliminate unused services.',
        category: 'Utilities',
        savingPotential: Math.round(Number(totalSpending || 0) * 0.08),
      },
      {
        title: 'Dining & Discretionary Budgeting',
        description: 'Cap weekly dining and lifestyle spending to allocate 20% directly to emergency savings.',
        category: 'Food & Dining',
        savingPotential: Math.round(Number(totalSpending || 0) * 0.12),
      },
      {
        title: 'High-Yield Savings & Investments',
        description: 'Maintain 3 months of emergency funds in liquid high-interest accounts before allocating to market instruments.',
        category: 'Investments',
        savingPotential: Math.round(Number(totalIncome || 0) * 0.15),
      },
    ];

    if (!hfToken) {
      return res.json({
        success: true,
        source: 'local_engine',
        insights: fallbackInsights,
      });
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hfToken}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a financial advisor. Respond ONLY with a valid JSON array. No markdown, no explanation, just raw JSON.",
          },
          {
            role: "user",
            content: `Give 3 money-saving insights as a JSON array.
Total Income: ₹${Number(totalIncome || 0).toFixed(2)}
Total Spending: ₹${Number(totalSpending || 0).toFixed(2)}
Categories:
${categoryBreakdown || 'General: ₹' + Number(totalSpending || 0).toFixed(2)}

Format:
[{"title":"...","description":"...","category":"...","savingPotential": 1234}]`,
          },
        ],
        max_tokens: 512,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return res.json({
        success: true,
        source: 'fallback',
        insights: fallbackInsights,
      });
    }

    const result = await response.json();
    const responseText = result?.choices?.[0]?.message?.content?.trim();

    if (!responseText) {
      return res.json({
        success: true,
        source: 'fallback',
        insights: fallbackInsights,
      });
    }

    const cleaned = responseText.replace(/```json\n?|```/g, "").trim();
    const insights = JSON.parse(cleaned);

    res.json({
      success: true,
      source: 'ai_engine',
      insights: Array.isArray(insights) ? insights : fallbackInsights,
    });
  } catch (error) {
    console.error('Insights generation error:', error.message);
    res.json({
      success: true,
      source: 'fallback',
      insights: [
        {
          title: 'Automate Monthly Savings',
          description: 'Transfer 15-20% of income to a separate account immediately on payday.',
          category: 'Savings',
          savingPotential: 1500,
        },
      ],
    });
  }
};

module.exports = {
  generateInsights,
};
