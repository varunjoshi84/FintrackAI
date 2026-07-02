import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardSummary } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();

  const load = useCallback(async () => {
    const result = await getDashboardSummary();
    if (result.success) setStats(result.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const income = stats?.totalIncome ?? 0;
  const expense = stats?.totalExpense ?? 0;
  const balance = stats?.balance ?? income - expense;
  const categories = stats?.categoryBreakdown ?? [];
  const monthlyTrend = stats?.monthlyTrend ?? [];
  const trendLabels = monthlyTrend.map((m) => m.month);
  const trendIncome = monthlyTrend.map((m) => m.income);

  const chartData = categories.length
    ? categories.map((c, i) => ({
        name: c.name || c.category || `Cat ${i + 1}`,
        amount: c.amount || c.value || 0,
        color: ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED'][i % 5],
        legendFontColor: colors.text,
        legendFontSize: 12,
      }))
    : [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name || 'there'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>₹{income}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.statLabel}>Expense</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>₹{expense}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.statLabel}>Balance</Text>
        <Text style={styles.balanceValue}>₹{balance}</Text>
      </View>

      {chartData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={{ color: () => colors.text }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="8"
          />
        </View>
      )}

      {trendLabels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Monthly Income Trend</Text>
          <BarChart
            data={{ labels: trendLabels, datasets: [{ data: trendIncome }] }}
            width={screenWidth - 64}
            height={200}
            fromZero
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => colors.textMuted,
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 8 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  container: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.text },
  subGreeting: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 16 },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 12, padding: 18, marginBottom: 16 },
  balanceValue: { fontSize: 28, fontWeight: '700', color: colors.white, marginTop: 4 },
  chartCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 8 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', gap: 6, elevation: 2,
  },
  actionText: { fontSize: 12, color: colors.text, fontWeight: '500' },
});
