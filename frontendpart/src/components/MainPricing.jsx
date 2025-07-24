import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = () => {
    const amount = isMonthly ? 199 : 300;
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Demo key
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Fintack AI',
      description: `Pro Plan - ${isMonthly ? 'Monthly' : 'Yearly'}`,
      image: '/logo.png',
      handler: function (response) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        // Here you would typically send the payment details to your backend
      },
      prefill: {
        name: 'Demo User',
        email: 'demo@example.com',
        contact: '9999999999'
      },
      notes: {
        plan: 'Pro',
        billing: isMonthly ? 'monthly' : 'yearly'
      },
      theme: {
        color: '#8B5CF6'
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay SDK not loaded. Please try again.');
    }
  };

  const pricingData = {
    monthly: {
      basic: '₹0 per month',
      pro: '₹199 per month',
      enterprise: 'Custom (Billed monthly)',
    },
    yearly: {
      basic: '₹0 per year',
      pro: '₹300 per year',
      enterprise: 'Custom (Billed annually)',
    },
  };

  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pricing</h1>
        <p className="text-gray-500 text-lg mb-8">
          Do more impactful work with a privacy first calendar that plugs<br />into all your apps at work.
        </p>

        {/* Toggle Buttons */}
        <div className="inline-flex bg-gray-200 rounded-full p-1 mb-12">
          <button
            id="monthlyBtn"
            className={`px-6 py-2 text-sm font-medium focus:outline-none transition-all duration-200 rounded-full ${
              isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button
            id="yearlyBtn"
            className={`px-6 py-2 text-sm font-medium focus:outline-none transition-all duration-200 rounded-full ${
              !isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setIsMonthly(false)}
          >
            Yearly
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Basic Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-green-500 to-blue-400 p-2 rounded-full">
                  <i className="fas fa-tasks text-white"></i>
                </div>
                <h3 className="text-lg font-semibold">Basic Plan</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Perfect for individuals or small teams looking to stay organized with basic features.</p>
              <p
                id="basicPrice"
                className="text-3xl font-bold mb-1"
                dangerouslySetInnerHTML={{ __html: pricingData[isMonthly ? 'monthly' : 'yearly'].basic.replace('per', '<span class="text-base font-normal text-gray-500">per</span>') }}
              />
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-upload"></i></span> Upload up to 5 statements/month</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-robot"></i></span> Basic AI categorization</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-tachometer-alt"></i></span> Simple dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-clock"></i></span> 7-day data retention</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-400 text-white font-medium py-2 rounded-md hover:opacity-90 transition"
            >
              Start for free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-500 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-400 p-2 rounded-full">
                  <i className="fas fa-rocket text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
                <span className="ml-auto text-xs text-purple-600 bg-purple-100 rounded-full px-2 py-0.5 font-medium">Most Popular</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ideal for growing teams needing more robust tools and integrations.</p>
              <p
                id="proPrice"
                className="text-3xl font-bold mb-1"
                dangerouslySetInnerHTML={{ __html: pricingData[isMonthly ? 'monthly' : 'yearly'].pro.replace('per', '<span class="text-base font-normal text-gray-500">per</span>') }}
              />
              <p className="text-sm text-gray-500 mb-4" id="proBilling">
                {isMonthly ? 'Billed monthly' : 'Billed annually'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-infinity"></i></span> Unlimited statement uploads</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-brain"></i></span> Advanced AI insights</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-chart-pie"></i></span> Budget planning & alerts</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-file-export"></i></span> PDF/Excel exports</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-headset"></i></span> Priority support</li>
              </ul>
            </div>
            <button 
              onClick={handleRazorpayPayment}
              className="mt-6 w-full text-white font-medium py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-400 hover:opacity-90 transition"
            >
              Get Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-pink-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-pink-500 to-indigo-500 p-2 rounded-full">
                  <i className="fas fa-cogs text-white"></i>
                </div>
                <h3 className="text-lg font-semibold">Enterprise</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Designed for businesses requiring comprehensive, scalable management tools.</p>
              <p
                id="enterprisePrice"
                className="text-2xl font-bold mb-1"
                dangerouslySetInnerHTML={{ __html: pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise.replace('per', '<span class="text-base font-normal text-gray-500">per</span>') }}
              />
              <p className="text-sm text-gray-500 mb-4" id="enterpriseBilling">
                {isMonthly ? 'Billed monthly' : 'Billed annually'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-star"></i></span> Everything in Premium</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-receipt"></i></span> GST expense tracking</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-chart-bar"></i></span> P&L statements</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-file-invoice"></i></span> Invoice management</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-users"></i></span> Team collaboration</li>
              </ul>
            </div>
            <button 
              onClick={() => alert('This option will be coming soon. Thank you!')}
              className="mt-6 w-full bg-gradient-to-br from-pink-500 to-indigo-500 text-white font-medium py-2 rounded-md hover:opacity-90 transition"
            >
              Get Enterprise
            </button>
          </div>
        </div>

        {/* Features Section */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
              {/* Feature 1 */}
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-blue-400 p-3 rounded-full">
                    <i className="fas fa-phone-alt text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Nulla vitae elit libero, a pharetra augue. Donec id elit non mi porta gravida at eget. Fusce dapibus
                  tellus.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>

              {/* Feature 2 */}
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-400 p-3 rounded-full">
                    <i className="fas fa-briefcase text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">Daily Updates</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet. Sed posuere consectetur.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>

              {/* Feature 3 */}
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-pink-500 to-indigo-500 p-3 rounded-full">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">Market Research</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna scelerisque.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Pricing FAQ</h2>
            <p className="text-gray-500 text-sm mb-10">
              If you don’t see an answer to your question, you can send us an{' '}
              <a href="#" className="text-blue-600 hover:underline">
                email
              </a>{' '}
              from our contact form.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {/* Accordion Item 1 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Can I cancel my subscription?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes, you can cancel anytime through your dashboard settings.</p>
                </details>
              </div>
              {/* Accordion Item 2 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How do I get my subscription receipt?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Receipts are emailed monthly and available in your billing section.</p>
                </details>
              </div>
              {/* Accordion Item 3 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Which payment methods do you accept?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">We accept credit cards, PayPal, and more.</p>
                </details>
              </div>
              {/* Accordion Item 4 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Are there any discounts for people in need?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes! We offer educational and nonprofit discounts.</p>
                </details>
              </div>
              {/* Accordion Item 5 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How can I manage my Account?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">You can manage your account settings via the dashboard.</p>
                </details>
              </div>
              {/* Accordion Item 6 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Do you offer a free trial edit?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes, a 7-day free trial is available on the Pro plan.</p>
                </details>
              </div>
              {/* Accordion Item 7 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Is my credit card information secure?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">We use Stripe and follow strict PCI compliance.</p>
                </details>
              </div>
              {/* Accordion Item 8 */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How do I reset my Account password?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Click on "Forgot Password?" at login to reset securely.</p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default MainPricing;