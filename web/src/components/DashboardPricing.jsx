import { useState, useEffect } from 'react';

const DashboardPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRazorpayPayment = async () => {
    const token = localStorage.getItem('authToken');
    const userInfoString = localStorage.getItem('userInfo');

    if (!token || !userInfoString) {
      alert('Please login to continue with payment.');
      return;
    }

    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    const amount = isMonthly ? 199 : 2148;
    let userInfo;

    try {
      userInfo = JSON.parse(userInfoString);
    } catch {
      alert('Session error. Please refresh and try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order on backend
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payment/create-order`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            billing: isMonthly ? 'monthly' : 'yearly',
          }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(`Failed to initiate payment: ${orderData.message || 'Please try again.'}`);
        setIsLoading(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'FintrackAI',
        description: `Pro Plan - ${isMonthly ? 'Monthly' : 'Yearly'} Subscription`,
        image: 'https://cdn-icons-png.flaticon.com/512/2920/2920349.png',
        handler: async function (response) {
          try {
            const paymentResult = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payment/process`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amount * 100,
                  plan: 'Pro',
                  billing: isMonthly ? 'monthly' : 'yearly',
                }),
              }
            );

            const paymentData = await paymentResult.json();

            if (paymentData.success) {
              userInfo.plan = 'Pro';
              userInfo.planEndDate = paymentData.data.validUntil;
              localStorage.setItem('userInfo', JSON.stringify(userInfo));

              alert(
                `🎉 Payment Successful!\n\n` +
                  `Welcome to Pro Plan!\n` +
                  `Valid until: ${new Date(paymentData.data.validUntil).toLocaleDateString()}\n\n` +
                  `All premium features are now unlocked!`
              );

              window.location.reload();
            } else {
              alert(`Payment verification failed: ${paymentData.message}`);
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userInfo.name || 'User',
          email: userInfo.email || '',
          contact: userInfo.phone || '',
        },
        notes: {
          plan: 'Pro',
          billing: isMonthly ? 'monthly' : 'yearly',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', async function (response) {
        console.error('Payment failed:', response.error);

        try {
          await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payment/record-failure`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.error?.metadata?.order_id || orderData.orderId,
                razorpay_payment_id: response.error?.metadata?.payment_id,
                error_code: response.error?.code,
                error_description: response.error?.description,
                plan: 'Pro',
                billing: isMonthly ? 'monthly' : 'yearly',
              }),
            }
          );
        } catch (err) {
          console.warn('Failed to record payment failure:', err);
        }

        alert(
          `Payment Failed\n\n` +
            `${response.error.description || 'Unknown error'}\n\n` +
            `Please try again or contact support.`
        );
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      alert('Unable to open payment gateway. Please try again.');
      setIsLoading(false);
    }
  };

  const userPlan = JSON.parse(localStorage.getItem('userInfo') || '{}').plan || 'Basic';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <i className="fas fa-sparkles text-amber-500"></i> Subscription & Pricing
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Flexible Plans for Every Budget
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Unlock unlimited statements, deeper AI analytics, and personalized budget planning.
        </p>

        {/* Billing Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl mt-6 border border-slate-200">
          <button
            onClick={() => setIsMonthly(true)}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              isMonthly
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsMonthly(false)}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              !isMonthly
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Billing
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Basic Card */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Tier</span>
                <h3 className="text-xl font-bold text-slate-900">Basic Plan</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                <i className="fas fa-leaf"></i>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Essential personal tracking tools for casual everyday spenders.
            </p>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-200">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600">
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>5 statement uploads per month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Basic AI categorization</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>Summary spending charts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-500"></i>
                <span>7-day history retention</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <i className="fas fa-times-circle"></i>
                <span>No budget alert forecasting</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-200 text-slate-500 cursor-not-allowed text-center"
          >
            {userPlan === 'Basic' ? 'Current Plan' : 'Free Default'}
          </button>
        </div>

        {/* Pro Card (Highlighted) */}
        <div className="bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-700/50 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-sm">
            Popular Choice
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Premium Access</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Pro Plan
                  <i className="fas fa-crown text-amber-400 text-sm"></i>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                <i className="fas fa-bolt"></i>
              </div>
            </div>

            <p className="text-xs text-indigo-200/80 mb-6">
              Complete automated intelligence with unlimited storage & deep insight reports.
            </p>

            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-indigo-800/60">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {isMonthly ? '₹199' : '₹2,148'}
              </span>
              <span className="text-xs text-indigo-300">
                {isMonthly ? '/ month' : '/ year (save ₹240)'}
              </span>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm text-indigo-100">
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span><strong>Unlimited</strong> statement uploads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span>Advanced AI categorization & anomaly detection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span>Dynamic spending forecasts & monthly budgets</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span>One-click PDF & Excel report exports</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span>Priority email & developer support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleRazorpayPayment}
            disabled={isLoading || userPlan === 'Pro'}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              userPlan === 'Pro'
                ? 'bg-emerald-600 text-white cursor-default'
                : isLoading
                ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-indigo-500/25'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing Checkout...
              </>
            ) : userPlan === 'Pro' ? (
              <>
                <i className="fas fa-check-circle"></i> Current Active Plan
              </>
            ) : (
              <>
                <i className="fas fa-sparkles text-amber-300"></i> Upgrade to Pro Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust & Guarantee Footer */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <i className="fas fa-shield-alt text-emerald-500"></i>
          <span>Secure checkout encrypted via Razorpay (PCI-DSS Level 1)</span>
        </div>
        <div>
          <span>Cancel or switch plans anytime from your profile settings</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPricing;
