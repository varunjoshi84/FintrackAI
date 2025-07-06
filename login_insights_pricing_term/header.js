document.getElementById('header').innerHTML = `
<div>
  <!-- Navigation -->
  <nav class=" shadow-sm border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-white text-sm"></i>
            
          </div>
          <span class="text-xl font-bold text-slate-900">FinTrackAI</span>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#pricing" class="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#about" class="text-slate-600 hover:text-blue-600 transition-colors">About</a>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">Get Started</button>
        </div>

        <!-- Mobile Hamburger -->
        <button id="hamburger" class="md:hidden text-slate-700 hover:text-blue-600 text-xl">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden px-4 pb-4">
      <a href="#features" class="block py-2 text-slate-600 hover:text-blue-600">Features</a>
      <a href="#pricing" class="block py-2 text-slate-600 hover:text-blue-600">Pricing</a>
      <a href="#about" class="block py-2 text-slate-600 hover:text-blue-600">About</a>
      <button class="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">Get Started</button>
    </div>
  </nav>
</div>
`;

// Toggle mobile menu
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});
