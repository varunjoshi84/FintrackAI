import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import Header from './Header';
import Footer from '../components/Footer';

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always get fileId from URL — this is the source of truth
  const fileId = new URLSearchParams(window.location.search).get('fileId');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        //  Case 1: came from Upload page with state (fast path)
        if (location.state?.reportData && location.state?.fileId === fileId) {
          const data = location.state.reportData;
          setReportData(data);
          if (location.state.dateRange) {
            setStartDate(location.state.dateRange.startDate);
            setEndDate(location.state.dateRange.endDate);
          }
          setLoading(false);
          return;
        }

        // Case 2: page refresh or direct URL visit — fetch by fileId
        if (!fileId) {
          setError('No report selected. Please upload a bank statement first.');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('authToken');
        const res = await fetch(
          `${API_BASE_URL}/reports/generate?fileId=${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setReportData(data.report);
          if (data.dateRange) {
            setStartDate(data.dateRange.startDate);
            setEndDate(data.dateRange.endDate);
          }
        } else {
          setError(data.message || 'Failed to fetch report');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Error fetching report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [fileId]);

  // Use DB category directly — no re-categorizing
  const totalDebit = reportData
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCredit = reportData
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Group by DB category field
  const groupByCategory = (transactions) => {
    const map = {};
    transactions.forEach(t => {
      const cat = t.category || 'Others';
      map[cat] = (map[cat] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const expenseCategories = groupByCategory(reportData.filter(t => t.type === 'debit'));
  const incomeCategories  = groupByCategory(reportData.filter(t => t.type === 'credit'));

  // Export PDF
  const exportPDF = () => {
    if (!reportData.length) { alert('No data to export.'); return; }

    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to download the PDF report.'); return; }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .debit { color: #dc2626; }
          .credit { color: #16a34a; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 5px; }
          .summary div { margin: 5px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p>Period: ${startDate ? new Date(startDate).toLocaleDateString('en-IN') : ''} to ${endDate ? new Date(endDate).toLocaleDateString('en-IN') : ''}</p>
        <div class="summary">
          <div><strong>Total Transactions:</strong> ${reportData.length}</div>
          <div><strong>Total Spending:</strong> ₹${totalDebit.toFixed(2)}</div>
          <div><strong>Total Income:</strong> ₹${totalCredit.toFixed(2)}</div>
          <div><strong>Net Balance:</strong> ₹${(totalCredit - totalDebit).toFixed(2)}</div>
        </div>
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Debit (₹)</th><th>Credit (₹)</th><th>Balance (₹)</th></tr>
          </thead>
          <tbody>
            ${reportData.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('en-IN')}</td>
                <td>${t.description}</td>
                <td>${t.category || '-'}</td>
                <td class="debit">${t.type === 'debit' ? Number(t.amount).toFixed(2) : ''}</td>
                <td class="credit">${t.type === 'credit' ? Number(t.amount).toFixed(2) : ''}</td>
                <td>${t.balance != null ? Number(t.balance).toFixed(2) : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer"><p>Generated on ${new Date().toLocaleString()} | FinTrackAI</p></div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ✅ Export CSV
  const exportCSV = () => {
    if (!reportData.length) { alert('No data to export.'); return; }

    let csv = 'Date,Description,Category,Type,Amount,Balance\n';
    reportData.forEach(t => {
      csv += `${new Date(t.date).toLocaleDateString('en-IN')},"${t.description.replace(/,/g, ' ')}",${t.category || 'Others'},${t.type},${Number(t.amount).toFixed(2)},${t.balance != null ? Number(t.balance).toFixed(2) : ''}\n`;
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + csv));
    link.setAttribute('download', `report_${fileId || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
            <p className="text-sm text-gray-600">
              {startDate && endDate
                ? `Statement period: ${new Date(startDate).toLocaleDateString('en-IN')} – ${new Date(endDate).toLocaleDateString('en-IN')}`
                : 'Detailed financial report for your uploaded statement'}
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Upload another statement
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500">Loading report...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button onClick={() => navigate('/upload')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Go to Upload
            </button>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No transactions found in this report.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold text-lg mb-4">Export</h2>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 w-full rounded mb-2"
                  onClick={exportPDF}
                >
                  Export PDF Report
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 py-2 w-full rounded"
                  onClick={exportCSV}
                >
                  Export CSV Data
                </button>
              </div>

              {/* Summary */}
              <div className="bg-white p-4 rounded-lg shadow text-sm space-y-2">
                <h2 className="font-semibold text-base mb-2">Summary</h2>
                <div className="flex justify-between"><span className="text-gray-500">Transactions</span><span className="font-medium">{reportData.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Spent</span><span className="font-medium text-red-600">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Income</span><span className="font-medium text-green-600">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="border-t pt-2 flex justify-between"><span className="text-gray-500">Net</span><span className={`font-semibold ${totalCredit - totalDebit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{(totalCredit - totalDebit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-3 space-y-6">

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Total Spending</div>
                  <div className="text-2xl font-semibold text-red-600">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Total Income</div>
                  <div className="text-2xl font-semibold text-green-600">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500">Transactions</div>
                  <div className="text-2xl font-semibold">{reportData.length}</div>
                </div>
              </div>

              {/* ✅ Category breakdown using DB categories */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-red-600 mb-2">Expenses</h3>
                    {expenseCategories.length === 0 ? (
                      <p className="text-sm text-gray-400">No expenses found</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {expenseCategories.map(([cat, total]) => (
                          <li key={cat} className="flex justify-between">
                            <span className="text-gray-700">{cat}</span>
                            <span className="text-gray-900 font-medium">
                              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              <span className="text-gray-400 ml-1">
                                ({totalDebit > 0 ? ((total / totalDebit) * 100).toFixed(1) : 0}%)
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 mb-2">Income</h3>
                    {incomeCategories.length === 0 ? (
                      <p className="text-sm text-gray-400">No income found</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {incomeCategories.map(([cat, total]) => (
                          <li key={cat} className="flex justify-between">
                            <span className="text-gray-700">{cat}</span>
                            <span className="text-gray-900 font-medium">
                              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              <span className="text-gray-400 ml-1">
                                ({totalCredit > 0 ? ((total / totalCredit) * 100).toFixed(1) : 0}%)
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Transactions table */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Transaction Details ({reportData.length})</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 font-medium text-gray-500">Category</th>
                        <th className="px-4 py-2 font-medium text-gray-500">Debit (₹)</th>
                        <th className="px-4 py-2 font-medium text-gray-500">Credit (₹)</th>
                        <th className="px-4 py-2 font-medium text-gray-500">Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((t, idx) => (
                        <tr key={t._id || idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-2">{t.description}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">{t.category || 'Others'}</span>
                          </td>
                          <td className="px-4 py-2 text-red-600 font-medium">
                            {t.type === 'debit' ? `₹${Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-green-600 font-medium">
                            {t.type === 'credit' ? `₹${Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {t.balance != null ? `₹${Number(t.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Reports;