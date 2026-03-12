import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from '../components/Footer';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState('debit');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const itemsPerPage = 10;

  // ✅ All categories matching pdfUtils.js categorize() output
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

  // ✅ Category color map matching all categories
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

  // ✅ Load transactions with server-side filtering
  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      // ✅ Send category filter to backend
      if (categoryFilter !== 'All Categories') {
        queryParams.append('category', categoryFilter);
      }

      // ✅ Send type filter to backend
      if (typeFilter !== 'All') {
        queryParams.append('type', typeFilter.toLowerCase());
      }

      // ✅ Send search term to backend
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transactions?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const formattedTransactions = (data.transactions || []).map(tx => ({
          id: tx._id,
          desc: tx.description,
          date: new Date(tx.date).toLocaleDateString('en-IN'),
          category: tx.category || 'Others',
          amount: tx.amount,
          type: tx.type,
        }));

        setTransactions(formattedTransactions);
        setTotalTransactions(data.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
        setError(formattedTransactions.length === 0 ? 'No transactions found.' : '');
      } else {
        setError(data.message || 'Failed to load transactions');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Transactions loading error:', err);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Re-fetch when filters or page change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, typeFilter]);

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage, categoryFilter, typeFilter]);

  // ✅ Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadTransactions(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddTransaction = async () => {
    if (!description || !date || !category || !amount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transactions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            date,
            category,
            amount: parseFloat(amount),
            type: txType,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setDescription(''); setDate(''); setCategory(''); setAmount(''); setTxType('debit');
        loadTransactions(1);
      } else {
        setError(data.message || 'Failed to add transaction');
      }
    } catch (err) {
      console.error('Add transaction error:', err);
      setError('Failed to add transaction');
    }
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
              <p className="text-gray-600 text-sm mt-1">
                {totalTransactions > 0 ? `${totalTransactions} transactions found` : 'Manage and track your transactions'}
              </p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Transaction
            </button>
          </div>

          {/* ✅ Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by description..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* ✅ Category filter - matches pdfUtils categories */}
            <select
              className="sm:w-56 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* ✅ Type filter */}
            <select
              className="sm:w-36 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Active filter chips */}
          {(categoryFilter !== 'All Categories' || typeFilter !== 'All' || searchTerm) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categoryFilter !== 'All Categories' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('All Categories')} className="ml-1 font-bold hover:text-blue-600">×</button>
                </span>
              )}
              {typeFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {typeFilter}
                  <button onClick={() => setTypeFilter('All')} className="ml-1 font-bold hover:text-purple-600">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-1 font-bold hover:text-gray-600">×</button>
                </span>
              )}
              <button
                onClick={() => { setCategoryFilter('All Categories'); setTypeFilter('All'); setSearchTerm(''); }}
                className="px-3 py-1 text-sm text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : error && transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">{error}</p>
              <p className="text-sm text-gray-400">Upload a bank statement to get started.</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No transactions match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx, index) => (
                    <tr key={tx.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{tx.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getIndicatorColor(tx.category)}`}></span>
                          {tx.desc}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[tx.category] || 'bg-gray-100 text-gray-800'}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalTransactions > 0 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalTransactions)}–{Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${currentPage <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${currentPage >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setIsModalOpen(false)}
              >×</button>
              <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {/* ✅ Category dropdown matching pdfUtils categories */}
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {ALL_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {/* ✅ Type selector */}
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                >
                  <option value="debit">Debit (Expense)</option>
                  <option value="credit">Credit (Income)</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleAddTransaction}
              >
                Add Transaction
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Transactions;