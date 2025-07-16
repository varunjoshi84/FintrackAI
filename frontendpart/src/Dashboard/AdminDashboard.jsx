import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getUserGrowthData,
  getRevenueAnalytics,
  getUserEngagement,
  getAnnouncements,
  createAnnouncement,
  getSystemSettings,
  updateSystemSettings,
  getSystemHealth,
  createBackup,
  exportData,
  sendNotification,
  toggleMaintenanceMode,
  generateUserReport,
  generateAnalyticsReport,
  generateRevenueReport
} from '../api';

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
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState({});
  const [systemSettings, setSystemSettings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

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
          setTotalUsers(usersResult.data.total);
        }

        // Load announcements
        const announcementsResult = await getAnnouncements();
        if (announcementsResult.success) {
          setAnnouncements(announcementsResult.data);
        }

        // Load analytics data
        const analyticsResult = await getAnalytics();
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.data);
        }

        // Load system health
        const healthResult = await getSystemHealth();
        if (healthResult.success) {
          setSystemHealth(healthResult.data);
        }

        // Load system settings
        const settingsResult = await getSystemSettings();
        if (settingsResult.success) {
          setSystemSettings(settingsResult.data);
        }

      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to mock data
        setSystemStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalTransactions: 45623,
          totalRevenue: 125430,
          monthlyGrowth: 12.5
        });
        
        setUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', joinDate: '2024-01-15', plan: 'Premium' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', joinDate: '2024-02-20', plan: 'Basic' },
          { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'Inactive', joinDate: '2024-01-08', plan: 'Premium' },
          { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'Active', joinDate: '2024-03-10', plan: 'Enterprise' },
        ]);
        
        setAnnouncements([
          { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance on Sunday', date: '2024-07-15', type: 'warning' },
          { id: 2, title: 'New Feature Release', message: 'Enhanced analytics dashboard', date: '2024-07-10', type: 'success' }
        ]);

      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userPage, searchTerm]);

  // Initialize chart
  useEffect(() => {
    const initializeChart = async () => {
      try {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        setTimeout(() => {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          if (chartRef.current && analytics?.userGrowth) {
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: analytics.userGrowth.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                  label: 'Users',
                  data: analytics.userGrowth.data || [850, 920, 1050, 1100, 1180, 1220, 1247],
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  borderColor: 'rgba(59,130,246,1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148,163,184,0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(148,163,184,0.1)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }
            });
          }
        }, 100);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    };

    if (analytics) {
      initializeChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analytics]);

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

  const handleExportData = async (dataType) => {
    try {
      const result = await exportData(dataType, 'csv');
      if (result.success) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_export.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccessMessage(`${dataType} data exported successfully`);
      } else {
        setError(result.message || 'Failed to export data');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  const handleSendNotification = async () => {
    const title = prompt('Enter notification title:');
    const message = prompt('Enter notification message:');
    
    if (title && message) {
      try {
        const result = await sendNotification({ title, message, type: 'info' });
        if (result.success) {
          setSuccessMessage('Notification sent successfully');
        } else {
          setError(result.message || 'Failed to send notification');
        }
      } catch (err) {
        console.error('Notification error:', err);
        setError('Failed to send notification');
      }
    }
  };

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup();
      if (result.success) {
        setSuccessMessage('Backup created successfully');
      } else {
        setError(result.message || 'Failed to create backup');
      }
    } catch (err) {
      console.error('Backup error:', err);
      setError('Failed to create backup');
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const result = await toggleMaintenanceMode(!systemSettings.maintenanceMode);
      if (result.success) {
        setSystemSettings({
          ...systemSettings,
          maintenanceMode: !systemSettings.maintenanceMode
        });
        setSuccessMessage(`Maintenance mode ${!systemSettings.maintenanceMode ? 'enabled' : 'disabled'}`);
      } else {
        setError(result.message || 'Failed to toggle maintenance mode');
      }
    } catch (err) {
      console.error('Maintenance toggle error:', err);
      setError('Failed to toggle maintenance mode');
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      let result;
      switch (reportType) {
        case 'users':
          result = await generateUserReport('csv');
          break;
        case 'analytics':
          result = await generateAnalyticsReport('pdf');
          break;
        case 'revenue':
          result = await generateRevenueReport('excel');
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (result.success) {
        // Handle file download
        const blob = new Blob([result.data], { 
          type: reportType === 'analytics' ? 'application/pdf' : 
                reportType === 'revenue' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report.${reportType === 'analytics' ? 'pdf' : reportType === 'revenue' ? 'xlsx' : 'csv'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccessMessage(`${reportType} report generated successfully`);
      } else {
        setError(result.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate report');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const result = await updateSystemSettings(systemSettings);
      if (result.success) {
        setSuccessMessage('Settings saved successfully');
      } else {
        setError(result.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      setError('Failed to save settings');
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
          {change && (
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
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-cog mr-2"></i>
              System Settings
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
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={systemStats.totalUsers.toLocaleString()}
                icon="fa-users"
                change={systemStats.monthlyGrowth}
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={systemStats.activeUsers.toLocaleString()}
                icon="fa-user-check"
                change={8.2}
                color="green"
              />
              <StatCard
                title="Total Transactions"
                value={systemStats.totalTransactions.toLocaleString()}
                icon="fa-exchange-alt"
                change={15.3}
                color="purple"
              />
              <StatCard
                title="Revenue"
                value={`₹${systemStats.totalRevenue.toLocaleString()}`}
                icon="fa-rupee-sign"
                change={22.1}
                color="yellow"
              />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Growth Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h3>
                <div className="h-64">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Announcements</h3>
                <div className="space-y-3">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-medium text-slate-900 text-sm">{announcement.title}</h4>
                      <p className="text-slate-600 text-xs">{announcement.message}</p>
                      <p className="text-slate-400 text-xs mt-1">{announcement.date}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-blue-600 text-sm hover:underline">
                  Create New Announcement
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <i className="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                  <span className="text-sm text-blue-600 font-medium">Add User</span>
                </button>
                <button 
                  onClick={() => handleExportData('users')}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <i className="fas fa-download text-green-600 text-xl mb-2"></i>
                  <span className="text-sm text-green-600 font-medium">Export Data</span>
                </button>
                <button 
                  onClick={handleSendNotification}
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <i className="fas fa-bullhorn text-purple-600 text-xl mb-2"></i>
                  <span className="text-sm text-purple-600 font-medium">Send Notice</span>
                </button>
                <button 
                  onClick={handleToggleMaintenance}
                  className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <i className="fas fa-tools text-red-600 text-xl mb-2"></i>
                  <span className="text-sm text-red-600 font-medium">
                    {systemSettings.maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i className="fas fa-plus mr-2"></i>
                Add New User
              </button>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">All Users</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2 text-slate-400 hover:text-slate-600">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.plan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.joinDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="text-green-600 hover:text-green-900">Edit</button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-slate-700">Monthly Revenue</span>
                    <span className="font-semibold text-blue-600">₹45,230</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-slate-700">Annual Revenue</span>
                    <span className="font-semibold text-green-600">₹542,760</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-slate-700">Average per User</span>
                    <span className="font-semibold text-purple-600">₹435</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">User Engagement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Daily Active Users</span>
                    <span className="font-semibold">74%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '74%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Feature Usage</span>
                    <span className="font-semibold">86%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '86%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleGenerateReport('users')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <i className="fas fa-file-excel text-green-600 text-2xl mb-2"></i>
                  <div className="text-sm font-medium">User Report</div>
                  <div className="text-xs text-slate-500">Export user data</div>
                </button>
                <button 
                  onClick={() => handleGenerateReport('analytics')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <i className="fas fa-chart-bar text-blue-600 text-2xl mb-2"></i>
                  <div className="text-sm font-medium">Analytics Report</div>
                  <div className="text-xs text-slate-500">Usage analytics</div>
                </button>
                <button 
                  onClick={() => handleGenerateReport('revenue')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <i className="fas fa-money-bill text-yellow-600 text-2xl mb-2"></i>
                  <div className="text-sm font-medium">Revenue Report</div>
                  <div className="text-xs text-slate-500">Financial overview</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={systemSettings.siteName || "FinTrackAI"}
                      onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      value={systemSettings.adminEmail || "admin@fintrackai.com"}
                      onChange={(e) => setSystemSettings({...systemSettings, adminEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="maintenance" 
                      checked={systemSettings.maintenanceMode || false}
                      onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                      className="mr-2" 
                    />
                    <label htmlFor="maintenance" className="text-sm text-slate-700">Maintenance Mode</label>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="twofa" 
                      checked={systemSettings.twoFactorAuth || true}
                      onChange={(e) => setSystemSettings({...systemSettings, twoFactorAuth: e.target.checked})}
                      className="mr-2" 
                    />
                    <label htmlFor="twofa" className="text-sm text-slate-700">Two-Factor Authentication</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="ssl" 
                      checked={systemSettings.forceSSL || true}
                      onChange={(e) => setSystemSettings({...systemSettings, forceSSL: e.target.checked})}
                      className="mr-2" 
                    />
                    <label htmlFor="ssl" className="text-sm text-slate-700">Force SSL</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout || 30}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Backup Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Backup & Recovery</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-slate-700">Last Backup</span>
                    <span className="text-green-600 text-sm">2 hours ago</span>
                  </div>
                  <button 
                    onClick={handleCreateBackup}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Create Backup Now
                  </button>
                  <div className="flex items-center">
                    <input type="checkbox" id="autobackup" className="mr-2" defaultChecked />
                    <label htmlFor="autobackup" className="text-sm text-slate-700">Auto Daily Backup</label>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Server Load</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Medium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Storage</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">85% Free</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
