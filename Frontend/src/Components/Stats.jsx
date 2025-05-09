import React, { useState, useEffect } from "react";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  Camera,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Edit2,
  Award,
  BookOpen,
  CheckSquare,
  X,
  Plus,
  Trash2,
  Activity,
  Calendar,
  TrendingUp,
  BarChart2,
  Target,
  Star,
  Clock
} from "lucide-react";
import axios from "axios";

const Stats = () => {
  const [userData, setUserData] = useState({});
  const [quizzesGiven, setQuizzesGiven] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [badges, setBadges] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [progressData, setProgressData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [learningStreak, setLearningStreak] = useState(0);
  const [BACKEND_URL, setBackendURL] = useState("");

  // Color palette for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const storedStreak = localStorage.getItem("learningStreak");
    const lastDate = localStorage.getItem("lastLearningDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastDate === today) {
      setLearningStreak(parseInt(storedStreak, 10) || 0);
    } else {
      if (lastDate) {
        const prevDate = new Date(lastDate);
        prevDate.setDate(prevDate.getDate() + 1);
        const formattedPrevDate = prevDate.toISOString().split("T")[0];

        if (formattedPrevDate === today) {
          const newStreak = (parseInt(storedStreak, 10) || 0) + 1;
          setLearningStreak(newStreak);
          localStorage.setItem("learningStreak", newStreak);
        } else {
          setLearningStreak(1);
          localStorage.setItem("learningStreak", "1");
        }
      } else {
        setLearningStreak(1);
        localStorage.setItem("learningStreak", "1");
      }
      localStorage.setItem("lastLearningDate", today);
    }
  }, []);
  useEffect(() => {
    // Set backend URL from environment
    setBackendURL(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

    // Fetch user data
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Get user data from localStorage
        const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(storedUserData);

        // Get completed courses, modules, and quizzes from localStorage
        const storedCompletedQuizzes = JSON.parse(localStorage.getItem("completedQuizzes") || "[]");
        const storedCompletedModules = JSON.parse(localStorage.getItem("completedModules") || "[]");
        const storedCompletedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]");

        console.log("Stored completed quizzes:", storedCompletedQuizzes);
        setCompletedQuizzes(storedCompletedQuizzes);
        setCompletedCourses(storedCompletedCourses);
        setCompletedModules(storedCompletedModules);

        // Get badges and quizzes count
        setBadges((JSON.parse(localStorage.getItem("completedCourses")) || []).length);
        setQuizzesGiven((JSON.parse(localStorage.getItem("completedQuizzes")) || []).length);

        // Generate time-based progress data
        setProgressData(generateProgressData(storedCompletedModules));

        // Generate course completion data
        setCourseData(generateCourseData(storedCompletedCourses.length));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Generate time-based progress data
  const generateProgressData = (modules) => {
    if (!modules || modules.length === 0) return [];

    const currentDate = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Last 6 months
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const month = (currentDate.getMonth() - i + 12) % 12;
      const year = currentDate.getFullYear() - (currentDate.getMonth() < i ? 1 : 0);

      // Random values for demonstration, replace with actual data
      const modulesCompleted = Math.floor(Math.random() * 5) + 1;
      const quizzesCompleted = Math.floor(Math.random() * 4) + 1;

      data.push({
        name: `${monthNames[month]} ${year}`,
        modules: modulesCompleted,
        quizzes: quizzesCompleted,
        total: modulesCompleted + quizzesCompleted
      });
    }

    return data;
  };

  // Generate course completion data
  const generateCourseData = (completedCount) => {
    const totalCourses = 10; // Assumed total courses
    return [
      { name: "Completed", value: completedCount },
      { name: "Remaining", value: totalCourses - completedCount }
    ];
  };

  // Generate skill proficiency data (mock data for demonstration)
  const skillData = [
    { subject: 'Frontend', A: 120, fullMark: 150 },
    { subject: 'Backend', A: 98, fullMark: 150 },
    { subject: 'Database', A: 86, fullMark: 150 },
    { subject: 'DevOps', A: 99, fullMark: 150 },
    { subject: 'UI/UX', A: 85, fullMark: 150 },
    { subject: 'Algorithms', A: 65, fullMark: 150 },
  ];

  // Achievement data based on completed modules, quizzes, and badges
  const achievementData = [
    { name: "Modules", completed: completedModules.length, total: 15 },
    { name: "Quizzes", completed: parseInt(quizzesGiven), total: 20 },
    { name: "Badges", completed: badges || 0, total: 10 }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-md shadow-lg border border-gray-700">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Learning streak component
  const LearningStreakDisplay = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-800 font-semibold text-lg">Current Streak</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">{learningStreak}</span>
            <span className="text-gray-600">days</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Keep going! You're doing great!</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded-full">
          <Activity className="w-10 h-10 text-indigo-600" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {Array(7).fill(0).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${i < learningStreak ? 'bg-indigo-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );

  // Dashboard tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Learning Progress
                </h3>
                <div className="text-gray-500 text-sm">Last 6 months</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="modules" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="quizzes" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            {/* <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Course Completion
                </h3>
              </div>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {courseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            <LearningStreakDisplay />

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top Achievements
                </h3>
              </div>
              <div className="space-y-4">
                {achievementData.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-800 font-medium">{item.name}</span>
                      <span className="text-gray-600">
                        {item.completed} / {item.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.completed / item.total) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-25 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-50">
                  Modules Completed
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white">{completedModules.length}</p>
                  <span className="text-blue-100">modules</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-25 rounded-lg">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-50">
                  Quizzes Completed
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white">{quizzesGiven}</p>
                  <span className="text-green-100">quizzes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-25 rounded-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-50">
                  Badges
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white">{badges}</p>
                  <span className="text-purple-100">earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default Stats;