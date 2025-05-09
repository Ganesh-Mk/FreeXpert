import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const BlogManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const blogsPerPage = 4;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const fetchBlogs = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData ? userData._id : null;
    try {
      const response = await axios.get(`${BACKEND_URL}/authorBlogs/${userId}`);
      setBlogs(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch blogs. Please try again later.");
      console.error("Error fetching blogs:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [trigger]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingBlog) {
          setEditingBlog({ ...editingBlog, image: reader.result });
        } else {
          setNewBlog({ ...newBlog, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (editingBlog) {
      updateBlog();
    } else {
      createBlog();
    }
  };


  const createBlog = async () => {
    if (!newBlog.title || !newBlog.description || !newBlog.image) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userID = userData ? userData._id : null;

    const formData = new FormData();
    formData.append("title", newBlog.title);
    formData.append("description", newBlog.description);
    formData.append("userId", userID);

    if (newBlog.image) {
      formData.append("image", dataURItoBlob(newBlog.image));
    }

    try {
      const response = await fetch(`${BACKEND_URL}/createBlog`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setTrigger((prev) => !prev);
        console.log("Blog created successfully");
        setNewBlog({ title: "", description: "", image: "" });
        setIsModalOpen(false);
      } else {
        throw new Error("Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const updateBlog = async () => {
    if (!editingBlog) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("blogId", editingBlog._id);
    formData.append("title", editingBlog.title);
    formData.append("description", editingBlog.description);

    // Handle image update - only append if it's a new image (starts with data:image)
    if (editingBlog.image && editingBlog.image.startsWith('data:image')) {
      // Convert base64 to blob and append
      const imageBlob = dataURItoBlob(editingBlog.image);
      formData.append("image", imageBlob, "image.jpg"); // Add filename
    }

    try {
      const response = await fetch(`${BACKEND_URL}/updateBlog`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog');
      }

      const updatedBlog = await response.json();
      setTrigger((prev) => !prev);
      console.log("Blog updated successfully", updatedBlog);
      setEditingBlog(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating blog:", error);
      alert(error.message || "Failed to update blog");
    } finally {
      setIsLoading(false);
    }
  };


  const dataURItoBlob = (dataURI) => {
    let byteString = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };


  const handleDelete = (blog) => {
    setDeletingBlog(blog);
  };


  const confirmDelete = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userID = userData ? userData._id : null;


    try {
      const response = await fetch(`${BACKEND_URL}/deleteBlog`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userID, blogId: deletingBlog._id }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Blog deleted successfully:", data);
        setTrigger(prev => !prev);
        setDeletingBlog(null);
      } else {
        console.error("Failed to delete blog:", data.message);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("userBlogs", JSON.stringify(blogs));
  }, [blogs]);


  return (
    <div className="bg-white mb-8 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Blogs</h3>
        <button
          onClick={() => {
            setEditingBlog(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors duration-300"
        >
          <Plus className="w-4 h-4" />
          Create Blog
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-gray-50 rounded-lg overflow-hidden h-64 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border border-gray-200"
            >
              <div className="h-32 overflow-hidden">
                <img
                  src={blog.image || "/api/placeholder/400/300"}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {blog.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {blog.description}
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog)}
                    className="p-2 text-red-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Blog
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingBlog.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingBlog(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingBlog ? "Edit Blog" : "Create Blog"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBlog(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingBlog ? editingBlog.title : newBlog.title}
                  onChange={(e) => {
                    if (editingBlog) {
                      setEditingBlog({ ...editingBlog, title: e.target.value });
                    } else {
                      setNewBlog({ ...newBlog, title: e.target.value });
                    }
                  }}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={
                    editingBlog ? editingBlog.description : newBlog.description
                  }
                  onChange={(e) => {
                    if (editingBlog) {
                      setEditingBlog({
                        ...editingBlog,
                        description: e.target.value,
                      });
                    } else {
                      setNewBlog({ ...newBlog, description: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Blog Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : editingBlog ? (
                    "Save Changes"
                  ) : (
                    "Create Blog"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManage;