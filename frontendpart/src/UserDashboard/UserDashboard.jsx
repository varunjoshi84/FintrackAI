import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Dashboard/Header';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      dob: null,
      location: "New York, USA",
      verified: false,
      image: null,
    },
  ]);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(users[0]);
  const [modalData, setModalData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
  });

  const updateDisplay = useCallback(() => {
    const user = users.find((u) => u.id === currentUserId);
    if (user) {
      setUserData(user);
    } else {
      setUserData({
        name: 'No User',
        email: '',
        phone: '',
        dob: null,
        location: '',
        verified: false,
        image: null,
      });
    }
  }, [users, currentUserId]);

  useEffect(() => {
    updateDisplay();
    
    // Animation setup
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.remove('opacity-0');
        element.classList.add(element.dataset.animation);
      }, index * 200);
    });
  }, [updateDisplay]);

  const toggleModal = (show) => {
    setModalOpen(show);
    if (show) {
      const user = users.find((u) => u.id === currentUserId);
      if (user) {
        setModalData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob ? user.dob.split('T')[0] : '',
          location: user.location || '',
        });
      } else {
        setModalData({
          name: '',
          email: '',
          phone: '',
          dob: '',
          location: '',
        });
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const userIndex = users.findIndex((u) => u.id === currentUserId);
      if (userIndex !== -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], image: imageUrl };
        setUsers(updatedUsers);
        updateDisplay();
      }
    }
  };

  const saveProfile = () => {
    const { name, email, phone, dob, location } = modalData;
    const imageInput = document.getElementById('modalImageUpload');
    const imageFile = imageInput?.files[0];

    if (name && email && phone && location) {
      const userIndex = users.findIndex((u) => u.id === currentUserId);
      if (userIndex !== -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          name,
          email,
          phone,
          dob: dob || updatedUsers[userIndex].dob,
          location,
          image: imageFile ? URL.createObjectURL(imageFile) : updatedUsers[userIndex].image,
        };
        setUsers(updatedUsers);
      }
      updateDisplay();
      toggleModal(false);
      alert('Profile updated successfully!');
    } else {
      alert('Please fill all required fields.');
    }
  };

  const createNewProfile = () => {
    const { name, email, phone, dob, location } = modalData;
    const imageInput = document.getElementById('modalImageUpload');
    const imageFile = imageInput?.files[0];

    if (name && email && phone && location) {
      const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        dob: dob || null,
        location,
        verified: false,
        image: imageFile ? URL.createObjectURL(imageFile) : null,
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUserId(newUser.id);
      updateDisplay();
      toggleModal(false);
      alert('New profile created successfully!');
    } else {
      alert('Please fill all required fields.');
    }
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const updatedUsers = users.filter((u) => u.id !== currentUserId);
      setUsers(updatedUsers);
      if (updatedUsers.length > 0) {
        setCurrentUserId(updatedUsers[0].id);
      } else {
        setCurrentUserId(null);
      }
      updateDisplay();
      alert('Account deleted successfully!');
    }
  };

  const verifyAccount = () => {
    const user = users.find((u) => u.id === currentUserId);
    if (user && !user.verified) {
      const userIndex = users.findIndex((u) => u.id === currentUserId);
      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], verified: true };
      setUsers(updatedUsers);
      updateDisplay();
      alert('Account verified successfully!');
    } else if (user?.verified) {
      alert('Account is already verified.');
    } else {
      alert('No user to verify.');
    }
  };

  const updateProfile = () => {
    const email = document.getElementById('editEmail')?.value;
    const phone = document.getElementById('editPhone')?.value;
    const dob = document.getElementById('editDOB')?.value;
    const location = document.getElementById('editLocation')?.value;
    const imageInput = document.getElementById('imageUpload');
    const imageFile = imageInput?.files[0];

    if (email && phone && location) {
      const userIndex = users.findIndex((u) => u.id === currentUserId);
      if (userIndex !== -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          email,
          phone,
          dob: dob || updatedUsers[userIndex].dob,
          location,
          image: imageFile ? URL.createObjectURL(imageFile) : updatedUsers[userIndex].image,
        };
        setUsers(updatedUsers);
      }
      updateDisplay();
      alert('Profile updated successfully!');
    } else {
      alert('Please fill all required fields.');
    }
  };

  return (
    <div className="min-h-screen font-inter">
      <Header />
      
      {/* Main User Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="min-h-screen rounded-lg p-6">
          {/* Welcome Header */}
          <div className="text-center mb-12 opacity-0 fade-in" data-animation="fade-in">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
              Welcome, <span id="userName" className="text-indigo-600">{userData.name}</span>!
            </h1>
            <p className="text-lg text-gray-600">Manage your personal details with ease.</p>
          </div>

          {/* User Details Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 transform translate-y-10 slide-up" data-animation="slide-up">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="relative w-32 h-32 mb-6 md:mb-0 md:mr-8">
                <div
                  id="profileImage"
                  className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-indigo-200 hover:bounce transition-all duration-300"
                  style={{
                    backgroundImage: userData.image ? `url(${userData.image})` : 'none',
                    backgroundSize: userData.image ? 'cover' : 'auto',
                  }}
                >
                  {!userData.image && <i className="fas fa-user text-gray-400 text-5xl"></i>}
                </div>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="text-center md:text-left">
                <h2 id="userNameDisplay" className="text-3xl font-bold text-gray-800 mb-2">
                  {userData.name}
                </h2>
                <p id="userEmail" className="text-gray-600 text-lg">
                  Email: {userData.email}
                </p>
                <p id="userDOB" className="text-gray-600 text-lg">
                  DOB: {userData.dob ? new Date(userData.dob).toLocaleDateString() : 'Not Set'}
                </p>
                <p id="userPhone" className="text-gray-600 text-lg">
                  Phone: {userData.phone}
                </p>
                <p id="userLocation" className="text-gray-600 text-lg">
                  Location: {userData.location}
                </p>
                <p id="userVerified" className="text-gray-600 text-lg">
                  Verified: <span className={userData.verified ? 'text-green-600' : 'text-red-600'}>{userData.verified ? 'Yes' : 'No'}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  id="editEmail"
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                  defaultValue={userData.email}
                />
                <input
                  id="editPhone"
                  type="tel"
                  placeholder="Phone"
                  className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                  defaultValue={userData.phone}
                />
              </div>
              <div>
                <input
                  id="editDOB"
                  type="date"
                  placeholder="Date of Birth"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                  defaultValue={userData.dob ? userData.dob.split('T')[0] : ''}
                />
                <input
                  id="editLocation"
                  type="text"
                  placeholder="Location"
                  className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                  defaultValue={userData.location}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={updateProfile}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
              >
                <i className="fas fa-save mr-2"></i> Update Profile
              </button>
              <button
                onClick={verifyAccount}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
              >
                <i className="fas fa-check mr-2"></i> Verify Account
              </button>
              <button
                onClick={deleteAccount}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
              >
                <i className="fas fa-trash mr-2"></i> Delete Account
              </button>
              <button
                onClick={() => toggleModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
              >
                <i className="fas fa-edit mr-2"></i> Edit in Modal
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <div
          id="editProfileModal"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
            modalOpen ? '' : 'hidden'
          }`}
        >
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform translate-y-10 slide-up relative" data-animation="slide-up">
            <button
              onClick={() => toggleModal(false)}
              className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-700"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
            <div className="space-y-5">
              <input
                id="modalEditName"
                type="text"
                placeholder="Name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                value={modalData.name}
                onChange={(e) => setModalData((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                id="modalEditEmail"
                type="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                value={modalData.email}
                onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                id="modalEditPhone"
                type="tel"
                placeholder="Phone"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                value={modalData.phone}
                onChange={(e) => setModalData((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <input
                id="modalEditDOB"
                type="date"
                placeholder="Date of Birth"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                value={modalData.dob}
                onChange={(e) => setModalData((prev) => ({ ...prev, dob: e.target.value }))}
              />
              <input
                id="modalEditLocation"
                type="text"
                placeholder="Location"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 transition"
                value={modalData.location}
                onChange={(e) => setModalData((prev) => ({ ...prev, location: e.target.value }))}
              />
              <input
                id="modalImageUpload"
                type="file"
                accept="image/*"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700 cursor-pointer"
              />
            </div>
            <button
              onClick={saveProfile}
              className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
            >
              <i className="fas fa-save mr-2"></i> Save
            </button>
            <button
              onClick={createNewProfile}
              className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:pulse transition flex items-center justify-center"
            >
              <i className="fas fa-plus mr-2"></i> Create New Profile
            </button>
          </div>
        </div>

        {/* Secure & Private Tagline */}
        <div className="mt-12 text-center text-lg text-gray-600 font-medium opacity-0 fade-in" data-animation="fade-in">
          <p>Your data is secure, encrypted, and never stored without consent.</p>
        </div>
      </main>
      
      <Footer />
      
      <style>{`
        /* Custom styles with animations */
        #profileImage {
          transition: all 0.3s ease;
        }

        #profileImage:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        #imageUpload, #modalImageUpload {
          cursor: pointer;
        }

        /* Animation Classes */
        .fade-in {
          animation: fadeIn 1s ease-in-out forwards;
        }

        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .bounce {
          animation: bounce 0.5s ease-out;
        }

        .hover\\:pulse:hover {
          animation: pulse 1.5s infinite;
        }

        [data-animation] {
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 640px) {
          .flex-col-md {
            flex-direction: column;
          }
          .w-full-md {
            width: 100%;
          }
          .mt-md-0 {
            margin-top: 0;
          }
          .grid-cols-1-md {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;