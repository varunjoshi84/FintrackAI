import React from 'react';

const AdminContacts = ({
  contactStats,
  contacts,
  contactFilters,
  handleFilterChange,
  handleStatusUpdate,
  handlePriorityUpdate,
  handleViewContact,
  handleDeleteContact,
  loadContactData,
  showContactModal,
  setShowContactModal,
  selectedContact,
  setSelectedContact,
  responseMessage,
  setResponseMessage,
  handleSendContactResponse
}) => {
  return (
    <>
        
          <div className="space-y-6">
            {/* Contact Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Total Messages</h3>
                    <p className="text-3xl font-bold">{contactStats.totalContacts}</p>
                  </div>
                  <i className="fas fa-envelope text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Resolved</h3>
                    <p className="text-3xl font-bold">
                      {contactStats.statusStats?.find(s => s._id === 'resolved')?.count || 0}
                    </p>
                  </div>
                  <i className="fas fa-check-circle text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pending</h3>
                    <p className="text-3xl font-bold">
                      {(contactStats.statusStats?.find(s => s._id === 'new')?.count || 0) + 
                       (contactStats.statusStats?.find(s => s._id === 'in-progress')?.count || 0)}
                    </p>
                  </div>
                  <i className="fas fa-clock text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">This Month</h3>
                    <p className="text-3xl font-bold">
                      {contacts.filter(c => {
                        const contactDate = new Date(c.createdAt);
                        const now = new Date();
                        return contactDate.getMonth() === now.getMonth() && 
                               contactDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <i className="fas fa-calendar text-3xl opacity-80"></i>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Filter Messages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contactFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={contactFilters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Careers">Careers</option>
                    <option value="Sales">Sales</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={contactFilters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={contactFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search name, email, message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Messages Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Contact Messages</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {contact.department || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => handleContactStatusUpdate(contact._id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                            {contact.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openContactModal(contact)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View & Respond"
                            >
                              <i className="fas fa-reply"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Message"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {contacts.length === 0 && (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contact messages</h3>
                    <p className="text-gray-500">No contact messages found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>


      {/* Contact Details & Response Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Message Details</h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {/* Contact Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{selectedContact.department || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Original Message</p>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>

            {/* Previous Response (if any) */}
            {selectedContact.adminResponse && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Previous Response</p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.adminResponse}</p>
                  {selectedContact.respondedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded by {selectedContact.respondedBy} on {new Date(selectedContact.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Response Form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Response Email
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response here..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendContactResponse(selectedContact._id)}
                disabled={!responseMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminContacts;
