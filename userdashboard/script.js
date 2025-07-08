let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    dob: null,
    location: "New York, USA",
    verified: false,
    image: null
  }
];
let currentUserId = 1;

function toggleModal(show) {
  const modal = document.getElementById('editProfileModal');
  modal.classList.toggle('hidden', !show);
  if (show) {
    const user = users.find(u => u.id === currentUserId);
    if (user) {
      document.getElementById('modalEditName').value = user.name || '';
      document.getElementById('modalEditEmail').value = user.email || '';
      document.getElementById('modalEditPhone').value = user.phone || '';
      document.getElementById('modalEditDOB').value = user.dob ? user.dob.split('T')[0] : '';
      document.getElementById('modalEditLocation').value = user.location || '';
      document.getElementById('modalImageUpload').value = '';
    } else {
      document.getElementById('modalEditName').value = '';
      document.getElementById('modalEditEmail').value = '';
      document.getElementById('modalEditPhone').value = '';
      document.getElementById('modalEditDOB').value = '';
      document.getElementById('modalEditLocation').value = '';
      document.getElementById('modalImageUpload').value = '';
    }
  }
}

function editProfile() {
  currentUserId = 1;
  toggleModal(true);
}

function saveProfile() {
  const name = document.getElementById('modalEditName').value;
  const email = document.getElementById('modalEditEmail').value;
  const phone = document.getElementById('modalEditPhone').value;
  const dob = document.getElementById('modalEditDOB').value;
  const location = document.getElementById('modalEditLocation').value;
  const imageInput = document.getElementById('modalImageUpload');
  const imageFile = imageInput.files[0];

  if (name && email && phone && location) {
    const userIndex = users.findIndex(u => u.id === currentUserId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        name,
        email,
        phone,
        dob: dob || users[userIndex].dob,
        location,
        image: imageFile ? URL.createObjectURL(imageFile) : users[userIndex].image
      };
    }
    updateDisplay();
    toggleModal(false);
    alert('Profile updated successfully!');
  } else {
    alert('Please fill all required fields.');
  }
}

function createNewProfile() {
  const name = document.getElementById('modalEditName').value;
  const email = document.getElementById('modalEditEmail').value;
  const phone = document.getElementById('modalEditPhone').value;
  const dob = document.getElementById('modalEditDOB').value;
  const location = document.getElementById('modalEditLocation').value;
  const imageInput = document.getElementById('modalImageUpload');
  const imageFile = imageInput.files[0];

  if (name && email && phone && location) {
    const newUser = {
      id: users.length + 1,
      name,
      email,
      phone,
      dob: dob || null,
      location,
      verified: false,
      image: imageFile ? URL.createObjectURL(imageFile) : null
    };
    users.push(newUser);
    currentUserId = newUser.id;
    updateDisplay();
    toggleModal(false);
    alert('New profile created successfully!');
  } else {
    alert('Please fill all required fields.');
  }
}

function deleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    users = users.filter(u => u.id !== currentUserId);
    if (users.length > 0) {
      currentUserId = users[0].id;
    } else {
      currentUserId = null;
    }
    updateDisplay();
    alert('Account deleted successfully!');
  }
}

function verifyAccount() {
  const user = users.find(u => u.id === currentUserId);
  if (user && !user.verified) {
    user.verified = true;
    updateDisplay();
    alert('Account verified successfully!');
  } else if (user.verified) {
    alert('Account is already verified.');
  } else {
    alert('No user to verify.');
  }
}

function updateProfile() {
  const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  const dob = document.getElementById('editDOB').value;
  const location = document.getElementById('editLocation').value;
  const imageInput = document.getElementById('imageUpload');
  const imageFile = imageInput.files[0];

  if (email && phone && location) {
    const userIndex = users.findIndex(u => u.id === currentUserId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        email,
        phone,
        dob: dob || users[userIndex].dob,
        location,
        image: imageFile ? URL.createObjectURL(imageFile) : users[userIndex].image
      };
    }
    updateDisplay();
    alert('Profile updated successfully!');
  } else {
    alert('Please fill all required fields.');
  }
}

function updateDisplay() {
  const user = users.find(u => u.id === currentUserId);
  if (user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userNameDisplay').textContent = user.name;
    document.getElementById('userEmail').textContent = `Email: ${user.email}`;
    document.getElementById('userDOB').textContent = `DOB: ${user.dob ? new Date(user.dob).toLocaleDateString() : 'Not Set'}`;
    document.getElementById('userPhone').textContent = `Phone: ${user.phone}`;
    document.getElementById('userLocation').textContent = `Location: ${user.location}`;
    document.getElementById('userVerified').innerHTML = `Verified: ${user.verified ? '<span class="text-green-600">Yes</span>' : '<span class="text-red-600">No</span>'}`;
    const imageElement = document.getElementById('profileImage');
    if (user.image) {
      imageElement.style.backgroundImage = `url(${user.image})`;
      imageElement.style.backgroundSize = 'cover';
      imageElement.innerHTML = '';
    } else {
      imageElement.style.backgroundImage = '';
      imageElement.innerHTML = '<i class="fas fa-user text-gray-400 text-5xl"></i>';
    }
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editDOB').value = user.dob ? user.dob.split('T')[0] : '';
    document.getElementById('editLocation').value = user.location;
  } else {
    document.getElementById('userName').textContent = 'No User';
    document.getElementById('userNameDisplay').textContent = 'No User';
    document.getElementById('userEmail').textContent = 'Email: ';
    document.getElementById('userDOB').textContent = 'DOB: Not Set';
    document.getElementById('userPhone').textContent = 'Phone: ';
    document.getElementById('userLocation').textContent = 'Location: ';
    document.getElementById('userVerified').innerHTML = 'Verified: <span class="text-red-600">No</span>';
    document.getElementById('editEmail').value = '';
    document.getElementById('editPhone').value = '';
    document.getElementById('editDOB').value = '';
    document.getElementById('editLocation').value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  const elements = document.querySelectorAll('[data-animation]');
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.remove('opacity-0');
      element.classList.add(element.dataset.animation);
    }, index * 200);
  });
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(',', '');
  document.querySelector('#activityBody tr:first-child td:first-child').textContent = currentDate;
});