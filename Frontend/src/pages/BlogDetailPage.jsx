import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogDetailPage = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [authorBlogs, setAuthorBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // Custom Button Component
  const Button = ({
    children,
    onClick,
    className = "",
    variant = "default",
  }) => {
    const baseStyles =
      "px-4 py-2 rounded-lg font-medium transition-all duration-300 ";
    const variants = {
      default: "bg-blue-500 hover:bg-blue-600 text-white",
      purple: "bg-purple-500 hover:bg-purple-600 text-white",
      link: "bg-transparent hover:text-blue-300 p-0",
    };

    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  // Custom Card Component
  const Card = ({ children, className = "" }) => (
    <div className={`rounded-xl border border-gray-700 ${className}`}>
      {children}
    </div>
  );

  // Custom Textarea Component
  const Textarea = ({ value, onChange, placeholder, className = "" }) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white 
                 placeholder-gray-400 focus:outline-none focus:border-blue-500 
                 resize-none min-h-[100px] ${className}`}
    />
  );

  // Custom Separator Component
  const Separator = () => <div className="h-px w-full bg-gray-700" />;

  // Icons Components
  const MessageCircleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const UserPlusIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  useEffect(() => {
    const fetchBlogAndAuthor = async () => {
      try {
        setLoading(true);
        const blogResponse = await axios.get(`${BACKEND_URL}/blog/${blogId}`);
        setBlog(blogResponse.data);

        const authorBlogsResponse = await axios.get(
          `${BACKEND_URL}/authorBlogs/${blogResponse.data.userId}`
        );
        setAuthorBlogs(
          authorBlogsResponse.data.filter(
            (authorBlog) => authorBlog._id !== blogId
          )
        );
      } catch (err) {
        setError("Failed to fetch blog details. Please try again later.");
        console.error("Error fetching blog details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndAuthor();
  }, [blogId]);

  const handleConnect = async () => {
    try {
      await axios.post(`${BACKEND_URL}/connect/${blog.userId}`);
    } catch (err) {
      console.error("Error connecting with author:", err);
    }
  };

  const handleSendMessage = async () => {
    try {
      await axios.post(`${BACKEND_URL}/message/${blog.userId}`, {
        message: message,
      });
      setMessage("");
      setShowMessageForm(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-16 bg-white text-gray-800 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen mt-16 bg-white text-gray-800 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16 bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Author Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={blog.author?.image || "/default-avatar.png"}
              alt={blog.author?.name || "Author"}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/30"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {blog.author?.name || "Anonymous"}
          </h2>
          {/* <div className="flex gap-4 mb-4">
            <Button onClick={handleConnect} className="flex items-center gap-2">
              <UserPlusIcon />
              Connect
            </Button>
            <Button
              onClick={() => setShowMessageForm(!showMessageForm)}
              variant="purple"
              className="flex items-center gap-2"
            >
              <MessageCircleIcon />
              Message
            </Button>
          </div> */}

          {/* Message Form */}
          {/* {showMessageForm && (
            <Card className="w-full max-w-md bg-gray-100">
              <div className="p-6">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="mb-4"
                />
                <Button
                  onClick={handleSendMessage}
                  variant="purple"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <SendIcon />
                  Send Message
                </Button>
              </div>
            </Card>
          )} */}
        </div>

        <Separator />

        {/* Blog Content */}
        <article className="mb-12">
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-[400px] object-cover rounded-xl mb-8"
            />
          )}
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="text-gray-500 mb-6">
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>{blog.readTime || "5 min"} read</span>
          </div>
          <div className="prose max-w-none">
            {blog.description}
          </div>
        </article>

        <Separator />

        {/* More from Author Section */}
        {authorBlogs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              More from {blog.author?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authorBlogs.map((authorBlog) => (
                <Card
                  key={authorBlog._id}
                  className="bg-gray-50 hover:border-blue-500/50 
                           transition-all duration-500 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]"
                >
                  <div className="p-6">
                    {authorBlog.image && (
                      <img
                        src={authorBlog.image}
                        alt={authorBlog.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3
                      className="text-xl font-semibold mb-2 hover:text-blue-600 
                                 transition-colors duration-300"
                    >
                      {authorBlog.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {authorBlog.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{authorBlog.readTime || "5 min"} read</span>
                      <Button
                        variant="link"
                        className="text-blue-600"
                        onClick={() =>
                          (window.location.href = `/blog/${authorBlog._id}`)
                        }
                      >
                        Read more
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
