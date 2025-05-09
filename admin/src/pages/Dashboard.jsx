import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Book, FileText, Settings, Shield, LogOut, Menu, X, Users } from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'courses', icon: Book, text: 'My Courses', path: '/courses' },
    { id: 'blogs', icon: FileText, text: 'Manage All Blogs', path: '/blogs' },
    { id: 'manage-courses', icon: Settings, text: 'Manage All Courses', path: '/manage-courses' },
    { id: 'manage-users', icon: Users, text: 'Manage All Users', path: '/manage-users' }
  ];

  useEffect(() => {
    // Check if we're already on a nested route that we don't want to redirect from
    if (location.pathname.includes('/my-course-module/')) {
      return; // Skip the redirect for module routes
    }

    const isOnValidPath = menuItems.some(item => item.path === location.pathname);
    if (!isOnValidPath) {
      navigate('/courses');
    }
  }, [location.pathname, navigate]);

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white bg-slate-800 rounded-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold text-white">FreeXpert</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${location.pathname === item.path
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </button>
            ))}
          </nav>

          <div className="p-6">
            <button onClick={() => { localStorage.removeItem('isAdminAuthenticated'); navigate('/'); window.location.reload() }} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-all duration-300">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;