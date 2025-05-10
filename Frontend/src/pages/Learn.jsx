import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const LearningPage = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const userId = JSON.parse(localStorage.getItem('userData'))._id;
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [modulesByCourse, setModulesByCourse] = useState({});
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchPurchasedCourses();
    // Initialize completedCourses from localStorage, if any
    const storedCompletedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
    setCompletedCourses(storedCompletedCourses);
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedRole, searchQuery, courses, completedCourses]);

  // Check for course completion whenever modules or courses change
  useEffect(() => {
    if (Object.keys(modulesByCourse).length > 0 && courses.length > 0) {
      updateCourseCompletionStatus();
    }
  }, [modulesByCourse, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/allCourse`);
      const coursesData = response.data;
      setCourses(coursesData);

      // After fetching courses, fetch modules for each course
      for (const course of coursesData) {
        fetchModulesForCourse(course._id);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      // Get the token from localStorage


      if (!userId) {
        console.log('User not logged in');
        return;
      }

      const response = await axios.post(`${BACKEND_URL}/api/payments/purchased-courses`, {
        userId: userId
      });

      setPurchasedCourses(response.data.purchasedCourses || []);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    }
  };

  const fetchModulesForCourse = async (courseId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/getModules`, {
        params: { courseId }
      });

      // Store modules for this course
      setModulesByCourse(prev => ({
        ...prev,
        [courseId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
    }
  };

  const updateCourseCompletionStatus = () => {
    // Get completed modules and quizzes from localStorage
    const completedModuleIds = JSON.parse(localStorage.getItem('completedModules') || '[]');
    const completedQuizIds = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');

    // Create a new array for completed courses
    const newCompletedCourses = [];

    // Check each course
    courses.forEach(course => {
      const courseId = course._id;
      const courseModules = modulesByCourse[courseId] || [];

      // Course is completed if:
      // 1. It has modules AND
      // 2. All modules are completed AND
      // 3. The course quiz is completed (if it has a quiz)

      if (courseModules.length > 0) {
        const allModulesCompleted = courseModules.every(module =>
          completedModuleIds.includes(module._id)
        );

        const hasQuiz = course.quizzes && course.quizzes.length > 0;
        const quizCompleted = hasQuiz ? completedQuizIds.includes(courseId) : true;

        if (allModulesCompleted && quizCompleted) {
          newCompletedCourses.push(courseId);
        }
      }
    });

    // Update localStorage and state if there are changes
    if (JSON.stringify(newCompletedCourses) !== JSON.stringify(completedCourses)) {
      localStorage.setItem('completedCourses', JSON.stringify(newCompletedCourses));
      setCompletedCourses(newCompletedCourses);
      console.log('Updated completed courses:', newCompletedCourses);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    if (selectedRole !== 'all') {
      filtered = filtered.filter(course => course.role === selectedRole);
    }
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCourses(filtered);
  };

  const navigateToModules = (courseId) => {
    navigate(`/modules/${courseId}`);
  };

  const handleCourseAccess = async (courseId, isPremium = true) => {
    // If the course is already purchased or if it's not premium, navigate directly to modules
    if (purchasedCourses.includes(courseId) || !isPremium) {
      navigateToModules(courseId);
      return;
    }

    // Otherwise, initiate the payment process
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('userData');
      if (!token) {
        // Handle not logged in state
        alert('Please log in to purchase this course');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/payments/create-checkout-session`,
        { courseId, userId },
      );

      const { sessionId } = response.data;

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error redirecting to checkout:', error);
        alert('Payment failed. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Payment process failed. Please try again later.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const isCourseCompleted = (courseId) => {
    return completedCourses.includes(courseId);
  };

  const isCourseOwned = (courseId) => {
    return purchasedCourses.includes(courseId);
  };

  const renderCourseCard = (course, index) => {
    const isCompleted = isCourseCompleted(course._id);
    const isPurchased = isCourseOwned(course._id);
    const isPremium = course.isPremium; // Assuming course object includes an isPremium flag

    return (
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
        className={`group bg-white backdrop-blur-sm rounded-xl overflow-hidden border ${isCompleted
          ? 'border-green-500/50 hover:border-green-400/80'
          : isPremium && !isPurchased
            ? 'border-amber-400 hover:border-amber-500'
            : 'border-gray-200 hover:border-cyan-400/50'
          } transition-all duration-300 shadow-lg ${isCompleted
            ? 'hover:shadow-green-400/20'
            : isPremium && !isPurchased
              ? 'hover:shadow-amber-400/30'
              : 'hover:shadow-cyan-400/20'
          } h-[380px] flex flex-col`}
      >
        <div className="relative h-40 flex-shrink-0">
          <motion.img
            src={course.thumbnail || "/api/placeholder/400/320"}
            alt={course.title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
          />

          {/* Completion badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border border-green-400/50 shadow-lg">
              Completed
            </div>
          )}

          {/* Premium badge */}
          {isPremium && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full border border-amber-400/50 shadow-lg flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Premium
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`text-lg font-semibold text-gray-800 line-clamp-2 ${isCompleted
                ? 'group-hover:text-green-600'
                : isPremium && !isPurchased
                  ? 'group-hover:text-amber-600'
                  : 'group-hover:text-cyan-600'
                } transition-colors duration-300 h-12`}
            >
              {course.title}
            </motion.h3>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="px-2 py-1 bg-gray-100 backdrop-blur-sm rounded-full text-xs font-medium text-cyan-600 border border-gray-200 whitespace-nowrap flex-shrink-0"
            >
              {course.role}
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="text-gray-600 line-clamp-2 text-xs leading-relaxed flex-grow mb-3"
          >
            {course.description}
          </motion.p>

          {/* Price tag for premium courses */}
          {isPremium && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-gray-800">${course.price || '9.99'}</span>
              {isPurchased && <span className="text-xs text-green-600 font-medium">Purchased</span>}
            </div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            onClick={() => handleCourseAccess(course._id, isPremium)}
            disabled={processingPayment}
            className={`w-full px-4 py-2 ${isCompleted
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/25'
              : isPremium && !isPurchased
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:shadow-amber-500/25'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/25'
              } text-white text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-auto flex justify-center items-center`}
          >
            {processingPayment ? (
              <div className="w-0 h-0 border-2 border-transparent border-t-transparent rounded-full animate-spin mr-0"></div>
            ) : null}

            {isCompleted
              ? 'Review Modules'
              : isPremium && !isPurchased
                ? 'Purchase Course'
                : 'View Modules'
            }
          </motion.button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        {/* Added Courses heading at the top left */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-gray-800"
        >
          Courses
        </motion.h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
            {error}
            <button
              onClick={fetchCourses}
              className="ml-4 text-sm underline hover:text-red-400"
            >
              Try again
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"
          >
            All Courses
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <motion.input
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Search courses..."
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-700 w-full md:w-64 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <motion.select
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-gray-700 w-full md:w-auto transition-all duration-300"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="user">User</option>
            </motion.select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* API fetched courses */}
          {filteredCourses.length > 0 && filteredCourses.map((course, index) =>
            renderCourseCard(course, index)
          )}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;