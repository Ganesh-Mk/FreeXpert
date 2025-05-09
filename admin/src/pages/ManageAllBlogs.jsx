import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ConfirmationModal from '../components/ConfirmationModal';
import UpdateBlogModal from '../components/UpdateBlogModal';

const ManageAllBlogs = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [selectedRole, searchQuery, blogs]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setFetchLoading(true);
      const response = await axios.get(`${BACKEND_URL}/allBlog`);
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setFetchLoading(false);
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = [...blogs];
    if (selectedRole !== 'all') {
      filtered = filtered.filter(blog => blog.role === selectedRole);
    }
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredBlogs(filtered);
  };

  const handleUpdateBlog = async (plainData) => {
    plainData.blogId = selectedBlog._id;

    const formData = new FormData();
    for (const key in plainData) {
      formData.append(key, plainData[key]);
    }

    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/updateBlog`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchBlogs();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating blog:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteBlog = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/deleteBlog`, {
        data: {
          blogId: selectedBlog._id,
          userId: selectedBlog.userId
        }
      });
      fetchBlogs();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        <p className="text-gray-400 text-md ml-4">Loading...</p>
      </div>
    )
  }

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
            Manage All Blogs
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <motion.input
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Search blogs..."
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

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for smooth motion
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-52 object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-xl font-semibold text-gray-100 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300"
                  >
                    {blog.title}
                  </motion.h3>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm rounded-full text-sm font-medium text-cyan-400 border border-gray-600/50 whitespace-nowrap"
                  >
                    {blog.role}
                  </motion.span>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-gray-400 line-clamp-3 text-sm leading-relaxed"
                >
                  {blog.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex justify-between gap-4 pt-2"
                >
                  <button
                    onClick={() => {
                      setSelectedBlog(blog);
                      setUpdateFormData({
                        title: blog.title,
                        image: blog.image,
                        description: blog.description
                      });
                      setIsUpdateModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 rounded-lg text-blue-400 font-medium transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Update
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBlog(blog);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 rounded-lg text-red-400 font-medium transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Update Modal */}
        {isUpdateModalOpen && (
          <UpdateBlogModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={handleUpdateBlog}
            formData={updateFormData}
            setFormData={setUpdateFormData}
            loading={loading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteBlog}
            loading={loading}
            title="Delete Blog"
            description="Are you sure you want to delete this blog?"
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default ManageAllBlogs;
