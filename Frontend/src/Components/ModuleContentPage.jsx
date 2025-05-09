import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Check } from "lucide-react";

const ModuleContentPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchModuleContent();
    checkQuizCompletion();
  }, [courseId, moduleId]);

  const fetchModuleContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/getSingleModule`, {
        params: { moduleId },
      });

      // Check if the response contains the success flag and module data
      if (response.data.success && response.data.module) {
        setModuleData(response.data.module);
      } else {
        throw new Error(response.data.message || "Failed to fetch module data");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch module content");
      console.error("Error fetching module:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if the user has completed this module's quizzes
  const checkQuizCompletion = () => {
    try {
      // Get completed quizzes from localStorage
      const completedQuizzes = JSON.parse(
        localStorage.getItem("completedQuizzes") || "[]"
      );

      // Check if current moduleId is in the completed quizzes array
      if (completedQuizzes.includes(moduleId)) {
        setQuizCompleted(true);
      }
    } catch (err) {
      console.error("Error checking quiz completion:", err);
    }
  };

  // Save completed quiz to localStorage
  const saveQuizCompletion = () => {
    try {
      // Get current completed quizzes
      const completedQuizzes = JSON.parse(
        localStorage.getItem("completedQuizzes") || "[]"
      );

      // Add current moduleId if not already in the array
      if (!completedQuizzes.includes(moduleId)) {
        completedQuizzes.push(moduleId);

        // Save updated array back to localStorage
        localStorage.setItem(
          "completedQuizzes",
          JSON.stringify(completedQuizzes)
        );
      }

      setQuizCompleted(true);
    } catch (err) {
      console.error("Error saving quiz completion:", err);
    }
  };

  const fetchQuizzes = async () => {
    if (!moduleData || !moduleData.quizzes || moduleData.quizzes.length === 0) {
      setQuizError("No quizzes available for this module");
      return;
    }

    try {
      setQuizLoading(true);
      setQuizError(null);

      // Fetch all quizzes
      const response = await axios.get(`${BACKEND_URL}/allQuiz`);

      if (response.data) {
        // Filter quizzes that belong to this module
        const moduleQuizzes = response.data.filter((quiz) =>
          moduleData.quizzes.includes(quiz._id)
        );

        // Ensure each quiz has the expected structure
        const processedQuizzes = moduleQuizzes.map((quiz) => {
          // Ensure options is an array
          const options = Array.isArray(quiz.options)
            ? quiz.options
            : typeof quiz.options === "object"
              ? Object.values(quiz.options)
              : [];

          return {
            ...quiz,
            options: options,
            // Default correctAnswer to 0 if not provided
            correctAnswer:
              quiz.correctAnswer !== undefined ? quiz.correctAnswer : 0,
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

  // Log fetched quiz data to help debug
  useEffect(() => {
    if (quizzes.length > 0) {
      console.log("Fetched quiz data:", quizzes);
    }
  }, [quizzes]);

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
      [currentQuizIndex]: optionIndex,
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
      if (
        userAnswers[index] !== null &&
        quiz.correctAnswer === userAnswers[index]
      ) {
        correctAnswers++;
      }
    });

    return {
      score: correctAnswers,
      total: quizzes.length,
      percentage: Math.round((correctAnswers / quizzes.length) * 100),
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
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading module content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={fetchModuleContent}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            <span>Back to Modules</span>
          </motion.button>

          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Module not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Quiz Component
  const renderQuiz = () => {
    if (quizLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading quiz questions...</p>
        </div>
      );
    }

    if (quizError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{quizError}</p>
          <button
            onClick={fetchQuizzes}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No quizzes available for this module.</p>
        </div>
      );
    }

    if (quizSubmitted) {
      return (
        <div className="py-8 w-full">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Results</h3>
            <div className="inline-block bg-gray-100 rounded-full px-6 py-3 mb-4">
              <p className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {score.score}/{score.total} ({score.percentage}%)
                </span>
              </p>
              <p className="text-gray-600">Correct Answers</p>
            </div>

            {score.percentage >= 70 ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle size={24} />
                <p>Congratulations! You passed the quiz.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <XCircle size={24} />
                <p>You need 70% or higher to pass. Try again!</p>
              </div>
            )}
          </div>

          <div className="space-y-6 w-full">
            {quizzes.map((quiz, index) => {
              const options = Array.isArray(quiz.options) ? quiz.options : [];

              return (
                <div
                  key={quiz._id || index}
                  className={`bg-white rounded-lg p-6 shadow-md border ${userAnswers[index] === quiz.correctAnswer
                      ? "border-green-500"
                      : "border-red-500"
                    }`}
                >
                  <p className="text-gray-800 font-medium mb-4">
                    {index + 1}. {quiz.question}
                  </p>

                  <div className="space-y-2">
                    {options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg flex items-center gap-2 ${optIdx === quiz.correctAnswer
                            ? "bg-green-100 border border-green-500"
                            : optIdx === userAnswers[index]
                              ? "bg-red-100 border border-red-500"
                              : "bg-gray-100"
                          }`}
                      >
                        {optIdx === quiz.correctAnswer && (
                          <CheckCircle
                            size={18}
                            className="text-green-500 flex-shrink-0"
                          />
                        )}
                        {optIdx !== quiz.correctAnswer &&
                          optIdx === userAnswers[index] && (
                            <XCircle
                              size={18}
                              className="text-red-500 flex-shrink-0"
                            />
                          )}
                        <span
                          className={`${optIdx === quiz.correctAnswer
                              ? "text-green-500"
                              : optIdx === userAnswers[index]
                                ? "text-red-500"
                                : "text-gray-700"
                            }`}
                        >
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>

                  {quiz.explanation && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        {quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleCloseQuiz}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Back to Module
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
          <p className="text-red-500">Error loading quiz question.</p>
          <button
            onClick={handleCloseQuiz}
            className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Module
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
          <p className="text-red-500">This quiz question has no options.</p>
          <div className="mt-4 flex justify-center gap-4">
            {currentQuizIndex < quizzes.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Skip to Next Question
              </button>
            )}
            <button
              onClick={handleCloseQuiz}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Module
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Module Quiz
          </h3>
          <div className="px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-500">
            Question {currentQuizIndex + 1} of {quizzes.length}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <p className="text-xl font-medium text-gray-800 mb-6">
            {currentQuiz.question}
          </p>

          <div className="space-y-3">
            {options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                onClick={() => handleAnswerSelect(optionIndex)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${userAnswers[currentQuizIndex] === optionIndex
                    ? "bg-blue-100 border border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                <span className="text-gray-800">{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuizIndex === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${currentQuizIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentQuizIndex < quizzes.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={userAnswers[currentQuizIndex] === null}
              className={`px-4 py-2 rounded-lg ${userAnswers[currentQuizIndex] === null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.values(userAnswers).some(
                (answer) => answer === null
              )}
              className={`px-6 py-2 rounded-lg font-medium ${Object.values(userAnswers).some((answer) => answer === null)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
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
                className={`w-3 h-3 rounded-full ${index === currentQuizIndex
                    ? "bg-blue-500"
                    : userAnswers[index] !== null
                      ? "bg-gray-400"
                      : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors w-fit"
            >
              <ArrowLeft size={20} />
              <span>Back to Modules</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-200 pb-6"
            >
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {moduleData.title}
                </h1>

                {/* Quiz completion badge */}
                {quizCompleted && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-500 rounded-full">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      Completed
                    </span>
                  </div>
                )}
              </div>

              {moduleData.duration && (
                <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-500 border border-blue-200 w-fit">
                  {moduleData.duration}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl overflow-hidden border border-gray-200 p-6 shadow-lg"
          >
            {/* Show content or quiz based on showQuiz state */}
            {!showQuiz ? (
              <>
                {/* Video player section */}
                {moduleData.videoUrl && (
                  <div className="mb-6">
                    <video
                      src={moduleData.videoUrl}
                      controls
                      className="w-full rounded-xl"
                      poster={moduleData.thumbnail}
                    />
                  </div>
                )}

                {/* Fallback to thumbnail if no video */}
                {!moduleData.videoUrl && moduleData.thumbnail && (
                  <div className="mb-6">
                    <img
                      src={moduleData.thumbnail}
                      alt={moduleData.title}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  {moduleData.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: moduleData.content }}
                    />
                  ) : (
                    <div className="text-gray-600">
                      <p className="mb-4">{moduleData.description}</p>
                      <p>
                        No additional content available for this module yet.
                      </p>
                    </div>
                  )}
                </div>

                {moduleData.resources && moduleData.resources.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Additional Resources
                    </h3>
                    <ul className="space-y-2">
                      {moduleData.resources.map((resource, index) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline"
                          >
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate(`/modules/${courseId}`)}
                    className="px-6 py-3 h-12 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg bg-blue-500 text-white hover:shadow-blue-500/25 flex items-center gap-2"
                  >
                    {quizCompleted && <ArrowLeft size={20} />}
                    Go Back
                  </button>

                  {moduleData.quizzes && moduleData.quizzes.length > 0 && (
                    <button
                      onClick={handleQuizButtonClick}
                      className={`px-6 py-3 h-12 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${quizCompleted
                          ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/25 flex items-center gap-2"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-purple-500/25"
                        }`}
                    >
                      {quizCompleted && <Check size={18} />}
                      {quizCompleted ? "Review Completed Quiz" : "Take Module Quiz"}
                    </button>
                  )}

                  {moduleData.nextModule && (
                    <button
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/modules/${moduleData.nextModule._id}`
                        )
                      }
                      className="px-6 py-3 h-12 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-blue-500/25 flex items-center"
                    >
                      Next Module: {moduleData.nextModule?.title || "Next Module"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 p-6 w-[60vw] mx-auto shadow-lg"
              >
                {renderQuiz()}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModuleContentPage;
