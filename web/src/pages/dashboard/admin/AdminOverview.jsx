import React from 'react';

const AdminOverview = ({
  systemStats,
  chartPeriod,
  setChartPeriod,
  chartRef,
  chartLoading,
  chartError,
  loadChartData,
  maintenanceMode,
  handleToggleMaintenance,
  handleQuickExport,
  handleSendNotification,
  handleExportSubscribers
}) => {
  return (
        
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={systemStats.totalUsers.toLocaleString()}
                icon="fa-users"
                change={systemStats.totalUsersGrowth || systemStats.monthlyGrowth || 0}
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={systemStats.activeUsers.toLocaleString()}
                icon="fa-user-check"
                change={systemStats.activeUsersGrowth}
                color="green"
              />
              <StatCard
                title="Premium Revenue"
                value={`₹${systemStats.totalRevenue?.toLocaleString() || '0'}`}
                icon="fa-rupee-sign"
                change={systemStats.revenueGrowth}
                color="purple"
              />
            </div>

            {/* User Growth Chart - Full Width and Centered */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">User Growth Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Period:</label>
                    <select
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Last 30 Days</option>
                      <option value="weekly">Last 12 Weeks</option>
                      <option value="monthly">Last 12 Months</option>
                    </select>
                  </div>
                </div>
                <div className="w-full max-w-4xl mx-auto">
                  <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 relative border border-gray-200">
                    {chartLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 font-medium">Loading chart...</p>
                        </div>
                      </div>
                    )}
                    {chartError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                        <div className="text-center">
                          <div className="text-red-500 text-4xl mb-4">📊</div>
                          <p className="text-gray-600 font-medium">{chartError}</p>
                          <p className="text-gray-500 text-sm mt-2">Please refresh the page</p>
                        </div>
                      </div>
                    )}
                    <canvas ref={chartRef} className="w-full h-full"></canvas>
                  </div>
                  
                  {/* Chart Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userGrowthData?.data?.length > 0 ? userGrowthData.data[userGrowthData.data.length - 1] : 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        {chartPeriod === 'daily' ? 'Yesterday' : 
                         chartPeriod === 'weekly' ? 'Last Week' : 
                         'Last Month'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userGrowthData?.data?.length > 1 ? 
                          (() => {
                            const current = userGrowthData.data[userGrowthData.data.length - 1];
                            const previous = userGrowthData.data[userGrowthData.data.length - 2];
                            const growth = previous > 0 ? ((current - previous) / previous * 100) : 0;
                            return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                          })() : 
                          '0%'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{systemStats.totalUsers}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <i className="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                  <span className="text-sm text-blue-600 font-medium">Add User</span>
                </button>

                <button 
                  onClick={handleToggleMaintenance}
                  className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <i className="fas fa-tools text-red-600 text-xl mb-2"></i>
                  <span className="text-sm text-red-600 font-medium">
                    {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                  </span>
                </button>
              </div>
            </div>
          </div>
        

  );
};

export default AdminOverview;
