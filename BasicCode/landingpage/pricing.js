document.getElementById('pricing').innerHTML = `
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Heading -->
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto">Start free and upgrade as your financial needs grow</p>
    </div>

    <!-- Pricing Cards -->
    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

      <!-- Free Plan -->
      <div class="border border-slate-200 rounded-lg p-8 text-center shadow hover:shadow-lg transition">
        <h3 class="text-xl font-semibold text-slate-900 mb-2">Free</h3>
        <p class="text-3xl font-bold text-blue-600 mb-1">₹0</p>
        <p class="text-sm text-slate-500 mb-6">Forever free</p>
        <ul class="text-slate-600 text-left mb-6 space-y-2">
          <li>• Upload up to 5 statements/month</li>
          <li>• Basic AI categorization</li>
          <li>• Simple dashboard</li>
          <li>• 7-day data retention</li>
        </ul>
        <button class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
          Get Started
        </button>
      </div>

      <!-- Premium Plan -->
      <div class="border border-blue-600 bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 rounded-lg p-8 text-center shadow-xl transform scale-105">
        <h3 class="text-xl font-semibold text-white mb-2">Premium</h3>
        <p class="text-3xl font-bold text-white mb-1">₹149</p>
        <p class="text-sm text-white mb-6">per month</p>
        <ul class="text-white text-left mb-6 space-y-2">
          <li>• Unlimited statement uploads</li>
          <li>• Advanced AI insights</li>
          <li>• Budget planning & alerts</li>
          <li>• PDF/Excel exports</li>
          <li>• Priority support</li>
        </ul>
        <button class="w-full bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium">
          Start Premium
        </button>
      </div>

      <!-- Business Plan -->
      <div class="bg-slate-900 text-white rounded-lg p-8 text-center shadow hover:shadow-lg transition">
        <h3 class="text-xl font-semibold mb-2">Business</h3>
        <p class="text-3xl font-bold mb-1">₹999</p>
        <p class="text-sm text-slate-300 mb-6">per month</p>
        <ul class="text-slate-300 text-left mb-6 space-y-2">
          <li>• Everything in Premium</li>
          <li>• GST expense tracking</li>
          <li>• P&L statements</li>
          <li>• Invoice management</li>
          <li>• Team collaboration</li>
        </ul>
        <button class="w-full bg-white text-slate-900 px-4 py-2 rounded hover:bg-slate-200 text-sm font-medium">
          Contact Sales
        </button>
      </div>

    </div>
  </div>
</section>
`;
