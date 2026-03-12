import { useState, useEffect } from 'react';

const DashboardPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log('Razorpay SDK loaded successfully');
    script.onerror = () => console.error('Failed to load Razorpay SDK');
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
      // ✅ STEP 1: Create order on backend first
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

      // ✅ STEP 2: Open Razorpay checkout with the real order_id
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId, // ← THIS was missing before
        name: 'FintrackAI',
        description: `Pro Plan - ${isMonthly ? 'Monthly' : 'Yearly'} Subscription`,
        image: 'https://cdn-icons-png.flaticon.com/512/2920/2920349.png',
        handler: async function (response) {
          try {
            console.log('Payment successful:', response);

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
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled by user');
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
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

  const pricingData = {
    monthly: {
      basic: '₹0',
      pro: '₹199',
      enterprise: '₹999',
    },
    yearly: {
      basic: '₹0',
      pro: '₹2,148',
      enterprise: '₹10,788',
    },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
      {/* Razorpay Test Mode Badge */}
     

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
          <i className="fas fa-crown text-white text-xl"></i>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Upgrade Your Plan
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Unlock powerful AI insights and advanced features
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
            isMonthly
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:text-gray-800 shadow-md border border-gray-200'
          }`}
          onClick={() => setIsMonthly(true)}
        >
          Monthly
        </button>
        <button
          className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
            !isMonthly
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:text-gray-800 shadow-md border border-gray-200'
          }`}
          onClick={() => setIsMonthly(false)}
        >
          Yearly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-check text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userPlan} Plan</h3>
                <p className="text-sm text-gray-500">Current Plan</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {userPlan === 'Basic'
                  ? pricingData[isMonthly ? 'monthly' : 'yearly'].basic
                  : userPlan === 'Pro'
                  ? pricingData[isMonthly ? 'monthly' : 'yearly'].pro
                  : pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}
              </span>
              <span className="text-gray-500">/{isMonthly ? 'month' : 'year'}</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            {userPlan === 'Basic' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-upload text-green-500 w-5"></i>
                  <span className="text-gray-700">5 statements per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-robot text-green-500 w-5"></i>
                  <span className="text-gray-700">Basic AI categorization</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-bar text-green-500 w-5"></i>
                  <span className="text-gray-700">Simple dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-clock text-green-500 w-5"></i>
                  <span className="text-gray-700">7-day data retention</span>
                </li>
              </>
            ) : userPlan === 'Pro' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-infinity text-green-500 w-5"></i>
                  <span className="text-gray-700">Unlimited uploads</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-brain text-green-500 w-5"></i>
                  <span className="text-gray-700">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-pie text-green-500 w-5"></i>
                  <span className="text-gray-700">Budget planning & alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-file-export text-green-500 w-5"></i>
                  <span className="text-gray-700">PDF/Excel exports</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-star text-green-500 w-5"></i>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-users text-green-500 w-5"></i>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-shield-alt text-green-500 w-5"></i>
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-cogs text-green-500 w-5"></i>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
              </>
            )}
          </ul>

          <button className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Upgrade Plan */}
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
            {userPlan === 'Basic' ? 'Most Popular' : 'Enterprise'}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <i
                  className={`fas ${userPlan === 'Basic' ? 'fa-rocket' : 'fa-building'} text-white text-lg`}
                ></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userPlan === 'Basic' ? 'Pro Plan' : 'Enterprise Plan'}
                </h3>
                <p className="text-sm text-purple-600">
                  {userPlan === 'Basic' ? 'Recommended' : 'For Teams'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {userPlan === 'Basic'
                  ? pricingData[isMonthly ? 'monthly' : 'yearly'].pro
                  : pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}
              </span>
              <span className="text-gray-500">/{isMonthly ? 'month' : 'year'}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isMonthly ? 'Billed monthly' : 'Billed annually'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            {userPlan === 'Basic' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-infinity text-purple-500 w-5"></i>
                  <span className="text-gray-700">Unlimited uploads</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-brain text-purple-500 w-5"></i>
                  <span className="text-gray-700">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-pie text-purple-500 w-5"></i>
                  <span className="text-gray-700">Budget planning & alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-file-export text-purple-500 w-5"></i>
                  <span className="text-gray-700">PDF/Excel exports</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-headset text-purple-500 w-5"></i>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-star text-orange-500 w-5"></i>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-users text-orange-500 w-5"></i>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-shield-alt text-orange-500 w-5"></i>
                  <span className="text-gray-700">24/7 Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-cogs text-orange-500 w-5"></i>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-database text-orange-500 w-5"></i>
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
              </>
            )}
          </ul>

          <button
            onClick={() => {
              if (userPlan === 'Basic') {
                handleRazorpayPayment();
              } else {
                alert('📧 Contact our sales team at sales@fintrackai.com for Enterprise plan!');
              }
            }}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl
              ${isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Preparing Payment...
              </span>
            ) : userPlan === 'Basic' ? 'Upgrade to Pro' : 'Contact Sales'}
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          🔒 Secure payments powered by Razorpay • Test Mode Active
        </p>
        <p className="text-gray-400 text-xs mt-1">No real charges in test mode • Cancel anytime</p>
      </div>
    </div>
  );
};

export default DashboardPricing;