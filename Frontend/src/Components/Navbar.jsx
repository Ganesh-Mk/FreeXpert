import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Lock, Menu, X, LogOut, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/userSlice";
import axios from "axios"; // Add this import since it's missing

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname;
  const { isLoggedIn: isLoggedInStore } = useSelector((state) => state.user);

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Check for unread messages
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!userData?._id) return;

      try {
        const response = await axios.get(
          `${BACKEND_URL}/unread/${userData._id}`
        );
        setHasUnreadMessages(response.data.hasUnread);
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [userData, BACKEND_URL]);

  useEffect(() => {
    const checkAuth = () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedData));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [isLoggedInStore]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    dispatch(logout());
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  // Auth buttons for desktop
  const DesktopAuthButtons = () => (
    <div className="hidden md:flex items-center space-x-4">
      {localStorage.getItem("userData") || localStorage.getItem('isLogin')? (
        <div className="flex items-center space-x-4">
          <div className="text-gray-600 px-3">
            <span className="text-purple-600">Hello, </span>
            {userData?.name?.split(" ")[0]}
          </div>
          <div className="flex space-x-2">
            <Link
              to="/account"
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <UserCircle className="w-4 h-4" />
              <span>Account</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 transition-all duration-300 hover:bg-gray-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-[99] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-purple-500" />
                <Lock className="h-4 w-4 text-indigo-500 absolute -bottom-1 -right-1" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-purple-500">Free</span>
                <span className="text-indigo-500">X</span>
                <span className="text-purple-500">pert</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-8">
              {/* {["/", "/learn", "/news", "/community", "/chatting"].map( */}
              {["/", "/learn", "/news", "/community"].map(
                (path) => (
                  <Link
                    key={path}
                    to={path}
                    className="relative group px-3 py-2"
                  >
                    {path === '/chatting' && hasUnreadMessages && (
                      <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <span
                      className={`font-medium relative z-10 transition-colors duration-200 ${isActive(path)
                        ? "text-purple-700"
                        : "text-gray-600 group-hover:text-purple-600"
                        }`}
                    >
                      {path === "/"
                        ? "Home"
                        : path.slice(1).charAt(0).toUpperCase() + path.slice(2)
                      }
                    </span>
                    <div
                      className={`absolute inset-0 h-full w-full bg-purple-100 rounded-lg transition-all duration-300 -z-0 ${isActive(path)
                        ? "scale-100 opacity-100"
                        : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        }`}
                    ></div>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Auth Buttons (Desktop) */}
          <DesktopAuthButtons />

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden bg-gray-50`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {/* {["/", "/learn", "/news", "/community", "/chatting"].map((path) => ( */}
          {["/", "/learn", "/news", "/community"].map((path) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${isActive(path)
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                } relative`}
            >
              {path === "/"
                ? "Home"
                : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
              {path === '/chatting' && hasUnreadMessages && (
                <span className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="pt-2 border-t border-gray-200">
            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-gray-600">
                  <span className="text-purple-600">Hello, </span>
                  {userData?.name?.split(" ")[0]}
                </div>
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-500 mb-2 transition-colors duration-200"
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-500 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;