document.getElementById('header').innerHTML = `
<div>
  <nav class="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-white text-sm"></i>
          </div>
          <span class="text-xl font-bold text-slate-900">FinTrackAI</span>
        </div>
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#pricing" class="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#about" class="text-slate-600 hover:text-blue-600 transition-colors">About</a>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">Get Started</button>
        </div>
        <button id="hamburger" class="md:hidden text-slate-700 hover:text-blue-600 text-xl">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden px-4 pb-4">
      <a href="#features" class="block py-2 text-slate-600 hover:text-blue-600">Features</a>
      <a href="#pricing" class="block py-2 text-slate-600 hover:text-blue-600">Pricing</a>
      <a href="#about" class="block py-2 text-slate-600 hover:text-blue-600">About</a>
      <button class="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">Get Started</button>
    </div>
  </nav>
</div>
`;

document.getElementById('footer').innerHTML = `
<footer class="bg-slate-900 text-white py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-4 gap-8"> 
      <div>
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-white text-sm"></i>
          </div>
          <span class="text-xl font-bold">FinTrackAI</span>
        </div>
        <p class="text-slate-400 mb-6">Empowering financial decisions with AI-powered insights and smart categorization.</p>
        <div class="flex space-x-4">
          <a href="#" class="text-slate-400 hover:text-white transition-colors"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors"><i class="fab fa-linkedin"></i></a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors"><i class="fab fa-github"></i></a>
        </div>
      </div>
      <div>
        <h4 class="font-semibold mb-6">Product</h4>
        <ul class="space-y-3 text-slate-400">
          <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
          <li><a href="#pricing" class="hover:text-white transition-colors">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-6">Support</h4>
        <ul class="space-y-3 text-slate-400">
          <li><a href="help.html" class="hover:text-white transition-colors">Help Center</a></li>
          <li><a href="privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="contact.html" class="hover:text-white transition-colors">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-6">Stay Updated</h4>
        <p class="text-slate-400 mb-4">Get the latest updates on new features and financial insights.</p>
        <div class="flex">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <button class="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p class="text-slate-400 text-sm text-center">© 2025 FinTrackAI. All rights reserved.</p>
    </div>
  </div>
</footer>
`;

// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});