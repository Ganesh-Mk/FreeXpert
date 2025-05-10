import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../Components/ConfirmationModule";
import UpdateModuleModal from "../Components/UpdateModuleModal";
import CreateModuleModal from "./CreateModules";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

const CourseModules = () => {
  const { courseId } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const thumbnailRefs = useRef({});
  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    videoUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/getModules?courseId=${courseId}`
      );
      console.log(response);
      setModules(response.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate thumbnail from video
  useEffect(() => {
    modules.forEach((module) => {
      if (module.videoUrl && thumbnailRefs.current[module._id]) {
        const videoElement = thumbnailRefs.current[module._id];
        videoElement.currentTime = 2; // Set to 2 seconds to avoid black frames
        videoElement.addEventListener("loadeddata", () => {
          videoElement.pause();
        });
      }
    });
  }, [modules]);

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
          "Content-Type": "multipart/form-data",
        },
      });

      fetchModules();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating module:", error);
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
          courseId,
        },
      });
      fetchModules();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting module:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle module creation
  const handleCreateModule = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/createModule`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.ok) {
        toast.success("Module creation successfull!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error("Failed to create blog");
      }

      fetchModules();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating module:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  // Create Module Button Component
  const CreateModuleButton = () => (
    <button
      onClick={() => setIsCreateModalOpen(true)}
      className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-cyan-400/30 transition-all duration-200"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Course Modules
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20 flex flex-col h-full"
            >
              {/* Thumbnail Container - Square Aspect Ratio (Clickable) */}
              <div
                className="relative w-full pt-[100%] cursor-pointer"
                onClick={() => toggleModuleExpansion(module._id)}
              >
                <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                  {/* Video Element (Hidden for thumbnailing) */}
                  <video
                    ref={(el) => (thumbnailRefs.current[module._id] = el)}
                    src={module.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>

              {/* Module Info & Controls */}
              <div className="p-5 flex flex-col flex-grow">
                <div
                  className="flex justify-between items-start gap-4 mb-4 cursor-pointer"
                  onClick={() => toggleModuleExpansion(module._id)}
                >
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {module.title}
                  </h3>
                </div>

                <p
                  className="text-gray-600 line-clamp-2 mb-4 flex-grow cursor-pointer"
                  onClick={() => toggleModuleExpansion(module._id)}
                >
                  {module.description}
                </p>

                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setUpdateFormData({
                        title: module.title,
                        videoUrl: module.videoUrl,
                        description: module.description,
                      });
                      setIsUpdateModalOpen(true);
                    }}
                    className="px-3 py-1 bg-white border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 rounded-lg text-blue-600 font-medium transition-all duration-300 flex-1"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1 bg-white border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 rounded-lg text-red-600 font-medium transition-all duration-300 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state if no modules */}
        {modules.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-700">
                No modules found
              </h3>
              <p className="text-gray-600 max-w-md">
                Click the "+" button to add your first module to this course.
              </p>
            </div>
          </motion.div>
        )}

        {/* Fixed Create Module Button */}
        <CreateModuleButton />

        {/* Update Modal */}
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

        {/* Delete Confirmation Modal */}
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

        {/* Create Module Modal */}
        <CreateModuleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateModule}
          loading={loading}
          courseId={courseId}
        />
      </div>
    </div>
  );
};

export default CourseModules;
