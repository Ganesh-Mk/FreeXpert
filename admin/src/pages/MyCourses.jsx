import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';
import UpdateCourseModal from '../components/UpdateCourseModal';
import CreateCourseModal from '../components/CreateCourseModal';

const MyCourses = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const userId = import.meta.env.VITE_ADMIN_ID;
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    thumbnail: '',
    description: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setFetchLoading(true);
      const response = await axios.get(`${BACKEND_URL}/allCourse`);
      const adminCourses = response.data.filter(course => course.role === 'admin');
      setCourses(adminCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setFetchLoading(false);
      setLoading(false);
    }
  };

  const filterCourses = () => {
    const filtered = courses.filter(course =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleCreateCourse = async (formData) => {
    formData.append("userId", userId);
    const plainData = {};
    formData.forEach((value, key) => {
      plainData[key] = value;
    });

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/createCourse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      fetchCourses();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response) {
        alert(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (formData) => {
    formData.append("userId", userId);
    formData.append("courseId", selectedCourse._id);

    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/updateCourse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCourses();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating course:', error);
      if (error.response) alert(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/deleteCourse`, {
        data: {
          courseId: selectedCourse._id,
          userId
        }
      });
      fetchCourses();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        alert(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToModules = (courseId) => {
    console.log("Navigating to modules for course ID:", courseId);
    // Use the full path that includes the parent route
    navigate(`/my-course-module/${courseId}`);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            My Courses
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <motion.input
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Search courses..."
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-200 w-full md:w-64 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 active:scale-95"
            >
              Create Course
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20"
            >
              <div className="relative overflow-hidden cursor-pointer" onClick={() => navigateToModules(course._id)}>
                <motion.img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-52 object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <div className="absolute bottom-4 right-4 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-1">
                  <span className="text-cyan-300 text-sm font-medium">View Course</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-xl font-semibold text-gray-100 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300"
                >
                  {course.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-gray-400 line-clamp-3 text-sm leading-relaxed"
                >
                  {course.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex justify-between gap-4 pt-2"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                      setUpdateFormData({
                        title: course.title,
                        thumbnail: course.thumbnail,
                        description: course.description
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
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

        {isCreateModalOpen && (
          <CreateCourseModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateCourse}
            loading={loading}
          />
        )}

        {isUpdateModalOpen && (
          <UpdateCourseModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={handleUpdateCourse}
            formData={updateFormData}
            setFormData={setUpdateFormData}
            loading={loading}
          />
        )}

        {isDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteCourse}
            loading={loading}
            title="Delete Course"
            description="Are you sure you want to delete this course?"
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default MyCourses;