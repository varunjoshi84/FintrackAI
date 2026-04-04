import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Dashboard/Header';
import Footer from '../components/Footer';
import LocationInput from '../components/LocationInput';
import { getUserProfile, deleteUserAccount, updateUserProfile } from '../api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState({ open: false, title: '' });
  const [userData, setUserData] = useState(null);
  const [modalData, setModalData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const result = await getUserProfile();
        if (result.success) {
          setUserData(result.data);
        } else {
          // ✅ Only redirect to login if token is explicitly rejected (401)
          // Do NOT remove token on other errors (network issues, 500s, etc.)
          if (result.status === 401 || result.message?.toLowerCase().includes('invalid token')) {
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          }
          // For other failures, just show empty state — don't kill the session
          setUserData(null);
        }
      } catch {
        // ✅ Network/server error — don't redirect, just show empty state
        // Token is still valid, user is still logged in
        setUserData(null);
      }
    };
    loadUserProfile();
  }, []);

  const toggleModal = (show) => {
    setModalOpen(show);
    if (show && userData) {
      setModalData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dob: userData.dob ? userData.dob.split('T')[0] : '',
        location: userData.location || '',
      });
    }
  };

  const openComingSoon = (title) => {
    setComingSoonModal({ open: true, title });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const saveProfile = async () => {
    const { name, email, phone, dob, location } = modalData;
    if (!name || !email || !phone || !location) {
      alert('Please fill all required fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    try {
      const profileData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        dob: dob || userData?.dob,
        location: location.trim(),
      };
      const result = await updateUserProfile(profileData);
      if (result.success) {
        setUserData(prev => ({ ...prev, ...profileData }));
        window.dispatchEvent(new CustomEvent('userLogin'));
        toggleModal(false);
        alert('Profile updated successfully!');
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (error) {
      alert(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const result = await deleteUserAccount();
        if (result.success) {
          alert('Account deleted successfully!');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          window.location.href = '/';
        } else {
          alert(result.message || 'Failed to delete account');
        }
      } catch {
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    // ✅ FIX: removed relative positioning conflict, proper flex column layout
    <div className="min-h-screen font-inter bg-gray-50 flex flex-col">
      <Header />

      {/* ✅ FIX: Hero banner as normal flow element, not absolute */}
      <div className="bg-slate-900 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-white">
                Welcome back, <span className="text-blue-400">{userData?.name || 'User'}</span>
              </h1>
              <p className="text-slate-300">Manage your personal details and security settings.</p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userData?.verified
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <i className={`fas ${userData?.verified ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {userData?.verified ? 'Verified Account' : 'Unverified Account'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIX: Main content as normal flow, flex-grow pushes footer down */}
      <main className="flex-grow w-full bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-t-2xl"></div>

                <div className="relative mx-auto w-32 h-32 mb-6 mt-4">
                  <div
                    className="relative w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg"
                    style={{
                      backgroundImage: userData?.image ? `url(${userData.image})` : 'none',
                      backgroundSize: 'cover',
                    }}
                  >
                    {!userData?.image && <i className="fas fa-user text-slate-400 text-5xl"></i>}
                  </div>
                  <label htmlFor="imageUpload" className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors border-2 border-white z-10">
                    <i className="fas fa-camera text-sm"></i>
                  </label>
                  <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">{userData?.name || 'User'}</h2>
                <p className="text-slate-500 mb-6 font-medium text-sm">{userData?.email || 'Not Set'}</p>

                <div className="w-full h-px bg-slate-100 mb-5"></div>

                <button
                  onClick={() => toggleModal(true)}
                  className="w-full bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center font-semibold shadow-sm"
                >
                  <i className="fas fa-edit mr-2"></i> Edit Profile
                </button>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-2xl shadow-md border border-red-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
                  <i className="fas fa-shield-alt text-red-500 mr-2"></i> Security Area
                </h3>
                <p className="text-slate-500 text-sm mb-4">Permanently remove your account and all associated data.</p>
                <button
                  onClick={deleteAccount}
                  className="w-full bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center font-semibold"
                >
                  <i className="fas fa-trash-alt mr-2"></i> Delete Account
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                  <button onClick={() => toggleModal(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                    Update
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-envelope text-slate-400"></i> Email Address
                    </p>
                    <p className="text-base text-slate-900 font-medium break-all">{userData?.email || 'Not Set'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-phone text-slate-400"></i> Phone Number
                    </p>
                    <p className="text-base text-slate-900 font-medium">{userData?.phone || 'Not Set'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-slate-400"></i> Date of Birth
                    </p>
                    <p className="text-base text-slate-900 font-medium">
                      {userData?.dob ? new Date(userData.dob).toLocaleDateString('en-IN') : 'Not Set'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-slate-400"></i> Location
                    </p>
                    <p className="text-base text-slate-900 font-medium">{userData?.location || 'Not Set'}</p>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Account Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* ✅ Notifications - Coming Soon */}
                    <button
                      onClick={() => openComingSoon('Notifications')}
                      className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-slate-50 flex items-center justify-between text-left w-full"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                          <i className="fas fa-bell"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Notifications</p>
                          <p className="text-xs text-slate-500">Manage alerts</p>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0">Soon</span>
                    </button>

                    {/* ✅ Password - Coming Soon */}
                    <button
                      onClick={() => openComingSoon('Change Password')}
                      className="p-4 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all bg-slate-50 flex items-center justify-between text-left w-full"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 flex-shrink-0">
                          <i className="fas fa-lock"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Password</p>
                          <p className="text-xs text-slate-500">Update security</p>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0">Soon</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer tagline */}
          <div className="text-center text-sm text-slate-400 pb-4">
            <p className="flex items-center justify-center gap-2">
              <i className="fas fa-shield-alt text-green-500"></i>
              Your data is banking-grade secure, fully encrypted, and never sold to third parties.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Edit Profile Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative m-4 border border-slate-100">
            <button
              onClick={() => toggleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-edit text-2xl text-blue-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
              <p className="text-slate-500 text-sm mt-1">Update your personal information</p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
                { label: 'Date of Birth', key: 'dob', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type={type}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all"
                    value={modalData[key]}
                    onChange={(e) => setModalData(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                <LocationInput
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all"
                  value={modalData.location}
                  onChange={(e) => setModalData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => toggleModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Coming Soon Modal */}
      {comingSoonModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl m-4 text-center border border-slate-100">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-rocket text-3xl text-amber-500"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{comingSoonModal.title}</h2>
            <p className="text-slate-500 text-sm mb-6">
              This feature is currently under development and will be available soon. Stay tuned for updates!
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-200">
              <i className="fas fa-clock"></i> Coming Soon
            </div>
            <button
              onClick={() => setComingSoonModal({ open: false, title: '' })}
              className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;