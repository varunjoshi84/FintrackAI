document.addEventListener("DOMContentLoaded", () => {
  const users = [
    { name: "Kamal Swarnkar", email: "kamal@example.com", role: "Admin" },
    { name: "Ankit Sharma", email: "ankit@example.com", role: "Editor" },
    { name: "Sneha Patel", email: "sneha@example.com", role: "User" },
  ];

  const logs = [
    "User Kamal uploaded SBI.pdf at 3:32 PM",
    "Sneha submitted a feedback form",
    "Ankit updated pricing.html",
  ];

  const userTable = document.getElementById("userTableBody");
  const logsList = document.getElementById("logsList");

  users.forEach(user => {
    const row = `
      <tr>
        <td class="px-4 py-2">${user.name}</td>
        <td class="px-4 py-2">${user.email}</td>
        <td class="px-4 py-2">${user.role}</td>
        <td class="px-4 py-2">
          <button class="text-red-600 hover:underline text-sm">Remove</button>
        </td>
      </tr>`;
    userTable.insertAdjacentHTML("beforeend", row);
  });

  logs.forEach(log => {
    logsList.insertAdjacentHTML("beforeend", `<li>🔹 ${log}</li>`);
  });
});
