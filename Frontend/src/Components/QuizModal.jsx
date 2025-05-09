import React, { useState, useEffect } from 'react';
import { X, Award, Check, AlertTriangle, RotateCcw } from 'lucide-react';

const QuizModal = ({ isOpen, onClose, quiz, moduleId }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentScore, setCurrentScore] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Get stored quiz state from localStorage
  const getStoredQuizState = () => {
    const stored = localStorage.getItem('quizProgress');
    return stored ? JSON.parse(stored) : {};
  };


  // Initialize from localStorage on mount
  useEffect(() => {
    const storedProgress = getStoredQuizState();
    if (storedProgress[moduleId]) {
      setSelectedAnswers(storedProgress[moduleId].answers);
      setCurrentScore(storedProgress[moduleId].score);
      setShowCongrats(true);
    } else {
      resetQuiz();
    }
  }, [moduleId]);

  // Check if all questions are answered
  useEffect(() => {
    setAllQuestionsAnswered(Object.keys(selectedAnswers).length === quiz.length);
  }, [selectedAnswers, quiz.length]);

  const updateCompletedModules = () => {
    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
      localStorage.setItem('completedModules', JSON.stringify(completedModules));
    }
  };

  const updateBadges = () => {
    const currentBadges = parseInt(localStorage.getItem('badges') || '0');
    localStorage.setItem('badges', (currentBadges + 1).toString());
  };

  const updateTotalQuizzes = () => {
    const totalQuizzes = parseInt(localStorage.getItem('totalQuizzesGiven') || '0');
    localStorage.setItem('totalQuizzesGiven', (totalQuizzes + 1).toString());
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentScore(0);
    setShowCongrats(false);
    setAllQuestionsAnswered(false);
    const progress = getStoredQuizState();
    delete progress[moduleId];
    console.log("resetQuiz quiz modal: ", JSON.stringify(progress));

    localStorage.setItem('quizProgress', JSON.stringify(progress));
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionIndex]: optionIndex
    };
    setSelectedAnswers(newAnswers);

    // Calculate score
    const correctAnswers = Object.entries(newAnswers).filter(
      ([index, answer]) => answer === quiz[Number(index)].answer
    ).length;
    setCurrentScore(correctAnswers);
  };

  const handleSubmitQuiz = () => {
    // Update total quizzes taken
    updateTotalQuizzes();

    // Store quiz progress
    const progress = getStoredQuizState();
    progress[moduleId] = {
      answers: selectedAnswers,
      score: currentScore,
      completedAt: new Date().toISOString()
    };
    console.log("handle submit quiz in quiz modal: ", JSON.stringify(progress));
    localStorage.setItem('quizProgress', JSON.stringify(progress));

    // If all answers are correct
    if (currentScore === quiz.length) {
      updateCompletedModules();
      updateBadges();
    }

    setShowCongrats(true);
  };

  const getOptionClassName = (questionIndex, optionIndex) => {
    if (selectedAnswers[questionIndex] === undefined) {
      return 'border-2 border-gray-300 hover:border-purple-500 bg-white hover:bg-gray-50';
    }
    if (optionIndex === quiz[questionIndex].answer) {
      return 'border-2 border-green-500 bg-green-50';
    }
    if (selectedAnswers[questionIndex] === optionIndex) {
      return 'border-2 border-red-500 bg-red-50';
    }
    return 'border-2 border-gray-300 bg-white opacity-50';
  };

  if (!isOpen) return null;

  if (showCongrats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-lg p-8 text-center border border-gray-200 shadow-lg">
          <div className="mb-6">
            {currentScore === quiz.length ? (
              <Award className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
            ) : (
              <AlertTriangle className="h-20 w-20 text-orange-500 mx-auto" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {currentScore === quiz.length ? 'Congratulations! 🎉' : 'Quiz Completed'}
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            You scored {currentScore} out of {quiz.length} questions correctly!
          </p>

          {currentScore === quiz.length && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-yellow-700">You've earned the Module {moduleId} Master Badge!</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-300"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 mt-10 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 shadow-lg">
        <div className="sticky top-0 bg-white border-b border-gray-200">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Module {moduleId} Quiz</h2>
              <p className="text-sm text-gray-500">
                Question {Object.keys(selectedAnswers).length + 1} of {quiz.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(Object.keys(selectedAnswers).length / quiz.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {quiz.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-4">
                <h3 className="text-lg font-medium flex items-start gap-3 text-gray-800">
                  <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-sm border border-purple-200">
                    {questionIndex + 1}
                  </span>
                  <span>{question.question}</span>
                </h3>

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleOptionSelect(questionIndex, optionIndex)}
                      disabled={selectedAnswers[questionIndex] !== undefined}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center gap-3 text-gray-800 
                        ${getOptionClassName(questionIndex, optionIndex)}`}
                    >
                      <span className="flex-1">{option}</span>
                      {selectedAnswers[questionIndex] !== undefined && (
                        optionIndex === quiz[questionIndex].answer ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : selectedAnswers[questionIndex] === optionIndex ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : null
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {allQuestionsAnswered && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={handleSubmitQuiz}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;