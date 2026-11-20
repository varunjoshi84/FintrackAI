import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminContacts from './AdminContacts';

import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getUserGrowthData,
  sendNotification,
  toggleMaintenanceMode,
  getContactMessages,
  getContactStats,
  updateContactMessage,
  sendContactResponse,
  deleteContactMessage
} from '../../../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState('');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    plan: ''
  });

  // Contact management state
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState({
    statusStats: [],
    departmentStats: [],
    recentContacts: [],
    totalContacts: 0
  });
  const [contactFilters, setContactFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    department: '',
    priority: '',
    search: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Admin role guard — redirect non-admins immediately (server APIs also enforce this)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userInfo = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch { return {}; } })();
    if (!token || userInfo.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load system stats
        const statsResult = await getAdminStats();
        if (statsResult.success) {
          setSystemStats(statsResult.data);
        }

        // Load users
        const usersResult = await getAllUsers(userPage, 10, searchTerm);
        if (usersResult.success) {
          setUsers(usersResult.data.users);
        }

        // Load maintenance status
        try {
          const maintenanceResult = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/maintenance/status`);
          const maintenanceData = await maintenanceResult.json();
          if (maintenanceData.success) {
            setMaintenanceMode(maintenanceData.data.maintenanceMode);
          }
        } catch (err) {
          console.warn('Failed to load maintenance status:', err);
        }

      }  finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userPage, searchTerm]);

  // Load user growth data
  const loadUserGrowthData = useCallback(async (period = 'monthly') => {
    try {
      const result = await getUserGrowthData(period);
      if (result.success) {
        setUserGrowthData(result.data);
      } else {
        console.warn('Failed to load user growth data:', result.message);
        setUserGrowthData(null);
      }
    } catch (error) {
      console.warn('Error loading user growth data:', error.message);
      setUserGrowthData(null);
    }
  }, []);

  // Load user growth data when component mounts or period changes
  useEffect(() => {
    loadUserGrowthData(chartPeriod);
  }, [chartPeriod, loadUserGrowthData]);

  // Load contact data when contacts tab is active
  const loadContactData = useCallback(async () => {
    try {
      setLoading(true);
      const [contactsResult, statsResult] = await Promise.all([
        getContactMessages(contactFilters),
        getContactStats()
      ]);
      
      setContacts(contactsResult.data || []);
      setContactStats(statsResult.data || {
        statusStats: [],
        departmentStats: [],
        recentContacts: [],
        totalContacts: 0
      });
    } catch (err) {
      console.error('Error loading contact data:', err);
      setError('Failed to load contact data');
    } finally {
      setLoading(false);
    }
  }, [contactFilters]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContactData();
    }
  }, [activeTab, loadContactData]);

  // Initialize chart
  useEffect(() => {
    const initializeChart = async () => {
      try {
        setChartLoading(true);
        setChartError('');
        
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        setTimeout(() => {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            
            // Use user growth data if available, otherwise show empty chart
            const chartData = userGrowthData || {
              labels: ['No Data'],
              data: [0]
            };

            chartInstance.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: chartData.labels,
                datasets: [{
                  label: 'Users',
                  data: chartData.data,
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  borderColor: 'rgba(59,130,246,1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: 'rgba(59,130,246,1)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148,163,184,0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(71,85,105,0.8)',
                      font: {
                        size: 12
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(148,163,184,0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(71,85,105,0.8)',
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(59,130,246,1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart'
                }
              }
            });
            
            setChartLoading(false);
          }
        }, 100);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
        setChartError('Failed to load chart');
        setChartLoading(false);
      }
    };

    // Always initialize chart, with or without user growth data
    initializeChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [userGrowthData]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/admin');
  };

  const handleUserStatusToggle = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      
      const result = await updateUserStatus(userId, newStatus);
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
        setSuccessMessage(`User status updated to ${newStatus}`);
      } else {
        setError(result.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('User status toggle error:', err);
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          setUsers(users.filter(user => user.id !== userId));
          setSuccessMessage('User deleted successfully');
        } else {
          setError(result.message || 'Failed to delete user');
        }
      } catch (err) {
        console.error('User deletion error:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleSearchUsers = async (searchValue) => {
    setSearchTerm(searchValue);
    setUserPage(1); // Reset to first page when searching
  };

  const handleAddUser = async () => {
    try {
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        setError('Name, email, and password are required');
        return;
      }

      const result = await createUser(newUserData);
      if (result.success) {
        // Add new user to the list
        setUsers([result.data, ...users]);
        setSuccessMessage('User created successfully');
        setShowAddUserModal(false);
        setNewUserData({ name: '', email: '', password: '', phone: '', location: '' });
        
        // Reload users to get fresh data from database
        setTimeout(async () => {
          try {
            const usersResult = await getAllUsers(userPage, 10, searchTerm);
            if (usersResult.success) {
              setUsers(usersResult.data.users);
            }
          } catch (err) {
            console.error('Error reloading users:', err);
          }
        }, 500);
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('User creation error:', err);
      setError('Failed to create user');
    }
  };

  const handleModalInputChange = (field, value) => {
    setNewUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditModalInputChange = (field, value) => {
    setEditUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      role: user.role || 'user',
      plan: user.plan || 'Basic'
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editUserData.name || !editUserData.email) {
        setError('Name and email are required');
        return;
      }

      const result = await updateUser(editingUser.id, editUserData);
      if (result.success) {
        // Update user in the list
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...editUserData }
            : user
        ));
        setSuccessMessage('User updated successfully');
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditUserData({ name: '', email: '', phone: '', location: '', role: '', plan: '' });
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('User update error:', err);
      setError('Failed to update user');
    }
  };

  const handleSendNotification = async () => {
    const title = prompt('Enter notification title:');
    if (!title || title.trim() === '') {
      setError('Notification title is required');
      return;
    }
    
    const message = prompt('Enter notification message:');
    if (!message || message.trim() === '') {
      setError('Notification message is required');
      return;
    }
    
    try {
      const result = await sendNotification({ 
        title: title.trim(), 
        message: message.trim(), 
        type: 'info' 
      });
      
      if (result.success) {
        setSuccessMessage('Notification sent successfully to all users');
      } else {
        setError(result.message || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Notification error:', err);
      setError('Failed to send notification. Please try again.');
    }
  };

  const handleToggleMaintenance = async () => {
    const currentMode = maintenanceMode;
    const action = currentMode ? 'disable' : 'enable';
    
    const confirmed = window.confirm(
      `Are you sure you want to ${action} maintenance mode? ${
        !currentMode 
          ? 'This will make the site unavailable to regular users.' 
          : 'This will make the site available to all users again.'
      }`
    );
    
    if (!confirmed) return;
    
    try {
      const result = await toggleMaintenanceMode(!currentMode);
      if (result.success) {
        setMaintenanceMode(!currentMode);
        setSuccessMessage(
          `Maintenance mode ${!currentMode ? 'enabled' : 'disabled'} successfully`
        );
      } else {
        setError(result.message || 'Failed to toggle maintenance mode');
      }
    } catch (err) {
      console.error('Maintenance toggle error:', err);
      setError('Failed to toggle maintenance mode. Please try again.');
    }
  };

  // Contact management handlers
  const handleContactStatusUpdate = async (contactId, newStatus) => {
    try {
      const result = await updateContactMessage(contactId, { status: newStatus });
      if (result.success) {
        setSuccessMessage('Contact status updated successfully');
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to update contact status');
      }
    } catch (err) {
      console.error('Contact status update error:', err);
      setError('Failed to update contact status');
    }
  };

  const handleSendContactResponse = async (contactId) => {
    if (!responseMessage.trim()) {
      setError('Please enter a response message');
      return;
    }

    try {
      const result = await sendContactResponse(contactId, responseMessage);
      if (result.success) {
        setSuccessMessage('Response sent successfully');
        setResponseMessage('');
        setShowContactModal(false);
        setSelectedContact(null);
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to send response');
      }
    } catch (err) {
      console.error('Send response error:', err);
      setError('Failed to send response');
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact message?');
    if (!confirmed) return;

    try {
      const result = await deleteContactMessage(contactId);
      if (result.success) {
        setSuccessMessage('Contact message deleted successfully');
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to delete contact message');
      }
    } catch (err) {
      console.error('Delete contact error:', err);
      setError('Failed to delete contact message');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setContactFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const openContactModal = (contact) => {
    setSelectedContact(contact);
    setResponseMessage(contact.adminResponse || '');
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedContact(null);
    setResponseMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const StatCard = ({ title, value, icon, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && change !== null && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <i className={`fas ${change > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <i className={`fas ${icon} text-${color}-600 text-xl`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-slate-900">FinTrackAI Admin</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <i className="fas fa-user-shield"></i>
                <span className="text-sm">Admin Panel</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-chart-pie mr-2"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              User Management
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>
              Contact Messages
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <span className="text-red-800">{error}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <span className="text-green-800">{successMessage}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
        {/* Overview Tab */}

        {activeTab === 'overview' && (
          <AdminOverview
            systemStats={systemStats}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            chartRef={chartRef}
            chartLoading={chartLoading}
            chartError={chartError}
            loadChartData={loadChartData}
            maintenanceMode={maintenanceMode}
            handleToggleMaintenance={handleToggleMaintenance}
            handleQuickExport={handleQuickExport}
            handleSendNotification={handleSendNotification}
            handleExportSubscribers={handleExportSubscribers}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsers
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userPage={userPage}
            setUserPage={setUserPage}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            error={error}
            setError={setError}
            handleStatusChange={handleStatusChange}
            handleDeleteUser={handleDeleteUser}
            handleEditUser={handleEditUser}
            setShowAddUserModal={setShowAddUserModal}
            showAddUserModal={showAddUserModal}
            newUserData={newUserData}
            handleModalInputChange={handleModalInputChange}
            handleCreateUser={handleCreateUser}
            showEditUserModal={showEditUserModal}
            setShowEditUserModal={setShowEditUserModal}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            editUserData={editUserData}
            setEditUserData={setEditUserData}
            handleEditModalInputChange={handleEditModalInputChange}
            handleUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'contacts' && (
          <AdminContacts
            contactStats={contactStats}
            contacts={contacts}
            contactFilters={contactFilters}
            handleFilterChange={handleFilterChange}
            handleStatusUpdate={handleStatusUpdate}
            handlePriorityUpdate={handlePriorityUpdate}
            handleViewContact={handleViewContact}
            handleDeleteContact={handleDeleteContact}
            loadContactData={loadContactData}
            showContactModal={showContactModal}
            setShowContactModal={setShowContactModal}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            responseMessage={responseMessage}
            setResponseMessage={setResponseMessage}
            handleSendContactResponse={handleSendContactResponse}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
