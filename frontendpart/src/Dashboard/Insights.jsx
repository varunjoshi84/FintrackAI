import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from '../components/Footer';

const Insights = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    alert('Generating new insights...');
    setIsGenerating(false);
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left section: Insights */}
          <section className="md:col-span-2 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">AI Financial Insights</h1>
                <p className="text-sm text-slate-500 mt-1">Get personalized recommendations and discover spending patterns</p>
              </div>
              <button
                id="generateBtn"
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3 md:mt-0"
                onClick={handleGenerateInsights}
                disabled={isGenerating}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Generate New Insights
              </button>
            </header>

            {/* Insight Cards */}
            <article className="bg-white rounded-lg shadow p-5 border border-transparent hover:border-red-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                    />
                  </svg>
                  <h2 className="font-semibold text-slate-900 text-sm">High Spending Alert</h2>
                  <span className="text-xs bg-red-100 text-red-700 rounded-md px-2 py-0.5 font-semibold uppercase tracking-wide select-none">Warning</span>
                  <span className="text-xs bg-slate-200 text-slate-700 rounded-md px-2 py-0.5 font-semibold">AI Generated</span>
                </div>
              </div>
              <p className="text-slate-700 mt-3 text-sm leading-snug max-w-xl">Your dining expenses are 23% higher than last month</p>
              <div className="mt-4 text-slate-600 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <div className="space-x-1">
                  <span className="font-semibold text-slate-900">Category:</span>
                  <span>Food & Dining</span>
                </div>
                <div className="text-green-700 font-semibold">₹186.92</div>
                <div>08/12/2024</div>
              </div>
            </article>

            <article className="bg-white rounded-lg shadow p-5 border border-transparent hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m0 6a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                  <h2 className="font-semibold text-slate-900 text-sm">Savings Opportunity</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 rounded-md px-2 py-0.5 font-semibold uppercase tracking-wide select-none">Suggestion</span>
                  <span className="text-xs bg-slate-200 text-slate-700 rounded-md px-2 py-0.5 font-semibold">AI Generated</span>
                </div>
              </div>
              <p className="text-slate-700 mt-3 text-sm leading-snug max-w-xl">Consider switching to a cheaper subscription plan</p>
              <div className="mt-4 text-slate-600 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <div className="space-x-1">
                  <span className="font-semibold text-slate-900">Category:</span>
                  <span>Entertainment</span>
                </div>
                <div className="text-green-700 font-semibold">₹39.99</div>
                <div>07/12/2024</div>
              </div>
            </article>

            <article className="bg-white rounded-lg shadow p-5 border border-transparent hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m-2 6a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                  <h2 className="font-semibold text-slate-900 text-sm">Budget Achievement</h2>
                  <span className="text-xs bg-green-100 text-green-700 rounded-md px-2 py-0.5 font-semibold uppercase tracking-wide select-none">Success</span>
                  <span className="text-xs bg-slate-200 text-slate-700 rounded-md px-2 py-0.5 font-semibold">AI Generated</span>
                </div>
              </div>
              <p className="text-slate-700 mt-3 text-sm leading-snug max-w-xl">You stayed within your transportation budget this month</p>
              <div className="mt-4 text-slate-600 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <div className="space-x-1">
                  <span className="font-semibold text-slate-900">Category:</span>
                  <span>Transportation</span>
                </div>
                <div className="text-green-700 font-semibold">₹89.99</div>
                <div>06/12/2024</div>
              </div>
            </article>
          </section>

          {/* Right section: Stats and Tips */}
          <aside className="flex flex-col gap-6">
            <section className="bg-white rounded-lg shadow p-5">
              <header className="flex items-center gap-2 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg>
                <h3 className="font-semibold text-slate-900 text-base">Quick Stats</h3>
              </header>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex justify-between">
                  <span>Total Insights</span>
                  <span className="font-semibold">3</span>
                </li>
                <li className="flex justify-between">
                  <span>This Month</span>
                  <span className="font-semibold text-green-600">₹2,650</span>
                </li>
                <li className="flex justify-between">
                  <span>Savings Goal</span>
                  <span className="font-semibold text-blue-600">₹5,000</span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-lg shadow p-5">
              <header className="flex items-center gap-2 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 12h.01"
                  />
                </svg>
                <h3 className="font-semibold text-slate-900 text-base">Financial Tips</h3>
              </header>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="bg-blue-100 rounded-md px-3 py-2 leading-tight">
                  Track your spending daily to identify patterns and opportunities for savings.
                </li>
                <li className="bg-green-100 rounded-md px-3 py-2 leading-tight">
                  Set up automatic transfers to your savings account to build wealth consistently.
                </li>
                <li className="bg-amber-100 rounded-md px-3 py-2 leading-tight">
                  Review your subscriptions monthly to eliminate unnecessary expenses.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Insights;