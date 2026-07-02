import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getReportsGenerate, generateAIInsights } from '../api/dashboard';
import { colors } from '../theme/colors';

const financialTips = [
  "Track your spending daily to identify patterns and opportunities for savings.",
  "Set up automatic transfers to your savings account to build wealth consistently.",
  "Review your subscriptions monthly to eliminate unnecessary expenses.",
  "Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
  "Pay off high-interest debt first to minimize interest payments.",
  "Create a separate emergency fund with 3-6 months of living expenses.",
  "Consider using cash for discretionary spending to be more mindful of purchases.",
  "Meal prep at home to reduce food delivery and dining out expenses.",
  "Use price comparison apps when shopping to find the best deals.",
  "Set specific financial goals with deadlines to stay motivated.",
  "Automate bill payments to avoid late fees and maintain good credit.",
  "Invest early and regularly, even small amounts benefit from compound growth.",
  "Negotiate bills and subscriptions annually to get better rates.",
  "Use cashback credit cards for regular purchases, but pay off the balance monthly.",
  "Consider a no-spend challenge for a week each month to reset spending habits."
];

const defaultInsights = [
  {
    title: "Start Tracking Expenses",
    description: "Begin by recording all your expenses to understand your spending patterns.",
    category: "Budgeting",
    savingPotential: 5000
  },
  {
    title: "Create a Budget Plan",
    description: "Set monthly spending limits for different categories to control expenses.",
    category: "Planning",
    savingPotential: 3000
  },
  {
    title: "Build Emergency Fund",
    description: "Save 3-6 months of expenses for unexpected situations.",
    category: "Savings",
    savingPotential: 10000
  }
];

const fallbackInsights = [
  {
    title: "Reduce Food Expenses",
    description: "Try meal planning and cooking at home to save on food costs.",
    category: "Food & Dining",
    savingPotential: 2000
  },
  {
    title: "Review Subscriptions",
    description: "Cancel unused subscriptions and services to save monthly.",
    category: "Entertainment",
    savingPotential: 1500
  },
  {
    title: "Use Public Transport",
    description: "Consider using public transportation to save on fuel and parking costs.",
    category: "Transportation",
    savingPotential: 3000
  }
];

const getCategoryFromDescription = (description) => {
  if (!description) return "Other";
  const desc = description.toLowerCase();
  
  if (desc.includes('salary')) return "Income";
  if (desc.includes('deposit') || desc.includes('transfer from') || desc.includes('cheque')) return "Income";
  if (desc.includes('atm') || desc.includes('withdrawal')) return "Cash";
  if (desc.includes('rent') || desc.includes('housing')) return "Housing";
  if (desc.includes('bazaar') || desc.includes('grocery')) return "Food & Dining";
  if (desc.includes('zomato') || desc.includes('swiggy')) return "Food & Dining";
  if (desc.includes('jio') || desc.includes('recharge')) return "Utilities";
  if (desc.includes('power') || desc.includes('bill')) return "Utilities";
  if (desc.includes('card payment')) return "Credit Card";
  if (desc.includes('upi') || desc.includes('amazon')) return "Shopping";
  
  return "Other";
};

export default function InsightsScreen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const getRandomTips = () => {
    const shuffled = [...financialTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };
  
  const [tips, setTips] = useState(getRandomTips());

  const fetchInsights = async (isRef = false) => {
    if (isRef) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getReportsGenerate();
      
      if (result.success && result.data?.report && result.data.report.length > 0) {
        const txs = result.data.report.map(tx => ({
          id: tx._id,
          description: tx.description,
          date: new Date(tx.date),
          amount: tx.amount,
          type: tx.type,
          balance: tx.balance,
          category: getCategoryFromDescription(tx.description)
        }));
        
        const insightsResult = await generateAIInsights(txs);
        
        if (insightsResult.success && Array.isArray(insightsResult.insights)) {
          setInsights(insightsResult.insights);
        } else {
          setError(insightsResult.error || 'Failed to generate insights');
          setInsights(Array.isArray(insightsResult.insights) ? insightsResult.insights : fallbackInsights);
        }
      } else {
        setInsights(defaultInsights);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred');
      setInsights(fallbackInsights);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    setTips(getRandomTips());
  }, [insights]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await fetchInsights();
    setIsGenerating(false);
  };

  const totalSavings = Array.isArray(insights) ? insights.reduce((sum, insight) => sum + (insight.savingPotential || 0), 0) : 0;

  const renderInsightCard = (insight, index) => {
    const titleLower = insight.title ? insight.title.toLowerCase() : '';
    
    let cardIndicatorColor = '#3B82F6'; // blue
    let iconName = 'information-circle';
    let iconColor = '#2563EB';
    let badgeBg = '#E1EFFE';
    let badgeText = '#1E40AF';
    let badgeLabel = 'Insight';

    if (titleLower.includes('reduce') || titleLower.includes('high') || titleLower.includes('alert')) {
      cardIndicatorColor = '#EF4444'; // red
      iconName = 'alert-circle';
      iconColor = '#DC2626';
      badgeBg = '#FEE2E2';
      badgeText = '#991B1B';
      badgeLabel = 'Warning';
    } else if (titleLower.includes('save') || titleLower.includes('opportunity')) {
      cardIndicatorColor = '#10B981'; // emerald/green
      iconName = 'checkmark-circle';
      iconColor = '#057A55';
      badgeBg = '#D1FAE5';
      badgeText = '#065F46';
      badgeLabel = 'Suggestion';
    }

    return (
      <View key={index} style={styles.card}>
        <View style={[styles.cardIndicator, { backgroundColor: cardIndicatorColor }]} />
        <View style={styles.cardHeader}>
          <Ionicons name={iconName} size={20} color={iconColor} style={styles.cardIcon} />
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeText }]}>{badgeLabel.toUpperCase()}</Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Generated</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardTitle}>{insight.title}</Text>
        <Text style={styles.cardDesc}>{insight.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardCategoryWrap}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaVal}>{insight.category}</Text>
          </View>
          <View style={styles.savingsWrap}>
            <Text style={styles.savingsVal}>+₹{(insight.savingPotential || 0).toFixed(2)}</Text>
            <Text style={styles.dateVal}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchInsights(true)} colors={[colors.primary]} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>AI Financial Insights</Text>
          <Text style={styles.subtitle}>Get personalized recommendations and discover spending patterns</Text>
        </View>
        <TouchableOpacity
          style={[styles.genButton, (isGenerating || loading) && styles.genButtonDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating || loading}
        >
          {isGenerating || loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="sparkles" size={16} color={colors.white} />
          )}
          <Text style={styles.genButtonText}>
            {isGenerating || loading ? 'Generating...' : 'Refresh AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={16} color="#DC2626" />
          <Text style={styles.errorText}>Server Error: {error}. Loaded local fallbacks.</Text>
        </View>
      )}

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Insights</Text>
          <Text style={styles.statVal}>{insights.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Savings Potential</Text>
          <Text style={[styles.statVal, { color: colors.success }]}>₹{totalSavings.toFixed(0)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Savings Goal</Text>
          <Text style={[styles.statVal, { color: colors.primary }]}>₹{(totalSavings * 1.5).toFixed(0)}</Text>
        </View>
      </View>

      {/* Financial Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <View style={styles.tipsTitleWrap}>
            <Ionicons name="bulb-outline" size={18} color={colors.text} />
            <Text style={styles.tipsTitle}>Financial Tips</Text>
          </View>
          <TouchableOpacity onPress={() => setTips(getRandomTips())} style={styles.tipsRefresh}>
            <Ionicons name="refresh" size={14} color={colors.primary} />
            <Text style={styles.tipsRefreshText}>Rotate</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tipsList}>
          <View style={[styles.tipBox, { backgroundColor: '#E1EFFE' }]}>
            <Text style={[styles.tipText, { color: '#1E40AF' }]}>💡 {tips[0]}</Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: '#DEF7EC' }]}>
            <Text style={[styles.tipText, { color: '#03543F' }]}>🌟 {tips[1]}</Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.tipText, { color: '#723B13' }]}>🎯 {tips[2]}</Text>
          </View>
        </View>
      </View>

      {/* Insights Cards List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Key Recommendations</Text>
        {!Array.isArray(insights) || insights.length === 0 ? (
          !loading && <Text style={styles.empty}>No insights available. Upload statement data first.</Text>
        ) : (
          insights.map((insight, idx) => renderInsightCard(insight, idx))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'column', gap: 12, marginBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 16,
  },
  headerTitleContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  genButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  genButtonDisabled: { backgroundColor: '#93C5FD' },
  genButtonText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 8,
    padding: 10, marginBottom: 16, alignItems: 'center',
  },
  errorText: { flex: 1, fontSize: 11, color: '#991B1B', fontWeight: '500' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: colors.white, borderRadius: 10, padding: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 1,
  },
  statLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: '700', color: colors.text },
  tipsSection: { backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 20, elevation: 1 },
  tipsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tipsTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  tipsRefresh: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipsRefreshText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  tipsList: { gap: 8 },
  tipBox: { padding: 10, borderRadius: 6 },
  tipText: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  listSection: { gap: 12 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  card: {
    backgroundColor: colors.white, borderRadius: 10, padding: 14, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 1, position: 'relative', overflow: 'hidden',
  },
  cardIndicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  aiBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  aiBadgeText: { fontSize: 9, color: '#4B5563', fontWeight: '600' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 12, color: '#4B5563', lineHeight: 17, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10,
  },
  cardCategoryWrap: { flexDirection: 'row', gap: 4 },
  metaLabel: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  metaVal: { fontSize: 10, color: colors.text, fontWeight: '700' },
  savingsWrap: { alignItems: 'flex-end' },
  savingsVal: { fontSize: 12, color: '#057A55', fontWeight: '700' },
  dateVal: { fontSize: 9, color: '#9CA3AF', marginTop: 2 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
});
