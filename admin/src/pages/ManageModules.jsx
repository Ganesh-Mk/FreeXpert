import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ConfirmationModal from '../components/ConfirmationModal';
import UpdateModuleModal from '../components/UpdateModuleModal';

const ManageModules = () => {
  const { courseId } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    videoUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/getModules?courseId=${courseId}`);
      console.log(response)
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (plainData) => {
    const formData = new FormData();
    for (let key in plainData) {
      formData.append(key, plainData[key]);
    }
    formData.append("moduleId", selectedModule._id);
    formData.append("courseId", courseId);

    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/updateModule`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      fetchModules();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/deleteModule`, {
        data: {
          moduleId: selectedModule._id,
          courseId
        }
      });
      fetchModules();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting module:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Course Modules
        </motion.h1>

        <div className="grid grid-cols-1 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-semibold text-gray-100">
                    {module.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedModule(module);
                        setUpdateFormData({
                          title: module.title,
                          videoUrl: module.videoUrl,
                          description: module.description
                        });
                        setIsUpdateModalOpen(true);
                      }}
                      className="px-3 py-1 bg-gray-700/50 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 rounded-lg text-blue-400 font-medium transition-all duration-300"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModule(module);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-3 py-1 bg-gray-700/50 border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 rounded-lg text-red-400 font-medium transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-400">{module.description}</p>

                <div className="relative rounded-lg overflow-hidden bg-gray-900">
                  <video
                    className="w-full aspect-video"
                    controls
                    src={module.videoUrl}
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {isUpdateModalOpen && (
          <UpdateModuleModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={handleUpdateModule}
            formData={updateFormData}
            setFormData={setUpdateFormData}
            loading={loading}
          />
        )}

        {isDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteModule}
            loading={loading}
            title="Delete Module"
            description="Are you sure you want to delete this module?"
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default ManageModules;
