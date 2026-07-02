import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions } from '../api/dashboard';
import { colors } from '../theme/colors';

const ALL_CATEGORIES = [
  'All Categories',
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transport',
  'Utilities',
  'Telecom',
  'Entertainment',
  'Health & Medical',
  'Education',
  'Insurance',
  'EMI & Loans',
  'Credit Card Payment',
  'Investments',
  'Cash Withdrawal',
  'Salary',
  'Transfers',
  'Housing & Rent',
  'Tax & Government',
  'Others',
];

//  Category color map matching all categories
const categoryColors = {
  'Food & Dining':        'bg-orange-100 text-orange-800',
  'Groceries':            'bg-green-100 text-green-800',
  'Shopping':             'bg-blue-100 text-blue-800',
  'Transport':            'bg-cyan-100 text-cyan-800',
  'Utilities':            'bg-yellow-100 text-yellow-800',
  'Telecom':              'bg-indigo-100 text-indigo-800',
  'Entertainment':        'bg-purple-100 text-purple-800',
  'Health & Medical':     'bg-red-100 text-red-800',
  'Education':            'bg-teal-100 text-teal-800',
  'Insurance':            'bg-gray-100 text-gray-800',
  'EMI & Loans':          'bg-rose-100 text-rose-800',
  'Credit Card Payment':  'bg-pink-100 text-pink-800',
  'Investments':          'bg-emerald-100 text-emerald-800',
  'Cash Withdrawal':      'bg-amber-100 text-amber-800',
  'Salary':               'bg-green-100 text-green-800',
  'Transfers':            'bg-blue-100 text-blue-800',
  'Housing & Rent':       'bg-violet-100 text-violet-800',
  'Tax & Government':     'bg-slate-100 text-slate-800',
  'Others':               'bg-gray-100 text-gray-800',
};

const getIndicatorColor = (category) => {
  const map = {
    'Food & Dining': 'bg-orange-500',
    'Groceries': 'bg-green-500',
    'Shopping': 'bg-blue-500',
    'Transport': 'bg-cyan-500',
    'Utilities': 'bg-yellow-500',
    'Telecom': 'bg-indigo-500',
    'Entertainment': 'bg-purple-500',
    'Health & Medical': 'bg-red-500',
    'Education': 'bg-teal-500',
    'Insurance': 'bg-gray-500',
    'EMI & Loans': 'bg-rose-500',
    'Credit Card Payment': 'bg-pink-500',
    'Investments': 'bg-emerald-500',
    'Cash Withdrawal': 'bg-amber-500',
    'Salary': 'bg-green-600',
    'Transfers': 'bg-blue-600',
    'Housing & Rent': 'bg-violet-500',
    'Tax & Government': 'bg-slate-500',
    'Others': 'bg-gray-400',
  };
  return map[category] || 'bg-gray-400';
};

// Tailwind class mappings to actual CSS hex codes for React Native styling
const tailwindBgHex = {
  'bg-orange-100': '#FFE9DB',
  'bg-green-100': '#DEF7EC',
  'bg-blue-100': '#E1EFFE',
  'bg-cyan-100': '#E1F5FE',
  'bg-yellow-100': '#FDF6B2',
  'bg-indigo-100': '#E5EDFF',
  'bg-purple-100': '#EDEBFE',
  'bg-red-100': '#FDE8E8',
  'bg-teal-100': '#E6FCF5',
  'bg-gray-100': '#F3F4F6',
  'bg-rose-100': '#FCE8E6',
  'bg-pink-100': '#FCE8F3',
  'bg-emerald-100': '#DEF7EC',
  'bg-amber-100': '#FEF3C7',
  'bg-violet-100': '#EDE9FE',
  'bg-slate-100': '#F1F5F9',
  
  // Indicators
  'bg-orange-500': '#F97316',
  'bg-green-500': '#22C55E',
  'bg-green-600': '#16A34A',
  'bg-blue-500': '#3B82F6',
  'bg-blue-600': '#2563EB',
  'bg-cyan-500': '#06B6D4',
  'bg-yellow-500': '#EAB308',
  'bg-indigo-500': '#6366F1',
  'bg-purple-500': '#A855F7',
  'bg-red-500': '#EF4444',
  'bg-teal-500': '#14B8A6',
  'bg-gray-500': '#6B7280',
  'bg-gray-400': '#9CA3AF',
  'bg-rose-500': '#F43F5E',
  'bg-pink-500': '#EC4899',
  'bg-emerald-500': '#10B981',
  'bg-amber-500': '#F59E0B',
  'bg-violet-500': '#8B5CF6',
  'bg-slate-500': '#64748B',
};

const tailwindTextHex = {
  'text-orange-800': '#9A3412',
  'text-green-800': '#03543F',
  'text-blue-800': '#1E40AF',
  'text-cyan-800': '#075985',
  'text-yellow-800': '#723B13',
  'text-indigo-800': '#3730A3',
  'text-purple-800': '#5521B5',
  'text-red-800': '#9B1C1C',
  'text-teal-800': '#0A5554',
  'text-gray-800': '#1F2937',
  'text-rose-800': '#9F1239',
  'text-pink-800': '#9D174D',
  'text-emerald-800': '#065F46',
  'text-amber-800': '#92400E',
  'text-violet-800': '#5B21B6',
  'text-slate-800': '#1E293B',
};

const parseTailwindClass = (classStr) => {
  if (!classStr) return { backgroundColor: '#F3F4F6', color: '#1F2937' };
  const parts = classStr.split(' ');
  const bgClass = parts.find(p => p.startsWith('bg-'));
  const textClass = parts.find(p => p.startsWith('text-'));
  return {
    backgroundColor: tailwindBgHex[bgClass] || '#F3F4F6',
    color: tailwindTextHex[textClass] || '#1F2937'
  };
};

const getIndicatorColorHex = (category) => {
  const twClass = getIndicatorColor(category);
  return tailwindBgHex[twClass] || '#9CA3AF';
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('all');

  // Debounce search filter input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const loadTransactions = async (isRef = false) => {
    if (isRef) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getTransactions(
        1,
        50,
        selectedCategory === 'All Categories' ? '' : selectedCategory,
        selectedType,
        search
      );
      const list = result.data?.transactions ?? result.data ?? [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedCategory, selectedType, search]);

  const renderItem = ({ item }) => {
    const isExpense = item.type === 'debit';
    const cat = item.category || 'Others';
    const colorStyles = parseTailwindClass(categoryColors[cat] || categoryColors['Others']);
    const indicatorColor = getIndicatorColorHex(cat);

    return (
      <View style={styles.row}>
        {/* Colorful left vertical stripe based on category indicator color */}
        <View style={[styles.cardIndicator, { backgroundColor: indicatorColor }]} />

        <View style={[styles.iconWrap, { backgroundColor: isExpense ? '#FEE2E2' : '#DCFCE7' }]}>
          <Ionicons
            name={isExpense ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={isExpense ? colors.error : colors.success}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.description || 'Transaction'}</Text>
          <View style={styles.rowMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: colorStyles.backgroundColor }]}>
              <Text style={[styles.categoryBadgeText, { color: colorStyles.color }]}>
                {cat}
              </Text>
            </View>
            <Text style={styles.rowDate}>
              {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            </Text>
          </View>
        </View>
        <Text style={[styles.rowAmount, { color: isExpense ? colors.error : colors.success }]}>
          {isExpense ? '-' : '+'}₹{Math.abs(item.amount || 0)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      {/* Filtering Section */}
      <View style={styles.filterSection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search description..."
            placeholderTextColor="#9CA3AF"
            value={searchVal}
            onChangeText={setSearchVal}
          />
          {searchVal ? (
            <TouchableOpacity onPress={() => setSearchVal('')} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Transaction Type Filter (Tabs) */}
        <View style={styles.typeFilterContainer}>
          {[
            { label: 'All', value: 'all' },
            { label: 'Expense', value: 'debit' },
            { label: 'Income', value: 'credit' },
          ].map((typeItem) => {
            const isActive = selectedType === typeItem.value;
            return (
              <TouchableOpacity
                key={typeItem.value}
                style={[styles.typeButton, isActive && styles.typeButtonActive]}
                onPress={() => setSelectedType(typeItem.value)}
              >
                <Text style={[styles.typeText, isActive && styles.typeTextActive]}>
                  {typeItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Filter horizontal scroll */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              let chipStyle = {};
              let chipTextStyle = {};

              if (isSelected) {
                if (cat === 'All Categories') {
                  chipStyle = { backgroundColor: colors.primary };
                  chipTextStyle = { color: colors.white };
                } else {
                  const parsed = parseTailwindClass(categoryColors[cat]);
                  chipStyle = { 
                    backgroundColor: parsed.backgroundColor,
                    borderWidth: 1,
                    borderColor: parsed.color 
                  };
                  chipTextStyle = { color: parsed.color, fontWeight: '700' };
                }
              } else {
                chipStyle = { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E5E7EB' };
                chipTextStyle = { color: '#4B5563' };
              }

              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, chipStyle]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  {cat !== 'All Categories' && (
                    <View
                      style={[
                        styles.chipIndicator,
                        { backgroundColor: getIndicatorColorHex(cat) }
                      ]}
                    />
                  )}
                  <Text style={[styles.categoryChipText, chipTextStyle]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, i) => item._id || item.id || String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={() => loadTransactions(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <Text style={styles.empty}>No transactions found matching criteria.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  filterSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
  },
  clearSearch: {
    padding: 2,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1,
    position: 'relative', overflow: 'hidden',
  },
  cardIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700' },
  rowDate: { fontSize: 11, color: '#6B7280' },
  rowAmount: { fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
});
