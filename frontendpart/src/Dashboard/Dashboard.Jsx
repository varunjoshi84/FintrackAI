import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const Dashboard = () => {
  const [transactionCount, setTransactionCount] = useState(5); // Initial count from HTML
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('fintrack-theme') === 'dark');
  const [transactions, setTransactions] = useState([
    { date: '01/12/2024', amount: '-45.67', category: 'Food' },
    { date: '02/12/2024', amount: '-89.99', category: 'Travel' },
    { date: '03/12/2024', amount: '2500', category: 'Salary' },
    { date: '04/12/2024', amount: '-125.5', category: 'Bills' },
    { date: '05/12/2024', amount: '-39.99', category: 'Entertainment' },
  ]);

  const categories = ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Other'];

  const addRandomTransaction = () => {
    const amount = (Math.random() * 200 - 100).toFixed(2);
    const today = new Date().toLocaleDateString('en-GB');
    const category = categories[Math.floor(Math.random() * categories.length)];
    setTransactions([{ date: today, amount, category }, ...transactions]);
    setTransactionCount((prev) => prev + 1);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('fintrack-theme', newDarkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    // Simulate fade-in-up animation (CSS animation replaced with React state)
  }, []);

  return (
    <div className={`bg-gray-50 font-inter ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg tracking-wide">
            <i className="fas fa-chart-line mr-2 text-blue-500 animate-pulse"></i>
            Financial Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Your complete financial overview for July</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spending</h3>
            <p className="text-2xl font-bold text-gray-900">₹671.1</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Savings</h3>
            <p className="text-2xl font-bold text-gray-900">₹12,340</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Top Category</h3>
            <p className="text-2xl font-bold text-gray-900">Food & Dining</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
            <p className="text-2xl font-bold text-gray-900">{transactionCount} Transactions</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
            {/* Replace with canvas panel chart */}
            <div className="canvas-panel">
              {/* Request chart generation */}
              Would you like me to generate a line chart for Spending Trend with labels ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] and data [500, 300, 200, 800, 600, 450, 700]?
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            {/* Replace with canvas panel chart */}
            <div className="canvas-panel">
              {/* Request chart generation */}
              Would you like me to generate a pie chart for Category Breakdown with labels ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Others'] and data [300, 150, 100, 200, 120]?
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <ul className="space-y-3">
            {transactions.map((tx, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{tx.date}</span>
                <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>₹{tx.amount}</span>
                <span className="text-xs text-gray-500">({tx.category})</span>
              </li>
            ))}
          </ul>
          <button
            id="addTransactionBtn"
            className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-md hover:opacity-90 transition duration-300"
            onClick={addRandomTransaction}
          >
            ➕ Add Transaction
          </button>
        </section>
      </main>
      <Footer />
      <button
        id="themeToggle"
        className="fixed bottom-4 right-4 p-3 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition"
        onClick={toggleDarkMode}
      >
        <i id="themeIcon" className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </div>
  );
};

export default Dashboard;