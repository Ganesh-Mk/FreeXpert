import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Check } from "lucide-react";

const ModulesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const thumbnailRefs = useRef({});
  
  // Quiz related states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchCourseAndModules();
    checkQuizCompletion();
  }, [courseId]);

  // Generate thumbnails from videos when modules are loaded
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

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the course data
      const courseResponse = await axios.get(`${BACKEND_URL}/getSingleCourse/${courseId}`);
      setCourse(courseResponse.data);
      console.log("Course : ", course);
      
      // Fetch modules for this course
      const modulesResponse = await axios.get(`${BACKEND_URL}/getModules`, {
        params: { courseId },
      });
      setModules(modulesResponse.data);
    } catch (err) {
      setError(err.message || "Failed to fetch course data");
      console.error("Error fetching course or modules:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has completed this course's quizzes using localStorage
  const checkQuizCompletion = () => {
    try {
      // Get completed quizzes from localStorage
      const completedQuizzesJSON = localStorage.getItem('completedQuizzes');
      
      if (completedQuizzesJSON) {
        const completedQuizzes = JSON.parse(completedQuizzesJSON);
        
        // Check if current courseId is in the completed quizzes
        setQuizCompleted(completedQuizzes.includes(courseId));
      }
    } catch (err) {
      console.error("Error checking quiz completion status:", err);
    }
  };

  // Save completed quiz to localStorage
  const saveQuizCompletion = () => {
    try {
      // Get current completed quizzes
      const completedQuizzesJSON = localStorage.getItem('completedQuizzes');
      let completedQuizzes = [];
      
      if (completedQuizzesJSON) {
        completedQuizzes = JSON.parse(completedQuizzesJSON);
      }
      
      // Add current courseId if not already included
      if (!completedQuizzes.includes(courseId)) {
        completedQuizzes.push(courseId);
      }
      
      // Save back to localStorage
      localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
      
      setQuizCompleted(true);
    } catch (err) {
      console.error("Error saving quiz completion:", err);
    }
  };

  const fetchQuizzes = async () => {
    if (!course || !course.quizzes || course.quizzes.length === 0) {
      setQuizError("No quizzes available for this course");
      return;
    }

    try {
      setQuizLoading(true);
      setQuizError(null);
      
      // Fetch all quizzes
      const response = await axios.get(`${BACKEND_URL}/allQuiz`);
      
      if (response.data) {
        // Filter quizzes that belong to this course
        const courseQuizzes = response.data.filter(quiz => 
          course.quizzes.includes(quiz._id)
        );
        
        // Ensure each quiz has the expected structure
        const processedQuizzes = courseQuizzes.map(quiz => {
          // Ensure options is an array
          const options = Array.isArray(quiz.options) 
            ? quiz.options 
            : typeof quiz.options === 'object' 
              ? Object.values(quiz.options) 
              : [];
              
          return {
            ...quiz,
            options: options,
            // Default correctAnswer to 0 if not provided
            correctAnswer: quiz.correctAnswer !== undefined ? quiz.correctAnswer : 0,
          };
        });
        
        setQuizzes(processedQuizzes);
        
        // Initialize user answers object
        const initialAnswers = {};
        processedQuizzes.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setUserAnswers(initialAnswers);
      } else {
        throw new Error("Failed to fetch quizzes");
      }
    } catch (err) {
      setQuizError(err.message || "Failed to fetch quizzes");
      console.error("Error fetching quizzes:", err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleViewModule = (moduleId) => {
    navigate(`/courses/${courseId}/modules/${moduleId}`);
  };

  const handleQuizButtonClick = () => {
    setShowQuiz(true);
    if (quizzes.length === 0) {
      fetchQuizzes();
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (quizSubmitted) return;
    
    setUserAnswers({
      ...userAnswers,
      [currentQuizIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    
    quizzes.forEach((quiz, index) => {
      if (userAnswers[index] !== null && quiz.correctAnswer === userAnswers[index]) {
        correctAnswers++;
      }
    });
    
    return {
      score: correctAnswers,
      total: quizzes.length,
      percentage: Math.round((correctAnswers / quizzes.length) * 100)
    };
  };

  const handleSubmitQuiz = () => {
    const result = calculateScore();
    setScore(result);
    setQuizSubmitted(true);
    
    // If user passed the quiz (>=70%), mark it as completed
    if (result.percentage >= 70) {
      saveQuizCompletion();
    }
  };

  const handleRetakeQuiz = () => {
    // Reset quiz state
    setCurrentQuizIndex(0);
    setQuizSubmitted(false);
    
    // Reset user answers
    const initialAnswers = {};
    quizzes.forEach((_, index) => {
      initialAnswers[index] = null;
    });
    setUserAnswers(initialAnswers);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setQuizSubmitted(false);
    setCurrentQuizIndex(0);
  };

  // Render Quiz Component
  const renderQuiz = () => {
    if (quizLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading quiz questions...</p>
        </div>
      );
    }

    if (quizError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{quizError}</p>
          <button
            onClick={fetchQuizzes}
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No quizzes available for this course.</p>
        </div>
      );
    }

    if (quizSubmitted) {
      return (
        <div className="py-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Results</h3>
            <div className="inline-block bg-gray-800 rounded-full px-6 py-3 mb-4">
              <p className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {score.score}/{score.total} ({score.percentage}%)
                </span>
              </p>
              <p className="text-gray-400">Correct Answers</p>
            </div>
            
            {score.percentage >= 70 ? (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle size={24} />
                <p>Congratulations! You passed the quiz.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <XCircle size={24} />
                <p>You need 70% or higher to pass. Try again!</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {quizzes.map((quiz, index) => {
              const options = Array.isArray(quiz.options) ? quiz.options : [];
              
              return (
                <div 
                  key={quiz._id || index} 
                  className={`bg-gray-800 rounded-lg p-6 border ${
                    userAnswers[index] === quiz.correctAnswer 
                      ? 'border-green-400' 
                      : 'border-red-400'
                  }`}
                >
                  <p className="text-white font-medium mb-4">{index + 1}. {quiz.question}</p>
                  
                  <div className="space-y-2">
                    {options.map((option, optIdx) => (
                      <div 
                        key={optIdx}
                        className={`p-3 rounded-lg flex items-center gap-2 ${
                          optIdx === quiz.correctAnswer 
                            ? 'bg-green-400/20 border border-green-400' 
                            : optIdx === userAnswers[index] 
                              ? 'bg-red-400/20 border border-red-400' 
                              : 'bg-gray-700'
                        }`}
                      >
                        {optIdx === quiz.correctAnswer && (
                          <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        )}
                        {optIdx !== quiz.correctAnswer && optIdx === userAnswers[index] && (
                          <XCircle size={18} className="text-red-400 flex-shrink-0" />
                        )}
                        <span className={`${
                          optIdx === quiz.correctAnswer 
                            ? 'text-green-400' 
                            : optIdx === userAnswers[index] 
                              ? 'text-red-400' 
                              : 'text-gray-300'
                        }`}>
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {quiz.explanation && (
                    <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                      <p className="text-gray-300 text-sm">{quiz.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleCloseQuiz}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Back to Course
            </button>
          </div>
        </div>
      );
    }

    // Current quiz question
    const currentQuiz = quizzes[currentQuizIndex];
    
    // Guard against missing options or invalid data structure
    if (!currentQuiz) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">Error loading quiz question.</p>
          <button
            onClick={handleCloseQuiz}
            className="px-4 py-2 mt-4 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            Back to Course
          </button>
        </div>
      );
    }
    
    // Ensure options is an array
    const options = Array.isArray(currentQuiz.options) 
      ? currentQuiz.options 
      : [];
      
    if (options.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">This quiz question has no options.</p>
          <div className="mt-4 flex justify-center gap-4">
            {currentQuizIndex < quizzes.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
              >
                Skip to Next Question
              </button>
            )}
            <button
              onClick={handleCloseQuiz}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Course Quiz
          </h3>
          <div className="px-4 py-2 bg-gray-800 rounded-full text-sm font-medium text-cyan-400">
            Question {currentQuizIndex + 1} of {quizzes.length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-xl font-medium text-white mb-6">{currentQuiz.question}</p>
          
          <div className="space-y-3">
            {options.map((option, optionIndex) => (
              <div 
                key={optionIndex}
                onClick={() => handleAnswerSelect(optionIndex)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  userAnswers[currentQuizIndex] === optionIndex 
                    ? 'bg-cyan-500/20 border border-cyan-400' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <span className="text-gray-200">{option}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuizIndex === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              currentQuizIndex === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          
          {currentQuizIndex < quizzes.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={userAnswers[currentQuizIndex] === null}
              className={`px-4 py-2 rounded-lg ${
                userAnswers[currentQuizIndex] === null 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.values(userAnswers).some(answer => answer === null)}
              className={`px-6 py-2 rounded-lg font-medium ${
                Object.values(userAnswers).some(answer => answer === null)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
              }`}
            >
              Submit Quiz
            </button>
          )}
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="flex gap-1">
            {quizzes.map((_, index) => (
              <div 
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuizIndex 
                    ? 'bg-cyan-400' 
                    : userAnswers[index] !== null 
                      ? 'bg-gray-400' 
                      : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Loading modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <button
            onClick={fetchCourseAndModules}
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </motion.button>

          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No modules found for this course.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors w-fit"
            >
              <ArrowLeft size={20} />
              <span>Back to Courses</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-800 pb-6"
            >
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {course?.title || "Course Modules"}
                </h1>
                
                {/* Quiz completion badge */}
                {quizCompleted && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full">
                    <Check size={16} className="text-green-400" />
                    <span className="text-sm font-medium text-green-400">Quiz Completed</span>
                  </div>
                )}
              </div>
              {course?.description && (
                <p className="text-gray-400 mt-2">{course.description}</p>
              )}
            </motion.div>
          </div>

          {/* Show module grid or quiz based on showQuiz state */}
          {!showQuiz ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {modules.map((module, index) => (
                  <motion.div
                    key={module._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.43, 0.13, 0.23, 0.96],
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20"
                  >
                    <div className="relative overflow-hidden h-48">
                      {module.videoUrl ? (
                        // Video thumbnail generation
                        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                          <video
                            ref={(el) => (thumbnailRefs.current[module._id] = el)}
                            src={module.videoUrl}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        </div>
                      ) : (
                        // Fallback to static image if no video URL
                        <>
                          <motion.img
                            src={module.thumbnail || "/api/placeholder/400/320"}
                            alt={module.title}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        </>
                      )}

                      {module.duration && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-gray-900/80 backdrop-blur-sm rounded-full text-sm font-medium text-cyan-400 border border-gray-700/50">
                          {module.duration}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-xl font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-300"
                      >
                        {module.title}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-gray-400 text-sm leading-relaxed"
                      >
                        {module.description}
                      </motion.p>

                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        onClick={() => handleViewModule(module._id)}
                        className="w-full px-6 py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/25"
                      >
                        View Module
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quiz button at bottom of page */}
              {course?.quizzes && course.quizzes.length > 0 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleQuizButtonClick}
                    className={`px-8 py-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                      quizCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/25 flex items-center gap-2'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-purple-500/25'
                    }`}
                  >
                    {quizCompleted && <Check size={20} />}
                    {quizCompleted ? 'Review Course Quiz' : 'Take Course Quiz'}
                  </button>
                </div>
              )}
            </>
          ) : (
            // Show quiz component when user clicks on quiz button
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 p-6"
            >
              {renderQuiz()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;