import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed with this action?",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  loading = false
}) => {

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          title: 'text-red-600',
          button: 'bg-gradient-to-r from-red-600 to-red-500',
          buttonHover: 'hover:from-red-700 hover:to-red-600',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'warning':
        return {
          title: 'text-yellow-600',
          button: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
          buttonHover: 'hover:from-yellow-700 hover:to-yellow-600',
          icon: (
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'info':
        return {
          title: 'text-blue-600',
          button: 'bg-gradient-to-r from-blue-600 to-blue-500',
          buttonHover: 'hover:from-blue-700 hover:to-blue-600',
          icon: (
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          title: 'text-red-600',
          button: 'bg-gradient-to-r from-red-600 to-red-500',
          buttonHover: 'hover:from-red-700 hover:to-red-600',
          icon: '🚫'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative w-full max-w-md overflow-hidden"
              onClick={handleContentClick}
            >
              <div className="bg-white/95 border border-gray-200 rounded-xl shadow-2xl backdrop-blur-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {typeStyles.icon}
                    </motion.div>
                    <motion.h3
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`text-2xl font-bold ${typeStyles.title}`}
                    >
                      {title}
                    </motion.h3>
                  </div>
                </div>

                {/* Body */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-6"
                >
                  <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
                </motion.div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {cancelButtonText}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`px-6 py-2 ${typeStyles.button} ${typeStyles.buttonHover} rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      confirmButtonText
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;