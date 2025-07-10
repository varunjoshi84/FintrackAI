import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Dashboard/Header';
import Footer from './components/Footer';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const staticTransactions = [
    { desc: "Grocery Shopping", date: "2024-06-01", category: "Food & Dining", amount: "1200" },
    { desc: "Uber Ride", date: "2024-06-02", category: "Transportation", amount: "350" },
    { desc: "Salary", date: "2024-06-03", category: "Income", amount: "50000" },
    { desc: "Electricity Bill", date: "2024-06-04", category: "Utilities", amount: "1800" },
    { desc: "Movie Night", date: "2024-06-05", category: "Entertainment", amount: "600" },
    { desc: "Rent Payment", date: "2024-06-06", category: "Housing", amount: "15000" },
    { desc: "Online Shopping", date: "2024-06-07", category: "Shopping", amount: "2500" },
    { desc: "Coffee", date: "2024-06-08", category: "Food & Dining", amount: "150" },
    { desc: "Metro Card Recharge", date: "2024-06-09", category: "Transportation", amount: "500" },
    { desc: "Freelance Project", date: "2024-06-10", category: "Income", amount: "12000" },
    { desc: "Water Bill", date: "2024-06-11", category: "Utilities", amount: "400" },
    { desc: "Concert Ticket", date: "2024-06-12", category: "Entertainment", amount: "2000" },
    { desc: "Furniture Purchase", date: "2024-06-13", category: "Housing", amount: "7000" },
    { desc: "Clothing", date: "2024-06-14", category: "Shopping", amount: "3200" },
    { desc: "Dinner Out", date: "2024-06-15", category: "Food & Dining", amount: "900" },
  ];

  const categoryColors = {
    "Food & Dining": "bg-green-100 text-green-800",
    "Transportation": "bg-blue-100 text-blue-800",
    "Income": "bg-green-100 text-green-800",
    "Entertainment": "bg-purple-100 text-purple-800",
    "Utilities": "bg-yellow-100 text-yellow-800",
    "Housing": "bg-pink-100 text-pink-800",
    "Shopping": "bg-blue-100 text-blue-800",
  };

  const getIndicatorColor = (category) => {
    const colorClass = categoryColors[category] || "bg-gray-100 text-gray-800";
    return colorClass.includes("green") ? "bg-green-500" :
           colorClass.includes("blue") ? "bg-blue-500" :
           colorClass.includes("purple") ? "bg-purple-500" :
           colorClass.includes("yellow") ? "bg-yellow-500" :
           colorClass.includes("pink") ? "bg-pink-500" :
           "bg-gray-500";
  };

  const addTransaction = () => {
    // Simulate adding transaction (e.g., to state or API)
    console.log({ description, date, category, amount });
    setIsModalOpen(false);
    setDescription('');
    setDate('');
    setCategory('');
    setAmount('');
  };

  const filteredTransactions = staticTransactions.filter(tx =>
    tx.desc.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === "All Categories" || tx.category === categoryFilter)
  );

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
              <p className="text-gray-600 text-sm mt-1">Manage and track all your financial transactions</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Add Transaction
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search transactions..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="sm:w-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>Food & Dining</option>
              <option>Transportation</option>
              <option>Income</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Housing</option>
              <option>Shopping</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 text-sm">{tx.date}</td>
                    <td className="px-4 py-2 text-sm flex items-center">
                      <span className={`w-2 h-2 ${getIndicatorColor(tx.category)} rounded-full mr-2`}></span>
                      {tx.desc}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 ${categoryColors[tx.category] || "bg-gray-100 text-gray-800"} rounded`}>{tx.category}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-red-500">₹{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-4">
            <div className="text-sm text-gray-600">Showing 1-10 of {filteredTransactions.length} transactions</div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">Previous</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <div
          id="addTransactionModal"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${isModalOpen ? '' : 'hidden'}`}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
            <div className="space-y-4">
              <input
                id="desc"
                type="text"
                placeholder="Description"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                id="date"
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                id="category"
                type="text"
                placeholder="Category"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                id="amount"
                type="number"
                placeholder="Amount (₹)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              onClick={addTransaction}
            >
              Add Transaction
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transactions;