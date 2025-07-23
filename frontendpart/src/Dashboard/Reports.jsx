import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from '../components/Footer';

const Reports = () => {
  const location = useLocation();
  const [reportType, setReportType] = useState('Monthly Report');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-31');
  const [reportData, setReportData] = useState(location.state?.reportData || null);
  // Filtered transactions based on date range and report type
  const filteredData = (reportData || []).filter(t => {
    // Make sure we have a valid date
    if (!t.date) return false;
    
    const txDate = new Date(t.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Skip invalid dates
    if (isNaN(txDate.getTime())) return false;
    
    // Filter by date range
    if (txDate < start || txDate > end) return false;
    
    // Filter by report type (example: monthly/weekly)
    if (reportType === 'Weekly Report') {
      // Only include transactions from the last 7 days of endDate
      const diffDays = (end - txDate) / (1000 * 60 * 60 * 24);
      if (diffDays < 0 || diffDays > 6) return false;
    }
    
    // For monthly, just use date range
    return true;
  });
  
  // Log filtered data count
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      console.log(`Filtered ${filteredData.length} out of ${reportData.length} transactions`);
    }
  }, [reportData, filteredData.length]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use report data from navigation state if available
        if (location.state?.reportData) {
          console.log('Using report data from navigation state');
          setReportData(location.state.reportData);
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('authToken');
        console.log('Fetching report with token:', token ? 'Token exists' : 'No token');
        
        // Get fileId from URL query params if available
        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId');
        
        let url = `${API_BASE_URL}/reports/generate`;
        if (fileId) {
          url += `?fileId=${fileId}`;
        }
        
        console.log('Fetching report from URL:', url);
        
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        console.log('Report API response:', data);
        
        if (data.success) {
          console.log(`Setting report data with ${data.report.length} transactions`);
          setReportData(data.report);
        } else {
          setError(data.message || 'Failed to fetch report');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Error fetching report: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [location.state]);

  const exportPDF = () => {
    alert("PDF report has been generated.");
    // Simulate PDF export logic
  };

  const exportCSV = () => {
    alert("CSV data has been exported.");
    // Simulate CSV export logic
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
          <p className="text-sm text-gray-600">Generate detailed financial reports and export your data</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow col-span-1">
            <h2 className="font-semibold text-lg mb-4">Report Filters</h2>
            <label className="block text-sm mb-1">Report Type</label>
            <select
              className="w-full border rounded px-2 py-1 mb-4"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Monthly Report</option>
              <option>Weekly Report</option>
            </select>
            <label className="block text-sm mb-1">Date Range</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="date"
                className="border rounded px-2 py-1 w-1/2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border rounded px-2 py-1 w-1/2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 w-full rounded mb-2"
              onClick={exportPDF}
            >
              Export PDF Report
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 py-1.5 w-full rounded"
              onClick={exportCSV}
            >
              Export CSV Data
            </button>
          </div>
          {/* Stats and Report Data */}
          <div className="md:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading report...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">
                <strong>Error:</strong> {error}<br />
                <span className="block mt-2">Please check your login status and try again.</span>
              </div>
            ) : filteredData && filteredData.length > 0 ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total Spending</div>
                    <div className="text-2xl font-semibold">
                      ₹{filteredData.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total Income</div>
                    <div className="text-2xl font-semibold text-green-600">
                      ₹{filteredData.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Transactions</div>
                    <div className="text-2xl font-semibold">{filteredData.length}</div>
                  </div>
                </div>
                {/* Spending Category */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Transaction Categories</h2>
                  <div className="mb-4">
                    <h3 className="font-medium text-red-600 mb-2">Expenses</h3>
                    <ul className="text-sm">
                      {Array.from(new Set(filteredData.filter(t => t.type === 'debit').map(t => {
                        // Auto-categorize transactions based on description
                        if (t.description.toLowerCase().includes('atm') || t.description.toLowerCase().includes('withdrawal')) return 'Cash Withdrawal';
                        if (t.description.toLowerCase().includes('rent')) return 'Housing';
                        if (t.description.toLowerCase().includes('bazaar') || t.description.toLowerCase().includes('grocery')) return 'Groceries';
                        if (t.description.toLowerCase().includes('zomato') || t.description.toLowerCase().includes('swiggy')) return 'Food & Dining';
                        if (t.description.toLowerCase().includes('jio') || t.description.toLowerCase().includes('recharge')) return 'Mobile & Internet';
                        if (t.description.toLowerCase().includes('power') || t.description.toLowerCase().includes('bill')) return 'Utilities';
                        if (t.description.toLowerCase().includes('card payment')) return 'Credit Card';
                        if (t.description.toLowerCase().includes('upi')) return 'Online Shopping';
                        return t.category || 'Other Expenses';
                      }))).map(cat => {
                        const catTrans = filteredData.filter(t => t.type === 'debit' && (
                          (t.description.toLowerCase().includes(cat.toLowerCase())) ||
                          (cat === 'Other Expenses' && !t.category)
                        ));
                        const total = catTrans.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                        const allDebitTotal = filteredData.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                        const percent = allDebitTotal > 0 ? ((total / allDebitTotal) * 100).toFixed(1) : '0.0';
                        return (
                          <li key={cat} className="flex justify-between mb-1">
                            {cat} <span className="text-gray-900">₹{total.toFixed(2)} ({percent}%)</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-green-600 mb-2">Income</h3>
                    <ul className="text-sm">
                      {Array.from(new Set(filteredData.filter(t => t.type === 'credit').map(t => {
                        // Auto-categorize income transactions
                        if (t.description.toLowerCase().includes('salary')) return 'Salary';
                        if (t.description.toLowerCase().includes('cash deposit')) return 'Cash Deposits';
                        if (t.description.toLowerCase().includes('cheque')) return 'Cheque Deposits';
                        if (t.description.toLowerCase().includes('transfer')) return 'Transfers';
                        if (t.description.toLowerCase().includes('freelance')) return 'Freelance Income';
                        if (t.description.toLowerCase().includes('deposit')) return 'Other Deposits';
                        return t.category || 'Other Income';
                      }))).map(cat => {
                        const catTrans = filteredData.filter(t => t.type === 'credit' && (
                          (t.description.toLowerCase().includes(cat.toLowerCase())) ||
                          (cat === 'Other Income' && !t.category)
                        ));
                        const total = catTrans.reduce((sum, t) => sum + Number(t.amount || 0), 0);
                        const allCreditTotal = filteredData.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0);
                        const percent = allCreditTotal > 0 ? ((total / allCreditTotal) * 100).toFixed(1) : '0.0';
                        return (
                          <li key={cat} className="flex justify-between mb-1">
                            {cat} <span className="text-gray-900">₹{total.toFixed(2)} ({percent}%)</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                {/* Recent Transactions */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Transactions Table</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border-b">Date</th>
                          <th className="px-4 py-2 border-b">Description</th>
                          <th className="px-4 py-2 border-b">Category</th>
                          <th className="px-4 py-2 border-b">Debit (₹)</th>
                          <th className="px-4 py-2 border-b">Credit (₹)</th>
                          <th className="px-4 py-2 border-b">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice().reverse().map((t, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2">{t.description || '-'}</td>
                            <td className="px-4 py-2">{t.category || '-'}</td>
                            <td className="px-4 py-2 text-red-600">{t.type === 'debit' && t.amount ? Number(t.amount).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2 text-green-600">{t.type === 'credit' && t.amount ? Number(t.amount).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2">{t.balance !== undefined && t.balance !== null ? Number(t.balance).toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">No transactions found.</div>
            )}
            {/* Export Options */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Export Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-1">PDF Report</h3>
                  <p className="text-sm text-gray-500 mb-3">Detailed financial report with charts</p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    onClick={exportPDF}
                  >
                    Download PDF
                  </button>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-1">CSV Data</h3>
                  <p className="text-sm text-gray-500 mb-3">Raw transaction data for analysis</p>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                    onClick={exportCSV}
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;