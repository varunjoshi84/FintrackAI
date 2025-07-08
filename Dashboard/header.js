document.getElementById("header").innerHTML = `
<header class="w-full bg-white border-b border-gray-200 shadow-sm">
    <div class="flex items-center justify-between px-4 py-3 md:py-4">
        <!-- Logo -->
       <a href="../landingpage/index.html">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-white text-sm"></i>
          </div>
          <span class="text-xl font-bold text-slate-900">FinTrackAI</span>
        </div>
        </a>
        <!-- Desktop Nav -->
        <nav class="hidden md:flex space-x-4 ml-8">
            <a href="../dasboard.html" class="hover:text-blue-400 px-3 py-2 rounded-lg text-gray-700">Dashboard</a>
            <a href="../Dashboard/transaction.html" class="hover:text-blue-400 px-3 py-2 rounded-lg text-gray-700">Transactions</a>
            <a href="../upload.html" class="hover:text-blue-400 px-3 py-2 rounded-lg text-gray-700">Upload</a>
            <a href="../login_insights_pricing_term/insights.html" class="hover:text-blue-400 px-3 py-2 rounded-lg text-gray-700">AI Insights</a>
            <a href="../Dashboard/reports.html" class="hover:text-blue-400 px-3 py-2 rounded-lg text-gray-700">Reports</a>
            
        </nav>
        <!-- Hamburger (mobile) -->
        <button id="hamburger" class="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none">
            <i class="fa-solid fa-bars text-2xl text-gray-700"></i>
        </button>
        <!-- User Dropdown (desktop) -->
        <div class="hidden md:flex items-center">
            <button id="dropdownButton" class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full focus:outline-none shadow-lg transition-transform duration-200 hover:scale-105">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="white" stroke-width="2" fill="none"/>
                    <path stroke="white" stroke-width="2" d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4"/>
                </svg>
            </button>
            <div id="dropdownMenu" class="absolute right-4 top-16 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl opacity-0 scale-95 pointer-events-none transition-all duration-300 z-50 flex flex-col items-center py-4">
                <a href="#" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">John Doe</a>
                <a href="#" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">name@fintrackai.com</a>
                <a href="../userdashboard/index.html" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">My profile</a>
                <a href="../landingpage/index.html" class="block px-4 py-2 text-red-400 hover:bg-gray-700 rounded-full w-48 text-center">Sign out</a>
            </div>
        </div>
    </div>
    <!-- Mobile Nav & User -->
    <div id="mobileNav" class="md:hidden hidden flex-col items-center w-full px-2 pb-4 animate-fade-in-down">
        <nav class="flex flex-col space-y-2 w-full mt-2">
            <a href="../dasboard.html" class="hover:text-blue-400 block px-4 py-2 rounded-lg text-gray-700">Dashboard</a>
            <a href="../Dashboard/transaction.html" class="hover:text-blue-400 block px-4 py-2 rounded-lg text-gray-700">Transactions</a>
            <a href="../upload.html" class="hover:text-blue-400 block px-4 py-2 rounded-lg text-gray-700">Upload</a>
            <a href="../login_insights_pricing_term/insights.html" class="hover:text-blue-400 block px-4 py-2 rounded-lg text-gray-700">AI Insights</a>
            <a href="../Dashboard/reports.html" class="hover:text-blue-400 block px-4 py-2 rounded-lg text-gray-700">Reports</a>
        </nav>
        <div class="flex justify-center mt-4">
            <button id="dropdownButtonMobile" class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full focus:outline-none shadow-lg transition-transform duration-200 hover:scale-105">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="white" stroke-width="2" fill="none"/>
                    <path stroke="white" stroke-width="2" d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4"/>
                </svg>
            </button>
        </div>
        <div id="dropdownMenuMobile" class="w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl opacity-0 scale-95 pointer-events-none transition-all duration-300 z-50 flex flex-col items-center py-4 mt-2">
            <a href="#" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">John Doe</a>
            <a href="#" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">name@fintrackai.com</a>
            <a href="../userdashboard/index.html" class="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-full w-48 text-center">My profile</a>
            <a href="../landingpage/index.html" class="block px-4 py-2 text-red-400 hover:bg-gray-700 rounded-full w-48 text-center">Sign out</a>
        </div>
    </div>
</header>
<style>
@keyframes fade-in-down {
    0% { opacity: 0; transform: translateY(-10px);}
    100% { opacity: 1; transform: translateY(0);}
}
.animate-fade-in-down { animation: fade-in-down 0.3s ease; }
</style>
`;

// JS for hamburger and dropdowns
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const mobileNav = document.getElementById("mobileNav");
    const dropdownButton = document.getElementById("dropdownButton");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const dropdownButtonMobile = document.getElementById("dropdownButtonMobile");
    const dropdownMenuMobile = document.getElementById("dropdownMenuMobile");

    // Add active state to navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes('transaction.html') && linkPath.includes('transaction.html')) {
            link.classList.add('text-blue-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else if (currentPath.includes('dasboard.html') && linkPath.includes('dasboard.html')) {
            link.classList.add('text-blue-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else if (currentPath.includes('upload.html') && linkPath.includes('upload.html')) {
            link.classList.add('text-blue-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else if (currentPath.includes('insights.html') && linkPath.includes('insights.html')) {
            link.classList.add('text-blue-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else if (currentPath.includes('reports.html') && linkPath.includes('reports.html')) {
            link.classList.add('text-blue-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        } else if (currentPath.includes('userdashboard') && linkPath.includes('userdashboard')) {
            // For user profile page (My profile link)
            const profileLinks = document.querySelectorAll('a[href*="userdashboard"]');
            profileLinks.forEach(profileLink => {
                profileLink.classList.add('text-blue-400', 'font-semibold');
                profileLink.classList.remove('text-gray-300');
            });
        }
    });

    // Hamburger toggle
    hamburger.addEventListener("click", function (e) {
        e.stopPropagation();
        mobileNav.classList.toggle("hidden");
    });

    // Desktop dropdown
    dropdownButton.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = dropdownMenu.classList.contains("opacity-100");
        dropdownMenu.classList.toggle("opacity-0", open);
        dropdownMenu.classList.toggle("scale-95", open);
        dropdownMenu.classList.toggle("pointer-events-none", open);
        dropdownMenu.classList.toggle("opacity-100", !open);
        dropdownMenu.classList.toggle("scale-100", !open);
        dropdownMenu.classList.toggle("pointer-events-auto", !open);
    });

    // Mobile dropdown
    dropdownButtonMobile.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = dropdownMenuMobile.classList.contains("opacity-100");
        dropdownMenuMobile.classList.toggle("opacity-0", open);
        dropdownMenuMobile.classList.toggle("scale-95", open);
        dropdownMenuMobile.classList.toggle("pointer-events-none", open);
        dropdownMenuMobile.classList.toggle("opacity-100", !open);
        dropdownMenuMobile.classList.toggle("scale-100", !open);
        dropdownMenuMobile.classList.toggle("pointer-events-auto", !open);
    });

    // Close dropdowns on outside click
    document.addEventListener("click", function (event) {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("opacity-0", "scale-95", "pointer-events-none");
            dropdownMenu.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
        }
        if (!dropdownButtonMobile.contains(event.target) && !dropdownMenuMobile.contains(event.target)) {
            dropdownMenuMobile.classList.add("opacity-0", "scale-95", "pointer-events-none");
            dropdownMenuMobile.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
        }
    });
});
