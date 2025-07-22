// Simple contact API stub to fix Vite import error
export async function sendContactMessage(data) {
  const response = await fetch('http://localhost:8000/api/contact/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getContactMessages(token) {
  const response = await fetch('http://localhost:8000/api/admin/contacts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function getContactStats(token) {
  const response = await fetch('http://localhost:8000/api/admin/contacts/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function updateContactMessage(id, data, token) {
  const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function sendEmailResponse(id, data, token) {
  const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function deleteContactMessage(id, token) {
  const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// Stub for sendContactResponse to resolve frontend import error
export async function sendContactResponse(data, token) {
  // If you have a backend endpoint for contact response, update the URL and method below
  // Example POST endpoint (replace with actual if available):
  const response = await fetch('http://localhost:8000/api/admin/contacts/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return response.json();
}
