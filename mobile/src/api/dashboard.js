import { apiRequest, API_ENDPOINTS } from './config';

export const getDashboardStats = async () => {
  try {
    const result = await apiRequest(API_ENDPOINTS.DASHBOARD_STATS, { method: 'GET' });
    return { success: true, data: result.data, message: 'Dashboard stats fetched' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Failed to fetch dashboard stats' };
  }
};

export const getDashboardSummary = async () => {
  try {
    const result = await apiRequest(`${API_ENDPOINTS.TRANSACTIONS}?page=1&limit=1000`, { method: 'GET' });
    const transactions = result.transactions || [];
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const monthTotals = {};
    transactions.forEach((t) => {
      const amt = Math.abs(t.amount || 0);
      const monthKey = t.date ? new Date(t.date).toLocaleString('en-IN', { month: 'short' }) : '';

      if (t.type === 'credit') {
        totalIncome += amt;
      } else if (t.type === 'debit') {
        totalExpense += amt;
        const cat = t.category || 'Others';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }

      if (monthKey) {
        if (!monthTotals[monthKey]) monthTotals[monthKey] = { income: 0, expense: 0 };
        if (t.type === 'credit') monthTotals[monthKey].income += amt;
        else monthTotals[monthKey].expense += amt;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    const monthlyTrend = Object.entries(monthTotals).map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
    }));

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryBreakdown,
        monthlyTrend,
        transactionCount: transactions.length,
      },
    };
  } catch (error) {
    return { success: false, error: error.message, message: 'Failed to compute dashboard summary' };
  }
};

export const getTransactions = async (page = 1, limit = 10, category = '', type = '', search = '') => {
  try {
    let url = `${API_ENDPOINTS.TRANSACTIONS}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const result = await apiRequest(url, {
      method: 'GET',
    });
    return { success: true, data: result, message: 'Transactions fetched' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Failed to fetch transactions' };
  }
};

export const generateInsights = (summary) => {
  if (!summary) return [];
  const { totalIncome, totalExpense, categoryBreakdown } = summary;
  const insights = [];

  if (totalIncome === 0 && totalExpense === 0) {
    return insights;
  }
  if (totalExpense > totalIncome) {
    insights.push(`You spent ₹${(totalExpense - totalIncome).toFixed(0)} more than you earned in this period.`);
  } else if (totalIncome > 0) {
    const savingsRate = (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(0);
    insights.push(`You're saving about ${savingsRate}% of your income.`);
  }
  if (categoryBreakdown && categoryBreakdown.length) {
    insights.push(`Your biggest spending category is ${categoryBreakdown[0].name} at ₹${categoryBreakdown[0].amount.toFixed(0)}.`);
  }
  if (categoryBreakdown && categoryBreakdown.length > 1) {
    insights.push(`Your second biggest category is ${categoryBreakdown[1].name} at ₹${categoryBreakdown[1].amount.toFixed(0)}.`);
  }
  return insights;
};

export const uploadStatement = async (fileUri, fileName, mimeType) => {
  try {
    const { API_BASE_URL, getFileUploadHeaders } = await import('./config');
    const headers = await getFileUploadHeaders();

    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType });

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_FILE}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Upload failed');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message, message: 'Upload failed' };
  }
};

export const getReportsGenerate = async () => {
  try {
    const result = await apiRequest('/reports/generate', { method: 'GET' });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateAIInsights = async (transactions) => {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN || process.env.VITE_HF_TOKEN;

  if (!token) {
    return { success: false, error: 'No Hugging Face token provided' };
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor AI. Analyze the provided transactions list and generate exactly 3 personalized financial insights. Return ONLY a raw JSON array of 3 objects with fields: "title", "description", "category", and "savingPotential" (a numeric value). Do not wrap the JSON in markdown code blocks, backticks, or any explanation.'
          },
          {
            role: 'user',
            content: JSON.stringify((transactions || []).slice(0, 30))
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API returned status ${response.status}`);
    }

    const resData = await response.json();
    let content = resData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response from Hugging Face model');
    }

    // Clean markdown wrapper blocks if any
    content = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return { success: true, insights: parsed };
    }
    throw new Error('Response is not a JSON array');
  } catch (error) {
    console.warn('Hugging Face AI Insights error, falling back:', error);
    try {
      const result = await apiRequest(API_ENDPOINTS.INSIGHTS, { method: 'GET' });
      const list = result.insights || result.data || (Array.isArray(result) ? result : []);
      if (Array.isArray(list) && list.length > 0) {
        return { success: true, insights: list };
      }
      throw new Error('Fallback insights empty');
    } catch (err) {
      return { success: false, error: error.message };
    }
  }
};

