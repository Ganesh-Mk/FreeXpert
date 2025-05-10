import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Upload, BookOpen, Trash, Edit, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";



const CourseManage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    thumbnail: "",
    quizzes: [createEmptyQuiz()],
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Function to create an empty quiz structure
  function createEmptyQuiz() {
    return {
      question: "",
      options: {
        a: "",
        b: "",
        c: "",
        d: "",
      },
      answer: "a",
    };
  }

  const fetchCourses = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData ? userData._id : null;
      const response = await fetch(`${BACKEND_URL}/userCourses/${userId}`);
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [trigger]);

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingCourse) {
          setEditingCourse({ ...editingCourse, thumbnail: reader.result });
        } else {
          setNewCourse({ ...newCourse, thumbnail: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quiz handling functions
  const handleAddQuiz = () => {
    if (editingCourse) {
      const updatedQuizzes = [...(editingCourse.quizzes || []), createEmptyQuiz()];
      setEditingCourse({
        ...editingCourse,
        quizzes: updatedQuizzes,
      });
    } else {
      const updatedQuizzes = [...newCourse.quizzes, createEmptyQuiz()];
      setNewCourse({
        ...newCourse,
        quizzes: updatedQuizzes,
      });
    }
  };

  const handleRemoveQuiz = (index) => {
    if (editingCourse) {
      const updatedQuizzes = [...editingCourse.quizzes];
      updatedQuizzes.splice(index, 1);
      setEditingCourse({
        ...editingCourse,
        quizzes: updatedQuizzes,
      });
    } else {
      const updatedQuizzes = [...newCourse.quizzes];
      updatedQuizzes.splice(index, 1);
      setNewCourse({
        ...newCourse,
        quizzes: updatedQuizzes,
      });
    }
  };

  const handleQuizChange = (index, field, value) => {
    if (editingCourse) {
      const updatedQuizzes = [...editingCourse.quizzes];
      updatedQuizzes[index][field] = value;
      setEditingCourse({
        ...editingCourse,
        quizzes: updatedQuizzes,
      });
    } else {
      const updatedQuizzes = [...newCourse.quizzes];
      updatedQuizzes[index][field] = value;
      setNewCourse({
        ...newCourse,
        quizzes: updatedQuizzes,
      });
    }
  };

  const handleOptionChange = (quizIndex, optionKey, value) => {
    if (editingCourse) {
      const updatedQuizzes = [...editingCourse.quizzes];
      updatedQuizzes[quizIndex].options[optionKey] = value;
      setEditingCourse({
        ...editingCourse,
        quizzes: updatedQuizzes,
      });
    } else {
      const updatedQuizzes = [...newCourse.quizzes];
      updatedQuizzes[quizIndex].options[optionKey] = value;
      setNewCourse({
        ...newCourse,
        quizzes: updatedQuizzes,
      });
    }
  };

  const handleCorrectAnswerChange = (quizIndex, optionKey) => {
    if (editingCourse) {
      const updatedQuizzes = [...editingCourse.quizzes];
      updatedQuizzes[quizIndex].answer = optionKey;
      setEditingCourse({
        ...editingCourse,
        quizzes: updatedQuizzes,
      });
    } else {
      const updatedQuizzes = [...newCourse.quizzes];
      updatedQuizzes[quizIndex].answer = optionKey;
      setNewCourse({
        ...newCourse,
        quizzes: updatedQuizzes,
      });
    }
  };

  const createCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.thumbnail) {
      alert("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData ? userData._id : null;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      formData.append("title", newCourse.title);
      formData.append("description", newCourse.description);
      formData.append("userId", userId);
      formData.append("quizzes", JSON.stringify(newCourse.quizzes));

      if (newCourse.thumbnail) {
        const thumbnailBlob = dataURItoBlob(newCourse.thumbnail);
        formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");
      }

      // Log the formData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${BACKEND_URL}/createCourse`, {
        method: "POST",
        body: formData,
      });


      if (response.ok) {
        setTrigger((prev) => !prev);
        toast.success("Course created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error("Failed to create blog");
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create course");
      }

      console.log("Course created successfully:", responseData);
      setTrigger((prev) => !prev);
      setNewCourse({
        title: "",
        description: "",
        thumbnail: "",
        quizzes: [createEmptyQuiz()]
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating course:", error);
      alert(error.message || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async () => {
    if (!editingCourse) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("courseId", editingCourse._id);
    formData.append("title", editingCourse.title);
    formData.append("description", editingCourse.description);
    formData.append("quizzes", JSON.stringify(editingCourse.quizzes || []));

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData ? userData._id : null;

    if (!userId) {
      alert("User not authenticated");
      setIsLoading(false);
      return;
    }

    formData.append("userId", userId);

    // Handle image update - only append if it's a new image (starts with data:image)
    if (
      editingCourse.thumbnail &&
      editingCourse.thumbnail.startsWith("data:image")
    ) {
      const thumbnailBlob = dataURItoBlob(editingCourse.thumbnail);
      formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");
    }

    try {
      const response = await fetch(`${BACKEND_URL}/updateCourse`, {
        method: "PUT",
        body: formData,
      });

       if (response.ok) {
              setTrigger((prev) => !prev);
              toast.success("Course updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });

            } else {
              throw new Error("Failed to create blog");
            }

      const updatedCourse = await response.json();
      setTrigger((prev) => !prev);
      console.log("Course updated successfully", updatedCourse);
      setEditingCourse(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating course:", error);
      alert(error.message || "Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (course) => {
    // Ensure each quiz has a valid options object
    const normalizedQuizzes = (course.quizzes || []).map(quiz => {
      // If quiz is missing the options property or it's null, add default options
      if (!quiz.options) {
        return {
          ...quiz,
          options: {
            a: "",
            b: "",
            c: "",
            d: ""
          },
          answer: quiz.answer || "a"
        };
      }
      return quiz;
    });

    // If no quizzes exist, add a default one
    if (normalizedQuizzes.length === 0) {
      normalizedQuizzes.push(createEmptyQuiz());
    }

    setEditingCourse({
      ...course,
      thumbnail: course.thumbnail,
      quizzes: normalizedQuizzes
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCourse) return;

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData ? userData._id : null;

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/deleteCourse`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, courseId: deletingCourse._id }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Course deleted successfully:", data);
        setTrigger((prev) => !prev);
        setDeletingCourse(null);
      } else {
        console.error("Failed to delete course:", data.message);
        alert(data.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.message || "Error occurred while deleting course");
    }
  };

  // Function to navigate to the modules page for a specific course
  const viewCourseModules = (courseId) => {
    navigate(`/course-modules/${courseId}`);
  };

  // Helper function to ensure quizzes are properly formatted
  const ensureValidQuizzes = (quizzes) => {
    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return [createEmptyQuiz()];
    }

    return quizzes.map(quiz => {
      // Ensure each quiz has valid options
      if (!quiz.options) {
        return {
          ...quiz,
          options: { a: "", b: "", c: "", d: "" },
          answer: quiz.answer || "a"
        };
      }
      return quiz;
    });
  };

  return (
    <motion.div
      className="mt-8 mb-8 bg-white p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">My Courses</h3>
        <button
          onClick={() => {
            setEditingCourse(null);
            setNewCourse({
              title: "",
              description: "",
              thumbnail: "",
              quizzes: [createEmptyQuiz()],
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors duration-300"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <motion.div
          className="text-center py-12 bg-gray-100 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No courses created yet. Start by creating your first course!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-md relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={() => handleOpenEditModal(course)}
                  className="p-2 bg-gray-200 bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => setDeletingCourse(course)}
                  className="p-2 bg-red-600 bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Trash className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="aspect-video">
                <img
                  src={course.thumbnail || "/api/placeholder/400/225"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {course.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {course.description}
                </p>
                <button
                  onClick={() => viewCourseModules(course._id)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors duration-300"
                >
                  <Layers className="w-4 h-4" />
                  Manage Modules
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCourse(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={editingCourse ? editingCourse.title : newCourse.title}
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({
                        ...editingCourse,
                        title: e.target.value,
                      })
                      : setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={
                    editingCourse
                      ? editingCourse.description
                      : newCourse.description
                  }
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({
                        ...editingCourse,
                        description: e.target.value,
                      })
                      : setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                  }
                  rows={4}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="flex flex-col gap-4">
                  {(editingCourse && editingCourse.thumbnail) ||
                    (!editingCourse && newCourse.thumbnail) ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                      <img
                        src={
                          editingCourse
                            ? editingCourse.thumbnail
                            : newCourse.thumbnail
                        }
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <label className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-300 text-gray-700 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 inline-block mr-2" />
                    Upload Thumbnail
                  </label>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Course Quizzes</h3>
                  <button
                    onClick={handleAddQuiz}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-indigo-700 transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Quiz
                  </button>
                </div>

                <div className="space-y-6">
                  {(editingCourse
                    ? ensureValidQuizzes(editingCourse.quizzes)
                    : newCourse.quizzes).map((quiz, quizIndex) => (
                      <div
                        key={quizIndex}
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-indigo-600">Quiz #{quizIndex + 1}</h4>
                          {(editingCourse ? (editingCourse.quizzes || []).length : newCourse.quizzes.length) > 1 && (
                            <button
                              onClick={() => handleRemoveQuiz(quizIndex)}
                              className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Question
                            </label>
                            <input
                              type="text"
                              placeholder="Enter quiz question"
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                              value={quiz.question || ""}
                              onChange={(e) => handleQuizChange(quizIndex, 'question', e.target.value)}
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">
                              Options
                            </label>
                            {quiz.options && Object.keys(quiz.options).map((optionKey) => (
                              <div key={optionKey} className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-answer-${quizIndex}`}
                                    checked={quiz.answer === optionKey}
                                    onChange={() => handleCorrectAnswerChange(quizIndex, optionKey)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-50 border-gray-300"
                                  />
                                  <span className="text-gray-700 w-6">{optionKey})</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder={`Option ${optionKey.toUpperCase()}`}
                                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800"
                                  value={quiz.options[optionKey] || ""}
                                  onChange={(e) => handleOptionChange(quizIndex, optionKey, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCourse ? updateCourse : createCourse}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  {isLoading
                    ? editingCourse
                      ? "Updating..."
                      : "Creating..."
                    : editingCourse
                      ? "Update Course"
                      : "Create Course"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Course</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <span className="font-medium">{deletingCourse.title}</span>"? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete Course
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CourseManage;