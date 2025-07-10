
const features = [
  {
    title: "Smart Categorization",
    description: "Automatically classify your spending using AI for better budgeting.",
    icon: "fas fa-tags", // Font Awesome icon
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Expense Insights",
    description: "Get monthly insights and patterns on where your money goes.",
    icon: "fas fa-chart-pie",
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Secure Syncing",
    description: "Sync your bank accounts securely with end-to-end encryption.",
    icon: "fas fa-shield-alt",
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Custom Alerts",
    description: "Set limits and receive alerts for overspending.",
    icon: "fas fa-bell",
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    title: "Multi-account Support",
    description: "Track all your accounts in one place with real-time updates.",
    icon: "fas fa-university",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    title: "Downloadable Reports",
    description: "Export insights and summaries to Excel or PDF format.",
    icon: "fas fa-file-download",
    color: "bg-red-100 text-red-600"
  }
];

// Inject HTML into the DOM
document.getElementById('features').innerHTML = `
  <section id="features" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Powerful Features for Complete Financial Control
        </h2>
        <p class="text-xl text-slate-600 max-w-3xl mx-auto">
          From AI-powered categorization to detailed insights, everything you need to take control of your finances.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${features.map(feature => `
          <div class="bg-white rounded-lg p-8 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${feature.color}">
              <i class="${feature.icon} text-lg"></i>
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-4">${feature.title}</h3>
            <p class="text-slate-600">${feature.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;
