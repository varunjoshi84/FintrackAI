document.getElementById('hero').innerHTML = `
<section class="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      
      <!-- Left Text Content -->
      <div class="animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Master Your Finances with <span class="text-yellow-300">AI Intelligence</span>
        </h1>
        <p class="text-xl text-blue-100 mb-8 leading-relaxed">
          Upload your bank statements and let our AI categorize expenses, analyze spending patterns, and provide personalized savings recommendations.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          
        <a href="../login_insights_pricing_term/login.html">
          <button class="bg-white text-blue-700 hover:bg-slate-100 text-lg font-medium px-6 py-3 rounded-lg">
            Get Started Free
          </button>
        </a>
        <button class="border border-white text-white hover:bg-white hover:text-blue-700 text-lg font-medium px-6 py-3 rounded-lg flex items-center justify-center">
            <i class="fas fa-play mr-2 text-sm"></i>
            Watch Demo
          </button>
        </div>
      </div>

      <!-- Right Chart Card -->
      <div class="relative animate-slide-up">
        <div class="bg-white text-slate-900 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Monthly Overview</h3>
              <span class="text-green-600 text-sm font-medium">+12.5%</span>
            </div>
            <div class="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-end justify-center p-4">
              <div class="flex space-x-2 items-end">
                <div class="w-4 h-16 bg-blue-600 rounded-t"></div>
                <div class="w-4 h-20 bg-green-500 rounded-t"></div>
                <div class="w-4 h-12 bg-purple-500 rounded-t"></div>
                <div class="w-4 h-24 bg-yellow-400 rounded-t"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
`;
