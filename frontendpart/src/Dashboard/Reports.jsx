import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Dashboard/Header';
import Footer from './components/Footer';

const Reports = () => {
  const [reportType, setReportType] = useState('Monthly Report');
  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2024-07-04');

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

          {/* Stats */}
          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-500">Total Spending</div>
                <div className="text-2xl font-semibold">₹617.1</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-500">Transactions</div>
                <div className="text-2xl font-semibold">10</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-500">Avg. per Transaction</div>
                <div className="text-2xl font-semibold">₹62</div>
              </div>
            </div>

            {/* Spending Category */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
              <ul className="text-sm">
                <li className="flex justify-between mb-1 text-red-600">Food & Dining <span className="text-gray-900">₹186.92 (30.3%)</span></li>
                <li className="flex justify-between mb-1 text-yellow-500">Housing <span className="text-gray-900">₹200 (32.4%)</span></li>
                <li className="flex justify-between mb-1 text-blue-600">Transportation <span className="text-gray-900">₹89.99 (14.6%)</span></li>
                <li className="flex justify-between mb-1 text-green-600">Utilities <span className="text-gray-900">₹75.2 (12.2%)</span></li>
                <li className="flex justify-between mb-1 text-cyan-600">Entertainment <span className="text-gray-900">₹39.99 (6.5%)</span></li>
              </ul>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>01/12/2024 • Food & Dining <span className="float-right">₹-45.67</span></li>
                <li>02/12/2024 • Transportation <span className="float-right">₹-89.99</span></li>
                <li>01/12/2024 • Income <span className="float-right">₹2,500</span></li>
                <li>03/12/2024 • Food & Dining <span className="float-right">₹-125.5</span></li>
                <li>04/12/2024 • Entertainment <span className="float-right">₹-39.99</span></li>
                <li>05/12/2024 • Utilities <span className="float-right">₹-75.2</span></li>
                <li>01/12/2024 • Housing <span className="float-right">₹-200</span></li>
                <li>06/12/2024 • Shopping <span className="float-right">₹-25.99</span></li>
                <li>07/12/2024 • Income <span className="float-right">₹150</span></li>
                <li>08/12/2024 • Food & Dining <span className="float-right">₹-15.75</span></li>
              </ul>
            </div>

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