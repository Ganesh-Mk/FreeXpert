import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import ManageAllBlogs from './pages/ManageAllBlogs';
import ManageAllCourses from './pages/ManageAllCourses';
import ManageModules from './pages/ManageModules';
import MyModules from './pages/MyModules';
import ManageAllUsers from './pages/ManageAllUsers';

// Authentication component
const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an environment variable 
    // accessed through a secure backend API call
    const secretKeyFromEnv = import.meta.env.VITE_ADMIN_ID;

    if (secretKey === secretKeyFromEnv) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid secret key');
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Admin Authentication</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="secretKey" className="block text-gray-300 font-medium mb-2">
                Enter Admin Secret Key
              </label>
              <input
                type="password"
                id="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your secret key"
                className="w-full px-4 py-3 bg-gray-900 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};



const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AdminAuth>
              <Dashboard />
            </AdminAuth>
          }
        >
          <Route index element={<MyCourses />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="blogs" element={<ManageAllBlogs />} />
          <Route path="manage-courses" element={<ManageAllCourses />} />
          <Route path="manage-users" element={<ManageAllUsers />} />
          <Route path="manage-modules/:courseId" element={<ManageModules />} />
          <Route path="my-course-module/:courseId" element={<MyModules />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;