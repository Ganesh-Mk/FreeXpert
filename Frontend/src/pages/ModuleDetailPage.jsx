import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Pause,
  Clock,
  ListChecks,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const ModuleDetailPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Video player states
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCourseAndModules();
    checkQuizCompletion();
    checkModuleCompletion();

    // Hide controls after 3 seconds of inactivity
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [courseId, moduleId]);

  useEffect(() => {
    // Set video event listeners once videoRef is available
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoRef.current.addEventListener("ended", handleVideoEnded);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          videoRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
          videoRef.current.removeEventListener("ended", handleVideoEnded);
        }
      };
    }
  }, [videoRef.current]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    markModuleAsCompleted(moduleId);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const checkModuleCompletion = () => {
    try {
      const completedModulesJSON = localStorage.getItem("completedModules");
      if (completedModulesJSON) {
        const completed = JSON.parse(completedModulesJSON);
        setIsCompleted(completed.includes(moduleId));
      }
    } catch (err) {
      console.error("Error checking module completion status:", err);
    }
  };

  const checkQuizCompletion = () => {
    try {
      const completedQuizzesJSON = localStorage.getItem("completedQuizzes");
      if (completedQuizzesJSON) {
        const completedQuizzes = JSON.parse(completedQuizzesJSON);
        setQuizCompleted(completedQuizzes.includes(courseId));
      }
    } catch (err) {
      console.error("Error checking quiz completion status:", err);
    }
  };

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the course data
      const courseResponse = await axios.get(
        `${BACKEND_URL}/getSingleCourse/${courseId}`
      );
      setCourse(courseResponse.data);

      // Fetch modules for this course
      const modulesResponse = await axios.get(`${BACKEND_URL}/getModules`, {
        params: { courseId },
      });
      const modulesData = modulesResponse.data;
      setModules(modulesData);

      // Find current module index
      const index = modulesData.findIndex((m) => m._id === moduleId);
      setCurrentModuleIndex(index);

      // Fetch specific module data
      const currentModule = modulesData.find((m) => m._id === moduleId);
      setModule(currentModule);
    } catch (err) {
      setError(err.message || "Failed to fetch module data");
      console.error("Error fetching course or modules:", err);
    } finally {
      setLoading(false);
    }
  };

  const markModuleAsCompleted = async (moduleId) => {
    try {
      // Get current completed modules
      const completedModulesJSON = localStorage.getItem("completedModules");
      let completed = [];

      if (completedModulesJSON) {
        completed = JSON.parse(completedModulesJSON);
      }

      // Add module if not already included
      if (!completed.includes(moduleId)) {
        completed.push(moduleId);

        // Update state
        setIsCompleted(true);

        // Save to localStorage
        localStorage.setItem("completedModules", JSON.stringify(completed));

        // Update user profile via API
        await updateUserProgress();
      }
    } catch (err) {
      console.error("Error saving module completion:", err);
    }
  };

  const updateUserProgress = async () => {
    try {
      // Get counts from localStorage
      const completedQuizzesJSON =
        localStorage.getItem("completedQuizzes") || "[]";
      const completedModulesJSON =
        localStorage.getItem("completedModules") || "[]";

      const quizzes = JSON.parse(completedQuizzesJSON);
      const modules = JSON.parse(completedModulesJSON);

      // Calculate badge count (can be based on your criteria)
      // For example, 1 badge for every 5 completed modules + quizzes
      const totalCompletions = quizzes.length + modules.length;
      const badges = Math.floor(totalCompletions / 5);

      // Update user profile via API
      await axios.post(`${BACKEND_URL}/updateUser`, {
        quizzesCompleted: quizzes.length,
        modulesCompleted: modules.length,
        badges: badges,
      });

      console.log("User progress updated successfully");
    } catch (err) {
      console.error("Error updating user progress:", err);
    }
  };

  const navigateToNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      navigate(`/courses/${courseId}/modules/${nextModule._id}`);
    } else {
      // If this is the last module, navigate to quiz
      navigate(`/courses/${courseId}`);
    }
  };

  const navigateToPrevModule = () => {
    if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      navigate(`/courses/${courseId}/modules/${prevModule._id}`);
    }
  };

  const navigateToModulesList = () => {
    navigate(`/courses/${courseId}`);
  };

  const navigateToQuiz = () => {
    navigate(`/courses/${courseId}`, { state: { showQuiz: true } });
  };

  const handleModuleCompletion = () => {
    markModuleAsCompleted(moduleId);
    if (currentModuleIndex < modules.length - 1) {
      navigateToNextModule();
    } else {
      navigateToQuiz();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading module content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={fetchCourseAndModules}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Module not found</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top navigation bar */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={navigateToModulesList}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Modules</span>
          </motion.button>

          <div className="flex items-center space-x-2">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={navigateToQuiz}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${quizCompleted
                ? "bg-green-100 text-green-600 border border-green-300 hover:bg-green-200"
                : "bg-purple-100 text-purple-600 border border-purple-300 hover:bg-purple-200"
                } transition-colors`}
            >
              <ListChecks size={16} />
              {quizCompleted ? "Review Quiz" : "Take Quiz"}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Module title and navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {module.title}
                  </h1>
                  {course && (
                    <p className="text-gray-500 mt-1">
                      From: {course.title}
                    </p>
                  )}
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Completed
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video player */}
            {module.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-black rounded-xl overflow-hidden border border-gray-200 aspect-video shadow-sm"
                onMouseEnter={() => setShowControls(true)}
              >
                <video
                  ref={videoRef}
                  src={module.videoUrl}
                  className="w-full h-full object-contain"
                  onClick={handlePlayPause}
                  playsInline
                />

                {/* Video controls overlay */}
                {showControls && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity flex flex-col justify-between p-4">
                    {/* Top controls */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-sm md:text-base truncate max-w-md">
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {module.duration && (
                          <div className="flex items-center gap-1 text-gray-300 text-sm">
                            <Clock size={14} />
                            <span>{module.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center play button */}
                    {!isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-cyan-600/90 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-all"
                      >
                        <Play size={32} className="text-white ml-1" />
                      </button>
                    )}

                    {/* Bottom controls */}
                    <div className="space-y-2">
                      {/* Progress bar */}
                      <div
                        className="w-full h-1 md:h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                        onClick={handleSeek}
                      >
                        <div
                          className="h-full bg-cyan-600"
                          style={{
                            width: `${(currentTime / duration) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handlePlayPause}
                            className="text-white hover:text-cyan-400 transition-colors"
                          >
                            {isPlaying ? (
                              <Pause size={20} />
                            ) : (
                              <Play size={20} />
                            )}
                          </button>
                          <button
                            onClick={handleMuteToggle}
                            className="text-white hover:text-cyan-400 transition-colors"
                          >
                            {isMuted ? (
                              <VolumeX size={20} />
                            ) : (
                              <Volume2 size={20} />
                            )}
                          </button>
                          <div className="text-gray-300 text-sm hidden sm:block">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>
                        <button
                          onClick={handleFullscreenToggle}
                          className="text-white hover:text-cyan-400 transition-colors"
                        >
                          <Maximize size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Module content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Module Content
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {module.description || "No description available for this module."}
                </p>

                {/* Additional content would go here - you can expand this based on your module data structure */}
              </div>
            </motion.div>

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between py-4"
            >
              <button
                onClick={navigateToPrevModule}
                disabled={currentModuleIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentModuleIndex === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-colors`}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous Module</span>
                <span className="sm:hidden">Previous</span>
              </button>

              {!isCompleted ? (
                <button
                  onClick={handleModuleCompletion}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 transition-colors"
                >
                  <span>Mark as Completed</span>
                  <CheckCircle size={16} />
                </button>
              ) : (
                <button
                  onClick={navigateToNextModule}
                  disabled={currentModuleIndex === modules.length - 1 && quizCompleted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentModuleIndex === modules.length - 1 && quizCompleted
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
                    } transition-colors`}
                >
                  <span className="hidden sm:inline">
                    {currentModuleIndex === modules.length - 1 ? "Take Quiz" : "Next Module"}
                  </span>
                  <span className="sm:hidden">
                    {currentModuleIndex === modules.length - 1 ? "Quiz" : "Next"}
                  </span>
                  <ChevronRight size={16} />
                </button>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Module Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Module Navigator</h3>
                <p className="text-gray-500 text-sm">
                  {currentModuleIndex + 1} of {modules.length} modules
                </p>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {modules.map((mod, index) => (
                  <div
                    key={mod._id}
                    className={`p-4 border-b border-gray-200 ${mod._id === moduleId
                      ? "bg-cyan-50 border-l-4 border-l-cyan-600"
                      : "hover:bg-gray-50"
                      } transition-colors cursor-pointer`}
                    onClick={() => navigate(`/courses/${courseId}/modules/${mod._id}`)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${mod._id === moduleId
                            ? "bg-cyan-600 text-white"
                            : completedModules.includes(mod._id)
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-600"
                            }`}>
                            {index + 1}
                          </span>
                          <h4 className={`font-medium line-clamp-1 ${mod._id === moduleId ? "text-cyan-600" : "text-gray-700"
                            }`}>
                            {mod.title}
                          </h4>
                        </div>
                        {mod.duration && (
                          <p className="text-gray-500 text-xs mt-1 ml-8">{mod.duration}</p>
                        )}
                      </div>
                      {completedModules.includes(mod._id) && (
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz button at the bottom of sidebar */}
              {course?.quizzes && course.quizzes.length > 0 && (
                <button
                  onClick={navigateToQuiz}
                  className={`w-full p-4 flex items-center justify-center gap-2 ${quizCompleted
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    } transition-colors`}
                >
                  <ListChecks size={18} />
                  <span>{quizCompleted ? "Review Quiz" : "Take Course Quiz"}</span>
                  {quizCompleted && <CheckCircle size={16} />}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailPage;