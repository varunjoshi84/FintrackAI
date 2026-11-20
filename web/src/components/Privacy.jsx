import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Privacy = () => {
  return (
    <div className="bg-gray-50 text-gray-800 font-inter min-h-screen flex flex-col justify-between">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
        <p className="text-sm text-gray-500 text-center mb-12">Last Updated: November 2026</p>

        <div className="space-y-8 text-gray-700 text-base leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">1. No Bank Credentials Stored</h2>
            <p>FinTrackAI operates on a zero-credential architecture. We never ask for, access, or store your net-banking passwords, UPI PINs, or debit/credit card numbers. All document ingestion relies on user-initiated statement uploads.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">2. AI-Powered Financial Intelligence & Third-Party Processing</h2>
            <p>
              To generate automated budget categorizations, anomaly alerts, and actionable money-saving insights, anonymized and aggregate transaction descriptions, categories, and amounts may be processed by enterprise AI models (such as Google Gemini and Hugging Face inference APIs) via encrypted backend-to-backend proxies.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Personal identifiers (such as account numbers, phone numbers, and physical addresses) are sanitized or excluded prior to inference queries.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">3. Statement File Ingestion & Temporary Storage</h2>
            <p>Uploaded PDF and CSV files are parsed in isolated server memory. Temporary files generated during parsing are immediately unlinked and deleted from storage once transaction entities are normalized and secured in our relational database.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">4. Payment Information</h2>
            <p>All subscription billing transactions are processed securely through Razorpay using PCI-DSS compliant checkout gateways. FinTrackAI does not hold or store complete credit card or payment credential payloads on our servers.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">5. Data Retention & Right to Erasure</h2>
            <p>You have full ownership of your data. You may export your financial history or permanently delete your account at any time through Account Settings. Deletion cascades across both our document stores and relational ledgers.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">6. Contact & Data Protection Officer</h2>
            <p>
              For privacy inquiries, audit requests, or data deletion confirmations, reach our team anytime at{' '}
              <a href="mailto:support@fintrackai.in" className="text-blue-600 font-medium underline">
                support@fintrackai.in
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
