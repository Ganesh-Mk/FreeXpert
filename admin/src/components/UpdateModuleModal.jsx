import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateModuleModal = ({
  isOpen,
  onClose,
  onUpdate,
  formData,
  setFormData,
  loading = false
}) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleContentClick = (e) => e.stopPropagation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, video: file });
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.video) {
      data.append("video", formData.video);
    } else {
      data.append("videoUrl", formData.videoUrl);
    }

    const plainData = {};
    data.forEach((value, key) => {
      plainData[key] = value;
    });

    onUpdate(plainData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-[-2rem] inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="inline-block w-full max-w-xl p-6 my-8 overflow-hidden text-left align-middle"
            onClick={handleContentClick}
          >
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <motion.h2
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    Update Module
                  </motion.h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Module Title</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      placeholder="Enter module title"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Upload Video</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="file"
                      accept="video/*"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                      onChange={handleFileChange}
                    />
                  </div>


                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      placeholder="Enter module description"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 h-40 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Update Module'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateModuleModal;