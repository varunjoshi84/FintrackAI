import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([
    { date: '01/12/2024', amount: '-45.67', category: 'Food' },
    { date: '02/12/2024', amount: '-89.99', category: 'Travel' },
    { date: '03/12/2024', amount: '2500', category: 'Salary' },
    { date: '04/12/2024', amount: '-125.5', category: 'Bills' },
    { date: '05/12/2024', amount: '-39.99', category: 'Entertainment' },
  ]);
  const [transactionCount, setTransactionCount] = useState(10);
  const [isDarkMode] = useState(() => localStorage.getItem('fintrack-theme') === 'dark');

  const categories = ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Other'];

  // Animation effects
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.remove('opacity-0');
        element.classList.add(element.dataset.animation);
      }, index * 200);
    });
  }, []);

  const addRandomTransaction = () => {
    const amount = (Math.random() * 200 - 100).toFixed(2);
    const today = new Date().toLocaleDateString('en-GB');
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const newTransaction = { date: today, amount, category };
    setTransactions([newTransaction, ...transactions]);
    setTransactionCount(prev => prev + 1);
  };

  return (
    <div className={`bg-gray-50 font-inter ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header />

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8" data-animation="animate-fade-in-up">
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg tracking-wide">
            <i className="fas fa-chart-line mr-2 text-blue-500 animate-pulse"></i>
            Financial Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Your complete financial overview for July</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-animation="animate-fade-in-up">
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spending</h3>
            <p id="totalSpending" className="text-2xl font-bold text-gray-900">₹671.1</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Savings</h3>
            <p id="totalSavings" className="text-2xl font-bold text-gray-900">₹12,340</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Top Category</h3>
            <p id="topCategory" className="text-2xl font-bold text-gray-900">Food & Dining</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
            <p id="transactionCount" className="text-2xl font-bold text-gray-900">{transactionCount} Transactions</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" data-animation="animate-fade-in-up delay-75">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">Chart will be available soon</p>
                <p className="text-sm text-gray-400">Weekly spending trends</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-pie text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">Chart will be available soon</p>
                <p className="text-sm text-gray-400">Spending by category</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm" data-animation="animate-fade-in-up delay-150">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <ul id="transactionList" className="space-y-3">
            {transactions.map((transaction, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{transaction.date}</span>
                <span className={`text-sm font-medium ${parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{transaction.amount}
                </span>
                <span className="text-xs text-gray-500">({transaction.category})</span>
              </li>
            ))}
          </ul>
          <button 
            id="addTransactionBtn" 
            onClick={addRandomTransaction}
            className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-md hover:opacity-90 transition duration-300"
          >
            ➕ Add Transaction
          </button>
        </section>
      </main>

      <Footer />

      <style>{`
        /* Dashboard CSS */
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #f8f9fc;
          color: #2e2e2e;
        }

        .card {
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
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

        [data-animation] {
          opacity: 0;
        }

        .dark-mode {
          background-color: #0f172a;
          color: #f8fafc;
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

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
