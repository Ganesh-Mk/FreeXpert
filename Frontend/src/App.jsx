import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { initializeAuth } from "./utils/authUtils";
import "./App.css";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Account from "./pages/Account";
import Navbar from "./Components/Navbar";
import News from "./pages/News";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Community from "./pages/Community";
import UserProfilePage from "./pages/Userprofile";
import ProtectedRoute from "./Components/ProtectedRoute";
import { useEffect } from "react";
import BlogDetailPage from "./pages/BlogDetailPage";
import ModulesPage from "./pages/ModulesPage";
import CourseModules from "./Components/CourseModulesManage";
import ModuleContentPage from "./Components/ModuleContentPage";
import Chatting from "./pages/Chatting";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import PaymentSuccess from "./Components/PaymentSuccess";
import { login } from "./store/userSlice";
import { useDispatch } from "react-redux";
import AIChatbot from "./Components/AiModal";


const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const userParam = query.get("user");

    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      user._id = user.id;
      delete user.id;

      localStorage.setItem("userData", JSON.stringify(user));
      dispatch(login(user));
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moduleDetailPage"
          element={
            <ProtectedRoute>
              <ModuleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:blogId"
          element={
            <ProtectedRoute>
              <BlogDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules/:courseId"
          element={
            <ProtectedRoute>
              <ModulesPage />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-modules/:courseId"
          element={
            <ProtectedRoute>
              <CourseModules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatting/:anotherGuyId"
          element={
            <ProtectedRoute>
              <Chatting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatting"
          element={
            <ProtectedRoute>
              <Chatting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/modules/:moduleId"
          element={
            <ProtectedRoute>
              <ModuleContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {/* AI Chatbot component - will only be visible on specified routes */}
      <AIChatbot />
    </Router>
  );
};

export default App;