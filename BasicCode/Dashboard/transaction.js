document.addEventListener("DOMContentLoaded", function() {
  const staticTransactions = [
    {
      desc: "Grocery Shopping",
      date: "2024-06-01",
      category: "Food & Dining",
      amount: "1200"
    },
    {
      desc: "Uber Ride",
      date: "2024-06-02",
      category: "Transportation",
      amount: "350"
    },
    {
      desc: "Salary",
      date: "2024-06-03",
      category: "Income",
      amount: "50000"
    },
    {
      desc: "Electricity Bill",
      date: "2024-06-04",
      category: "Utilities",
      amount: "1800"
    },
    {
      desc: "Movie Night",
      date: "2024-06-05",
      category: "Entertainment",
      amount: "600"
    },
    {
      desc: "Rent Payment",
      date: "2024-06-06",
      category: "Housing",
      amount: "15000"
    },
    {
      desc: "Online Shopping",
      date: "2024-06-07",
      category: "Shopping",
      amount: "2500"
    },
    {
      desc: "Coffee",
      date: "2024-06-08",
      category: "Food & Dining",
      amount: "150"
    },
    {
      desc: "Metro Card Recharge",
      date: "2024-06-09",
      category: "Transportation",
      amount: "500"
    },
    {
      desc: "Freelance Project",
      date: "2024-06-10",
      category: "Income",
      amount: "12000"
    },
    {
      desc: "Water Bill",
      date: "2024-06-11",
      category: "Utilities",
      amount: "400"
    },
    {
      desc: "Concert Ticket",
      date: "2024-06-12",
      category: "Entertainment",
      amount: "2000"
    },
    {
      desc: "Furniture Purchase",
      date: "2024-06-13",
      category: "Housing",
      amount: "7000"
    },
    {
      desc: "Clothing",
      date: "2024-06-14",
      category: "Shopping",
      amount: "3200"
    },
    {
      desc: "Dinner Out",
      date: "2024-06-15",
      category: "Food & Dining",
      amount: "900"
    }
  ];

  staticTransactions.forEach(tx => {
    const categoryColors = {
      "Food & Dining": "bg-green-100 text-green-800",
      "Transportation": "bg-blue-100 text-blue-800",
      "Income": "bg-green-100 text-green-800",
      "Entertainment": "bg-purple-100 text-purple-800",
      "Utilities": "bg-yellow-100 text-yellow-800",
      "Housing": "bg-pink-100 text-pink-800",
      "Shopping": "bg-blue-100 text-blue-800"
    };

    const colorClass = categoryColors[tx.category] || "bg-gray-100 text-gray-800";
    const indicatorClass =
      colorClass.includes("green") ? "bg-green-500" :
      colorClass.includes("blue") ? "bg-blue-500" :
      colorClass.includes("purple") ? "bg-purple-500" :
      colorClass.includes("yellow") ? "bg-yellow-500" :
      colorClass.includes("pink") ? "bg-pink-500" :
      "bg-gray-500";

    const row = `
      <tr class="border-b">
        <td class="px-4 py-2 text-sm">${tx.date}</td>
        <td class="px-4 py-2 text-sm flex items-center">
          <span class="w-2 h-2 ${indicatorClass} rounded-full mr-2"></span>${tx.desc}
        </td>
        <td class="px-4 py-2 text-sm">
          <span class="px-2 py-1 ${colorClass} rounded">${tx.category}</span>
        </td>
        <td class="px-4 py-2 text-sm text-red-500">₹${tx.amount}</td>
      </tr>`;
    document.getElementById("transactionBody").insertAdjacentHTML("beforeend", row);
  });
});
