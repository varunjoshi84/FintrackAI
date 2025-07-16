import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from '../components/Footer';
import { getDashboardData } from '../api';

const Dashboard = () => {
  const [transactionCount, setTransactionCount] = useState(10);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const spendingChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const spendingChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);
  const transactionListRef = useRef(null);

  const categories = ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Other'];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardData();
        
        if (result.success) {
          setDashboardData(result.data);
          setTransactionCount(result.data.transactionCount || 10);
        } else {
          setError(result.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data loading error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Initialize charts
  useEffect(() => {
    const initializeCharts = async () => {
      try {
        // Import Chart.js dynamically
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        // Wait for DOM to be ready and destroy existing charts
        setTimeout(() => {
          // Destroy existing charts if they exist
          if (spendingChartInstance.current) {
            spendingChartInstance.current.destroy();
          }
          if (categoryChartInstance.current) {
            categoryChartInstance.current.destroy();
          }

          // Spending Trend Chart
          if (spendingChartRef.current) {
            const ctx = spendingChartRef.current.getContext('2d');
            spendingChartInstance.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                  label: '₹ Spent',
                  data: [500, 300, 200, 800, 600, 450, 700],
                  backgroundColor: 'rgba(59,130,246,0.2)',
                  borderColor: 'rgba(59,130,246,1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                      boxWidth: window.innerWidth < 480 ? 8 : 10,
                      padding: window.innerWidth < 480 ? 10 : 15,
                      font: {
                        size: window.innerWidth < 480 ? 9 : window.innerWidth < 640 ? 10 : 12
                      }
                    }
                  },
                  tooltip: {
                    titleFont: {
                      size: window.innerWidth < 480 ? 10 : 12
                    },
                    bodyFont: {
                      size: window.innerWidth < 480 ? 9 : 11
                    },
                    padding: window.innerWidth < 480 ? 6 : 10
                  }
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    grid: {
                      display: window.innerWidth >= 480
                    },
                    ticks: {
                      maxTicksLimit: window.innerWidth < 480 ? 4 : 6,
                      font: {
                        size: window.innerWidth < 480 ? 8 : window.innerWidth < 640 ? 9 : 11
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: window.innerWidth >= 480
                    },
                    ticks: {
                      maxRotation: window.innerWidth < 480 ? 45 : 0,
                      font: {
                        size: window.innerWidth < 480 ? 8 : window.innerWidth < 640 ? 9 : 11
                      }
                    }
                  }
                }
              }
            });
          }

          // Category Breakdown Chart
          if (categoryChartRef.current) {
            const ctx = categoryChartRef.current.getContext('2d');
            categoryChartInstance.current = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Others'],
                datasets: [{
                  label: 'Spending by Category',
                  data: [300, 150, 100, 200, 120],
                  backgroundColor: [
                    '#3b82f6', // blue
                    '#f97316', // orange
                    '#10b981', // green
                    '#facc15', // yellow
                    '#a855f7'  // purple
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: window.innerWidth < 480 ? 'right' : 'bottom',
                    align: 'center',
                    labels: { 
                      boxWidth: window.innerWidth < 480 ? 8 : 10,
                      font: { 
                        size: window.innerWidth < 480 ? 9 : window.innerWidth < 640 ? 10 : 12 
                      },
                      padding: window.innerWidth < 480 ? 6 : window.innerWidth < 640 ? 10 : 15,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    titleFont: {
                      size: window.innerWidth < 480 ? 10 : 12
                    },
                    bodyFont: {
                      size: window.innerWidth < 480 ? 9 : 11
                    },
                    padding: window.innerWidth < 480 ? 6 : 10,
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ₹${value}`;
                      }
                    }
                  }
                },
                layout: {
                  padding: {
                    top: 10,
                    bottom: window.innerWidth < 480 ? 0 : 10,
                    left: 0,
                    right: 0
                  }
                }
              }
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing charts:', error);
      }
    };

    initializeCharts();

    // Cleanup function
    return () => {
      if (spendingChartInstance.current) {
        spendingChartInstance.current.destroy();
        spendingChartInstance.current = null;
      }
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
        categoryChartInstance.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Random transaction generator with category
  const randomTransaction = () => {
    const amount = (Math.random() * 200 - 100).toFixed(2); // -100 to +100
    const today = new Date().toLocaleDateString("en-GB");
    const category = categories[Math.floor(Math.random() * categories.length)];

    return `
      <li class="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
        <span class="text-xs sm:text-sm text-gray-600">${today}</span>
        <span class="text-xs sm:text-sm font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}">₹${amount}</span>
        <span class="text-xs text-gray-500">(${category})</span>
      </li>
    `;
  };

  // Handle Add Transaction
  const addTransaction = () => {
    if (transactionListRef.current) {
      transactionListRef.current.insertAdjacentHTML("afterbegin", randomTransaction());
      setTransactionCount(prev => prev + 1);
    }
  };

  // Apply saved theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("fintrack-theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  return (
    <div className="bg-gray-50 font-inter dashboard-page">
      <Header />

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 dashboard-content">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg tracking-wide animate-fade-in-up">
            <i className="fas fa-chart-line mr-2 text-blue-500 animate-pulse"></i>
            Financial Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Your complete financial overview for July</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Spending</h3>
            <p id="totalSpending" className="text-xl sm:text-2xl font-bold text-gray-900">₹671.1</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Savings</h3>
            <p id="totalSavings" className="text-xl sm:text-2xl font-bold text-gray-900">₹12,340</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Top Category</h3>
            <p id="topCategory" className="text-xl sm:text-2xl font-bold text-gray-900">Food & Dining</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">This Month</h3>
            <p id="transactionCount" className="text-xl sm:text-2xl font-bold text-gray-900">{transactionCount} Transactions</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8 animate-fade-in-up delay-75">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
            <div className="chart-container w-full h-64 sm:h-72 lg:h-80">
              <canvas ref={spendingChartRef} id="spendingChart" className="w-full h-full"></canvas>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="chart-container w-full h-64 sm:h-72 lg:h-80">
              <canvas ref={categoryChartRef} id="categoryChart" className="w-full h-full"></canvas>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-4 sm:p-6 shadow-sm animate-fade-in-up delay-150">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto transactions-container">
            <ul ref={transactionListRef} id="transactionList" className="space-y-2 sm:space-y-3 transaction-list">
              <li className="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
                <span className="text-xs sm:text-sm text-gray-600">01/12/2024</span>
                <span className="text-xs sm:text-sm font-medium text-red-600">₹-45.67</span>
                <span className="text-xs text-gray-500">(Food)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
                <span className="text-xs sm:text-sm text-gray-600">02/12/2024</span>
                <span className="text-xs sm:text-sm font-medium text-red-600">₹-89.99</span>
                <span className="text-xs text-gray-500">(Travel)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
                <span className="text-xs sm:text-sm text-gray-600">03/12/2024</span>
                <span className="text-xs sm:text-sm font-medium text-green-600">₹2,500</span>
                <span className="text-xs text-gray-500">(Salary)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
                <span className="text-xs sm:text-sm text-gray-600">04/12/2024</span>
                <span className="text-xs sm:text-sm font-medium text-red-600">₹-125.5</span>
                <span className="text-xs text-gray-500">(Bills)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-gray-100 transaction-item">
                <span className="text-xs sm:text-sm text-gray-600">05/12/2024</span>
                <span className="text-xs sm:text-sm font-medium text-red-600">₹-39.99</span>
                <span className="text-xs text-gray-500">(Entertainment)</span>
              </li>
            </ul>
          </div>
          <button 
            id="addTransactionBtn" 
            onClick={addTransaction}
            className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-full shadow-md hover:opacity-90 transition duration-300 text-sm sm:text-base"
          >
            ➕ Add Transaction
          </button>
        </section>
      </main>

      <Footer />

      <style>{`
        /* Dashboard CSS - scoped to avoid global conflicts */
        .dashboard-page {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #f8f9fc;
          color: #2e2e2e;
        }

        /* Chart container responsiveness */
        .chart-container {
          position: relative;
          width: 100%;
        }

        .chart-container canvas {
          max-width: 100%;
          height: auto !important;
        }

        /* Scoped styles for legacy CSS, not affecting React Header */
        .legacy-header {
          background: #ffffff;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .legacy-header h1 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .legacy-nav a {
          margin-left: 2rem;
          text-decoration: none;
          color: #4a5568;
          font-weight: 600;
        }

        .container {
          padding: 2rem;
        }

        .container h2 {
          font-size: x-large;
          font-weight: bold;
        }

        .cards {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 1.5rem;
          flex: 1 1 200px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-section {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .chart, .category {
          flex: 1 1 300px;
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .placeholder {
          height: 150px;
          background-color: #edf2f7;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #718096;
        }

        .transactions {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 12px;
          margin-top: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .transactions ul {
          list-style: none;
          margin-top: 1rem;
          padding: 0;
        }

        .transactions li {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #edf2f7;
        }

        .dashboard-content button {
          padding: 0.75rem 1rem;
          background-color: #3182ce;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        .dashboard-content button:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }

        .dashboard-content button:hover:not(:disabled) {
          background-color: #2b6cb0;
        }

        @media (max-width: 768px) {
          header {
            flex-direction: column;
            align-items: flex-start;
          }

          nav a {
            margin-left: 1rem;
            margin-top: 0.5rem;
          }

          .cards, .chart-section {
            flex-direction: column;
          }
          
          /* Enhanced responsive design for transactions */
          .transactions-container {
            margin: 0 -0.5rem;
          }
          
          .transaction-item {
            padding: 0.5rem 0.25rem;
          }
          
          /* Better scaling for stats cards */
          .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div {
            padding: 0.75rem !important;
          }
        }

        .card {
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 480px) {
          .container {
            padding: 1rem;
          }

          nav a {
            font-size: 0.9rem;
          }
        }

        footer {
          background-color: #1e293b;
          color: white;
          padding: 4rem 1rem;
        }

        footer a, footer p, footer h4, footer span {
          color: #cbd5e1;
        }

        footer a:hover {
          color: white;
        }

        footer input {
          background-color: #1e293b;
          border: 1px solid #334155;
          color: white;
        }

        footer button {
          background-color: #2563eb;
          color: white;
        }

        footer button:hover {
          background-color: #1d4ed8;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }

        .animate-fade-in-up.delay-75 {
          animation-delay: 0.2s;
        }

        .animate-fade-in-up.delay-150 {
          animation-delay: 0.4s;
        }

        .dark-mode {
          background-color: #0f172a;
          color: #f8fafc;
        }

        .dark-mode header,
        .dark-mode main,
        .dark-mode .card,
        .dark-mode .chart,
        .dark-mode .category,
        .dark-mode .transactions {
          background-color: #1e293b;
          color: #f1f5f9;
        }

        .dark-mode button {
          background-color: #3b82f6;
        }

        .dark-mode nav a {
          color: #cbd5e1;
        }

        .dark-mode .bg-white {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
        }

        .dark-mode .text-gray-900 {
          color: #f1f5f9 !important;
        }

        .dark-mode .text-gray-600 {
          color: #cbd5e1 !important;
        }

        .dark-mode .text-gray-500 {
          color: #94a3b8 !important;
        }

        .dark-mode .border-gray-100 {
          border-color: #334155 !important;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .dashboard-content {
            padding: 1.5rem;
          }
          
          .chart-container {
            height: 300px !important;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }
          
          .chart-container {
            height: 250px !important;
          }
          
          /* Better mobile grid for stats cards */
          .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          /* Responsive font sizes */
          .text-2xl.sm\\:text-3xl.lg\\:text-4xl {
            font-size: 1.75rem !important;
          }
          
          .text-xl.sm\\:text-2xl {
            font-size: 1.25rem !important;
          }
        }

        @media (max-width: 480px) {
          /* Single column on very small screens */
          .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 {
            grid-template-columns: 1fr;
          }
          
          .chart-container {
            height: 200px !important;
          }
          
          /* Stack charts vertically on mobile */
          .grid-cols-1.xl\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          /* More compact padding */
          .p-4.sm\\:p-6 {
            padding: 0.75rem !important;
          }
          
          /* Responsive font sizes for small screens */
          .text-2xl.sm\\:text-3xl.lg\\:text-4xl {
            font-size: 1.5rem !important;
          }
          
          .text-xl.sm\\:text-2xl {
            font-size: 1.125rem !important;
          }
          
          .text-base.sm\\:text-lg {
            font-size: 0.938rem !important;
          }
        }

        @media (max-width: 360px) {
          .chart-container {
            height: 180px !important;
          }
          
          .p-4.sm\\:p-6 {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
