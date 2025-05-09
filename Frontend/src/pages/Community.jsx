import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CommunityPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [userRequests, setUserRequests] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const blogsPerPage = 9;
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [connectionRequests, setConnectionRequests] = useState([]);
  const accountUser = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData ? userData._id : null;
    const fetchConnectionRequests = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/requests?userId=${userId}`
        );
        console.log("requests res :", response.data.requests);

        setConnectionRequests(response.data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchConnectionRequests();
  }, []);

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/allBlog`);
        console.log("Hello", response.data);

        setBlogs(response.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);


  const handleRequest = async (userId, action) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/handle-request`, {
        senderId: userId,
        receiverId: accountUser._id,
        action,
      });

      if (response.data.success) {
        // Update local state
        setConnectionRequests((prev) =>
          prev.filter((request) => request._id !== userId)
        );

        // If accepted, update connections list
        if (action === "accept") {
          // You might want to fetch updated connections here
          // or update local state directly:
          setConnections((prev) => [...prev, userId]);
        }
      }
    } catch (error) {
      console.error("Error handling request:", error);
      // Add error notification here
    }
  };

  // Handle request actions (accept/decline)
  const handleRequestAction = async (requestId, action) => {
    try {
      // In a real app, call your API here
      await axios.post(`${BACKEND_URL}/userRequests/${requestId}/${action}`);

      // Update local state
      setUserRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
      setNotificationCount((prev) => prev - 1);

      // If all notifications processed, close modal
      if (userRequests.length === 1) {
        setTimeout(() => setShowNotificationModal(false), 300);
      }
    } catch (err) {
      console.error(
        `Error ${action === "accept" ? "accepting" : "declining"} request:`,
        err
      );

      // For demo, still update UI
      setUserRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
      setNotificationCount((prev) => prev - 1);

      if (userRequests.length === 1) {
        setTimeout(() => setShowNotificationModal(false), 300);
      }
    }
  };

  // Filter blogs based on search term and user type
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply user type filter
    if (userTypeFilter === "All") {
      return matchesSearch;
    } else {
      return matchesSearch && blog.role === userTypeFilter.toLowerCase();
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Generate page numbers with a maximum of 5 visible page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust startPage if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    setUserTypeFilter(type);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  // Format time for display in notifications
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-16 bg-white text-gray-800 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-16 bg-white text-gray-800 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-white text-gray-800">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Header Text */}
          <div className="text-left">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">

              Freelancer's Community

            </h1>
            <p className="text-gray-500 text-lg">Connect, Share, and Learn</p>
          </div>

          {/* Search, Filter and Notification */}
          <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search blogs..."
                className="w-full pl-12 pr-24 py-3 bg-gray-100 border border-gray-200 rounded-xl 
                        text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 
                        focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1.5 
                        bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                        transition-colors duration-300"
              >
                Search
              </button>
            </form>

            <div className="flex gap-3">
              {/* Filter Dropdown */}
              <div className="relative min-w-40">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 border 
                         border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500/50 
                         focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  {userTypeFilter}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>

                {showFilterDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {["All", "User", "Developer", "Admin"].map((type) => (
                      <button
                        key={type}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200
                                ${userTypeFilter === type
                            ? "text-blue-600"
                            : "text-gray-700"
                          }`}
                        onClick={() => handleFilterChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-3 bg-gray-100 border border-gray-200 rounded-xl"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {connectionRequests?.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                         font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {connectionRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBlogs.map((blog) => (

            <article
              key={blog._id}
              className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-200 
                      hover:border-blue-500/50 transition-all duration-500 
                      hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]"
            >
              {blog.image && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
              <div className="p-6">
                <Link
                  to={`/user/${blog.userId}`}
                  className="group-hover:text-blue-600 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={blog.userImage || "/default-avatar.png"}
                        alt={blog.userName || "Author"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent 
                                group-hover:border-blue-500 transition-all duration-300 cursor-pointer"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                                border-2 border-white"
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-300">
                        {blog.userName || "Anonymous"}
                      </h3>
                      <div className="text-xs text-blue-600">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
                <h2
                  className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 
                            transition-colors duration-300"
                >
                  {blog.title}
                </h2>
                <p className="text-gray-600 line-clamp-2">{blog.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>Explore</span>
                      <span>•</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100">
                        {blog.role || "User"}
                      </span>
                    </div>
                    <Link
                      to={`/user/${blog.userId}`}
                      className="group-hover:text-blue-600 transition-colors duration-300"
                    >
                      <button
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-300"
                      >
                        Read more
                      </button>

                    </Link>
                  </div>
                </div>
              </div>
            </article>


          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all duration-300 
                      ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Previous
            </button>

            {getPageNumbers().map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-10 h-10 rounded-lg transition-all duration-300 
                        ${currentPage === number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all duration-300 
                      ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {currentBlogs.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No results found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filter
            </p>
          </div>
        )}
      </div>

      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowNotificationModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className="text-xl font-semibold mb-4 text-gray-800">Connection Requests</h3>

            {connectionRequests?.length > 0 ? (
              <div className="space-y-4">
                {connectionRequests.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate text-gray-800">{user.name}</h4>
                        <p className="text-gray-500 text-sm truncate mb-2">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 self-end sm:self-center flex-shrink-0">
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => handleRequest(user._id, "decline")}
                      >
                        Decline
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => handleRequest(user._id, "accept")}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No pending connection requests
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
