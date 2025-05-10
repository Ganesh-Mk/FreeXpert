import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateCourseModal = ({ isOpen, onClose, onCreate, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    description: '',
    isPremium: true,
    price: 9.99,
    quizzes: [createEmptyQuiz()]
  });

  function createEmptyQuiz() {
    return {
      question: '',
      options: {
        a: '',
        b: '',
        c: '',
        d: ''
      },
      answer: 'a'
    };
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, thumbnail: file });
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("thumbnail", formData.thumbnail);
    data.append("isPremium", formData.isPremium);
    data.append("price", formData.price);
    data.append("quizzes", JSON.stringify(formData.quizzes));

    onCreate(data)
      .then(() => {
        toast.success("Course created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        onClose();
        // Reset form data
        setFormData({
          title: '',
          thumbnail: '',
          description: '',
          isPremium: true,
          price: 9.99,
          quizzes: [createEmptyQuiz()]
        });
      })
      .catch((error) => {
        toast.error(`Failed to create course: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  };

  const handleAddQuiz = () => {
    setFormData({
      ...formData,
      quizzes: [...formData.quizzes, createEmptyQuiz()]
    });
  };

  const handleRemoveQuiz = (index) => {
    const updatedQuizzes = [...formData.quizzes];
    updatedQuizzes.splice(index, 1);
    setFormData({
      ...formData,
      quizzes: updatedQuizzes
    });
  };

  const handleQuizChange = (index, field, value) => {
    const updatedQuizzes = [...formData.quizzes];
    updatedQuizzes[index][field] = value;
    setFormData({
      ...formData,
      quizzes: updatedQuizzes
    });
  };

  const handleOptionChange = (quizIndex, optionKey, value) => {
    const updatedQuizzes = [...formData.quizzes];
    updatedQuizzes[quizIndex].options[optionKey] = value;
    setFormData({
      ...formData,
      quizzes: updatedQuizzes
    });
  };

  const handleCorrectAnswerChange = (quizIndex, optionKey) => {
    const updatedQuizzes = [...formData.quizzes];
    updatedQuizzes[quizIndex].answer = optionKey;
    setFormData({
      ...formData,
      quizzes: updatedQuizzes
    });
  };

  const handlePriceChange = (e) => {
    // Parse as float and ensure it's not negative
    const value = parseFloat(e.target.value);
    const price = isNaN(value) ? 0 : Math.max(0, value);
    setFormData({ ...formData, price });
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="min-h-screen px-4 py-10 text-center overflow-y-auto">
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <motion.h2
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                    >
                      Create Course
                    </motion.h2>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Course Basic Info */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Course Title</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        placeholder="Enter course title"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Thumbnail</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <motion.textarea
                        whileFocus={{ scale: 1.01 }}
                        placeholder="Enter course description"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 h-40 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Premium Course Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="isPremium"
                          type="checkbox"
                          checked={formData.isPremium}
                          onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                          className="w-4 h-4 text-cyan-500 bg-white border-gray-300 rounded focus:ring-cyan-400"
                        />
                        <label htmlFor="isPremium" className="ml-2 text-sm font-medium text-gray-700">
                          Premium Course
                        </label>
                      </div>

                      {formData.isPremium && (
                        <div className="space-y-2 pl-6">
                          <label className="text-sm font-medium text-gray-700">Price ($)</label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="9.99"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                            value={formData.price}
                            onChange={handlePriceChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quiz Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Course Quizzes</h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAddQuiz}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md text-white text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Quiz
                        </motion.button>
                      </div>

                      {formData.quizzes.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No quizzes added. Click Add Quiz to create a quiz.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {formData.quizzes.map((quiz, quizIndex) => (
                            <motion.div
                              key={quizIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-cyan-600">Quiz #{quizIndex + 1}</h4>
                                {formData.quizzes.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveQuiz(quizIndex)}
                                    className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-all duration-200"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-1 block">Question</label>
                                  <input
                                    type="text"
                                    placeholder="Enter quiz question"
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                                    value={quiz.question}
                                    onChange={(e) => handleQuizChange(quizIndex, 'question', e.target.value)}
                                  />
                                </div>

                                <div className="space-y-3">
                                  <label className="text-sm font-medium text-gray-700 block">Options</label>
                                  {Object.keys(quiz.options).map((optionKey) => (
                                    <div key={optionKey} className="flex items-center gap-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-answer-${quizIndex}`}
                                          checked={quiz.answer === optionKey}
                                          onChange={() => handleCorrectAnswerChange(quizIndex, optionKey)}
                                          className="w-4 h-4 text-cyan-500 bg-white border-gray-300 focus:ring-cyan-400"
                                        />
                                        <span className="text-gray-700 w-6">{optionKey})</span>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder={`Option ${optionKey.toUpperCase()}`}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                                        value={quiz.options[optionKey]}
                                        onChange={(e) => handleOptionChange(quizIndex, optionKey, e.target.value)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading || !formData.title || formData.quizzes.some(quiz => !quiz.question)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Creating...</span>
                        </>
                      ) : (
                        'Create Course'
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CreateCourseModal;