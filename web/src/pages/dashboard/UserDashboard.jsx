import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/DashboardHeader';
import Footer from '../../components/Footer';
import LocationInput from '../../components/LocationInput';
import DashboardPricing from '../../components/DashboardPricing';
import { getUserProfile, deleteUserAccount, updateUserProfile } from '../../api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState({ open: false, title: '' });
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'overview'; // default to url param if present
  });
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
          if (result.status === 401 || result.message?.toLowerCase().includes('invalid token')) {
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          }
          setUserData(null);
        }
      } catch {
        setUserData(null);
      }
    };
    loadUserProfile();
  }, [navigate]);

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

  const userPlan = userData?.plan || JSON.parse(localStorage.getItem('userInfo') || '{}').plan || 'Basic';

  return (
    <div className="min-h-screen font-inter bg-slate-50 flex flex-col">
      <Header />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl flex items-center justify-center overflow-hidden"
                >
                  <div 
                    className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: userData?.image ? `url(${userData.image})` : 'none' }}
                  >
                    {!userData?.image && (
                      <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                </div>
                <label 
                  htmlFor="headerImageUpload" 
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center cursor-pointer shadow-md text-white transition-colors border-2 border-slate-900"
                  title="Change avatar"
                >
                  <i className="fas fa-camera text-xs"></i>
                </label>
                <input id="headerImageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {userData?.name || 'Welcome Back'}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    userPlan === 'Pro' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    <i className={`fas ${userPlan === 'Pro' ? 'fa-crown' : 'fa-seedling'}`}></i>
                    {userPlan} Plan
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{userData?.email || 'Manage your account and preferences'}</p>
              </div>
            </div>

            {/* Quick Status / Verification Pill */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium ${
                userData?.verified
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                <i className={`fas ${userData?.verified ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                {userData?.verified ? 'Verified Account' : 'Email Unverified'}
              </span>
              <button
                onClick={() => toggleModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <i className="fas fa-pen text-xs"></i> Edit Profile
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-8 border-b border-slate-800/80 -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fas fa-user-circle"></i> Profile Overview
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'plan'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fas fa-crown"></i> Membership & Plans
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <i className="fas fa-cog"></i> Account Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Profile Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Info Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div
                    className="w-full h-full rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-slate-100"
                    style={{
                      backgroundImage: userData?.image ? `url(${userData.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!userData?.image && (
                      <i className="fas fa-user text-slate-400 text-4xl"></i>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900">{userData?.name || 'User Profile'}</h2>
                <p className="text-slate-500 text-sm mb-4">{userData?.email || 'No email set'}</p>

                <div className="bg-slate-50 rounded-xl p-3 text-left border border-slate-100 space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Subscription</span>
                    <span className="font-semibold text-purple-600">{userPlan}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Security</span>
                    <span className="font-semibold text-slate-700">JWT / SSL</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('plan')}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-arrow-circle-up"></i> Manage Subscription
                </button>
              </div>

              {/* Danger Zone / Delete Account */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle text-red-500"></i> Danger Zone
                </h3>
                <p className="text-slate-500 text-xs mb-4">
                  Permanently delete your account, saved reports, and transaction records. This cannot be undone.
                </p>
                <button
                  onClick={deleteAccount}
                  className="w-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash-alt"></i> Delete Account
                </button>
              </div>
            </div>

            {/* Right Col: Details Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                    <p className="text-xs text-slate-500">Your registered contact and profile records</p>
                  </div>
                  <button
                    onClick={() => toggleModal(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Full Name
                    </span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <i className="fas fa-id-card text-blue-500"></i>
                      {userData?.name || 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Email Address
                    </span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2 break-all">
                      <i className="fas fa-envelope text-blue-500"></i>
                      {userData?.email || 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number
                    </span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <i className="fas fa-phone text-blue-500"></i>
                      {userData?.phone || 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Location
                    </span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-blue-500"></i>
                      {userData?.location || 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Date of Birth
                    </span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-blue-500"></i>
                      {userData?.dob ? new Date(userData.dob).toLocaleDateString('en-IN') : 'Not Provided'}
                    </span>
                  </div>
                </div>

                {/* Account Settings Shortcut Cards */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Preferences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => openComingSoon('Email Notifications')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm bg-white flex items-center justify-between text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <i className="fas fa-bell"></i>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Notifications</p>
                          <p className="text-[11px] text-slate-500">Monthly digests & alerts</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    </button>

                    <button
                      onClick={() => openComingSoon('Password Change')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-sm bg-white flex items-center justify-between text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <i className="fas fa-lock"></i>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Security & Password</p>
                          <p className="text-[11px] text-slate-500">Update account credentials</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Membership & Plans (Relocated Upgrade & Pricing View) */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <DashboardPricing />
          </div>
        )}

        {/* Tab 3: Account Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Account Preferences</h3>
              <p className="text-xs text-slate-500 mt-1">Configure your notification and security preferences</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Monthly Expense Alerts</h4>
                  <p className="text-xs text-slate-500">Receive an email when you reach 80% of budget</p>
                </div>
                <button 
                  onClick={() => openComingSoon('Expense Alerts')}
                  className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Configure
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Two-Factor Authentication</h4>
                  <p className="text-xs text-slate-500">Add an extra layer of protection to your account</p>
                </div>
                <button 
                  onClick={() => openComingSoon('2FA')}
                  className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Data Export</h4>
                  <p className="text-xs text-slate-500">Download all your transactions and profile records as CSV</p>
                </div>
                <button 
                  onClick={() => navigate('/reports')}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Go to Reports
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ── Edit Profile Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-slate-100">
            <button
              onClick={() => toggleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-edit text-xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              <p className="text-slate-500 text-xs mt-1">Update your personal account records</p>
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm transition-all"
                    value={modalData[key]}
                    onChange={(e) => setModalData(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                <LocationInput
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm transition-all"
                  value={modalData.location}
                  onChange={(e) => setModalData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => toggleModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold shadow-md transition-all"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Coming Soon Modal ── */}
      {comingSoonModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center border border-slate-100">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-rocket text-2xl"></i>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{comingSoonModal.title}</h2>
            <p className="text-slate-500 text-xs mb-5">
              This feature is currently in active development and will be rolled out soon!
            </p>
            <button
              onClick={() => setComingSoonModal({ open: false, title: '' })}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
