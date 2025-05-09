import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trophy,
  BookOpen,
  Award,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
  ChevronLeft,
  Send,
  Mail,
  UserPlus,
  Check,
  Pencil,
  Loader,
  Clock,
} from "lucide-react";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false); // New pending state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("blogs");
  const accountUserId = JSON.parse(localStorage.getItem("userData"))._id;
  const [connectionLoader, setConnectionLoader] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`${BACKEND_URL}/allUser`);
        const users = userResponse.data;
        const foundUser = users.find((u) => u._id === userId);

        if (!foundUser) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setUser(foundUser);
        // Check connection status and pending requests
        setIsConnected(foundUser.connections.includes(accountUserId));
        setIsPending(foundUser.requestsCame.includes(accountUserId)); // Check if request is pending

        const blogsResponse = await axios.get(
          `${BACKEND_URL}/authorBlogs/${userId}`
        );
        setBlogs(blogsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBlogs();
  }, [userId, BACKEND_URL, accountUserId]);

  const handleConnect = async () => {
    setConnectionLoader(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/send-request`, {
        senderId: accountUserId,
        receiverId: userId,
      });

      if (response.data.success) {
        setIsPending(true); // Set pending state on successful request
      }
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setConnectionLoader(false);
    }
  };

  const handleMessageOpen = () => {
    navigate(`/chatting/${userId}`);
  };

  const handleMessageClose = () => {
    setIsMessageModalOpen(false);
    setMessage("");
  };

  const handleMessageSend = () => {
    // Here you would typically send the message via an API
    console.log(`Sending message to ${user.name}: ${message}`);
    handleMessageClose();
    // Show a success notification or feedback
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-white bg-red-600 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header with back button */}
      <div className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <button
            className="mr-4 flex items-center text-white hover:text-blue-100 transition"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back</span>
          </button>
          <h1 className="text-xl font-semibold text-white">Profile</h1>
        </div>
      </div>

      {/* Profile Header */}
      <div className="m-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={user.image}
                alt={`${user.name}'s profile`}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
              />
            </div>

            {/* User Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-blue-600 mt-1 capitalize">{user.role}</p>
              <p className="mt-2 max-w-2xl">
                {user.about || "No description available"}
              </p>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center">
                  <Trophy size={18} className="text-yellow-600 mr-2" />
                  <span>
                    <strong>{user.badges}</strong> Badges
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen size={18} className="text-green-600 mr-2" />
                  <span>
                    <strong>{user.modulesCompleted}</strong> Modules
                  </span>
                </div>
                <div className="flex items-center">
                  <Award size={18} className="text-purple-600 mr-2" />
                  <span>
                    <strong>{user.quizzesCompleted}</strong> Quizzes
                  </span>
                </div>
              </div>

              {/* Member since */}
              <p className="text-sm text-blue-600 mt-2">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-4 md:mt-0">
              <button
                onClick={handleConnect}
                className={`px-4 py-2 rounded-lg flex items-center justify-center text-white ${isConnected
                  ? "bg-green-600 hover:bg-green-700"
                  : isPending
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                disabled={isConnected || isPending}
              >
                {connectionLoader && (
                  <Loader size={18} className="mr-2 animate-spin" />
                )}
                {isConnected ? (
                  <>
                    <Check size={18} className="mr-2" />
                    <span>Connected</span>
                  </>
                ) : isPending ? (
                  <>
                    <Clock size={18} className="mr-2" />
                    <span>Pending</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    <span>Connect</span>
                  </>
                )}
              </button>
              {
                isConnected ? (
                  <button
                    onClick={handleMessageOpen}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center transition text-white"
                  >
                    <Mail size={18} className="mr-2" />
                    <span>Message</span>
                  </button>
                ) : ""
              }

            </div>
          </div>
        </div>
        <div className="mt-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-center md:justify-start flex-wrap gap-6">
              {user.social?.github && (
                <a
                  href={`https://github.com/${user.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition"
                >
                  <Github size={20} className="mr-2" />
                  <span>{user.social.github}</span>
                </a>
              )}

              {user.social?.twitter && (
                <a
                  href={`https://twitter.com/${user.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition"
                >
                  <Twitter size={20} className="mr-2" />
                  <span>{user.social.twitter}</span>
                </a>
              )}

              {user.social?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition"
                >
                  <Linkedin size={20} className="mr-2" />
                  <span>{user.social.linkedin}</span>
                </a>
              )}

              {user.social?.instagram && (
                <a
                  href={`https://instagram.com/${user.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition"
                >
                  <Instagram size={20} className="mr-2" />
                  <span>{user.social.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-6 py-3 font-medium ${activeTab === "blogs"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
            onClick={() => setActiveTab("blogs")}
          >
            Blogs
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === "courses"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === "about"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
        </div>

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Blogs</h2>
              <span className="text-blue-600">{blogs.length} Posts</span>
            </div>

            {blogs.length === 0 ? (
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <p className="text-blue-600 mb-3">No blogs published yet</p>
                {user._id === localStorage.getItem("userId") && (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center mx-auto text-white"
                    onClick={() => navigate("/create-blog")}
                  >
                    <Pencil size={18} className="mr-2" />
                    <span>Write your first blog</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="bg-blue-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold line-clamp-2 mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-blue-600 text-sm mb-3">
                        {formatDate(blog.createdAt)}
                      </p>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {blog.description}
                      </p>
                      <button
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => navigate(`/blog/${blog._id}`)}
                      >
                        <span>Read more</span>
                        <ExternalLink size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Courses</h2>
            {user.courses && user.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Course items would go here */}
                <p className="text-blue-600 col-span-full">
                  Courses will be displayed here
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <p className="text-blue-600">No courses enrolled yet</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">About {user.name}</h2>
            <p className="mb-6">
              {user.about || "No detailed description available"}
            </p>

            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
            <p className="flex items-center mb-3">
              <Mail size={18} className="mr-2 text-blue-600" />
              <span>{user.email}</span>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-blue-600 text-sm">Joined on</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-blue-600 text-sm">Last updated</p>
                <p>{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <p className="text-blue-600 text-sm">Role</p>
                <p className="capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-blue-600 text-sm">Progress</p>
                <p>{user.modulesCompleted} modules completed</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Send Message to {user.name}
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full rounded-lg bg-gray-100 border border-gray-300 p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 mb-4"
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleMessageClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMessageSend}
                disabled={!message.trim()}
                className={`px-4 py-2 rounded-lg flex items-center text-white ${message.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 opacity-50 cursor-not-allowed"
                  } transition`}
              >
                <Send size={18} className="mr-2" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
