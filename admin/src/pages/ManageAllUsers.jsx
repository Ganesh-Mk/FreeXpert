import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ConfirmationModal from '../components/ConfirmationModal';

const ManageAllUsers = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [selectedRole, searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/allUser`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/deleteUser`, {
        data: {
          userId: selectedUser._id
        }
      });
      fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Manage All Users
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <motion.input
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-200 w-full md:w-64 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <motion.select
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-200 w-full md:w-auto transition-all duration-300"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="user">User</option>
            </motion.select>
          </div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50 text-left">
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Enrolled</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border border-gray-600"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{user.name}</div>
                          <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{user.about}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                          user.role === 'developer' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                            'bg-green-900/30 text-green-400 border-green-500/30'} 
                        border`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Courses:</span>
                          <span className="text-gray-300">{user.courses ? user.courses.length : 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Modules:</span>
                          <span className="text-gray-300">{user.modulesCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Quizzes:</span>
                          <span className="text-gray-300">{user.quizzesCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Badges:</span>
                          <span className="text-gray-300">{user.badges || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.courses ? user.courses.length : 0} courses</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 bg-gray-700/50 border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 rounded-lg text-red-400 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center p-8">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              <p className="mt-4 text-gray-400">No users found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="w-8 h-8 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteUser}
            loading={loading}
            title="Delete User"
            description={`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`}
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default ManageAllUsers;