const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Import routes
const getAll = require("./routes/getAll");
const signupRoute = require("./routes/singup");
const loginRoute = require("./routes/login");
const deleteUser = require("./routes/deleteUser");
const getAllUser = require("./routes/getAllUser");
const updateUser = require("./routes/updateUser");
const getSingleuser = require("./routes/getSingleUser");
const updatePassword = require("./routes/updatePassword");

const createBlog = require("./routes/createBlog");
const deleteBlog = require("./routes/deleteBlog");
const getAllBlog = require("./routes/getAllBlog");
const updateBlog = require("./routes/updateBlog");

const createCourse = require("./routes/createCourse");
const deleteCourse = require("./routes/deleteCourse");
const getAllCourse = require("./routes/getAllCourse");
const updateCourse = require("./routes/updateCourse");
const getCourses = require("./routes/getCourses");

const createModule = require('./routes/createModule');
const updateModule = require('./routes/updateModule');
const deleteModule = require('./routes/deleteModule');
const getModules = require('./routes/getModules');
const getAllModules = require('./routes/getAllModules');
const getSingleUserBlog = require('./routes/getSingleUserBlog');
const getAllQuiz = require('./routes/getAllQuiz');
const getUserCourses = require("./routes/userCourse")
const getSingleModule = require("./routes/getSingleModule")
const getSingleCourse = require("./routes/getTheSignleCourse")
const fetchmessageRoutes = require("./routes/fetchMessages")
const messageRoutes = require("./routes/messageRoute")

// User
app.use(getAll);
app.use(signupRoute);
app.use(loginRoute);
app.use(deleteUser);
app.use(getAllUser);
app.use(updateUser);
app.use(getSingleuser);
app.use(updatePassword);

// Blog
app.use(createBlog);
app.use(deleteBlog);
app.use(getAllBlog);
app.use(updateBlog);
app.use(getSingleUserBlog);

// Course
app.use(createCourse);
app.use(deleteCourse);
app.use(getAllCourse);
app.use(updateCourse);
app.use(getUserCourses);
app.use(getSingleCourse);
app.use(getCourses);

// Module
app.use(createModule);
app.use(updateModule);
app.use(deleteModule);
app.use(getModules);
app.use(getAllModules);
app.use(getAllQuiz);
app.use(getSingleModule);
app.use(messageRoutes);


const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for user online
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
  });

  // Listen for messages
  socket.on('sendMessage', async (data) => {

    console.log(`Received message from ${data.senderId} to ${data.recipientId}`);
    console.log('Message content:', data.content);


    try {
      // Save message to database
      const newMessage = new Message({
        sender: data.senderId,
        recipient: data.recipientId,
        content: data.content
      });
      await newMessage.save();

      // After saving to DB
      console.log(`Saved message ID: ${newMessage._id}`);

      // Emit to recipient if online
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        console.log(`Sending to recipient socket: ${recipientSocketId}`);

        io.to(recipientSocketId).emit('receiveMessage', newMessage);
      } else {
        console.log('Recipient is offline');

      }

      // Emit back to sender for confirmation
      socket.emit('messageSent', newMessage);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from online users
    Array.from(onlineUsers.entries()).forEach(([userId, sockId]) => {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
      }
    });
  });
});

// Test Route
app.get("/", (req, res) => {
  res.render("status", {
    serverStatus: "✅ Running",
    mongoStatus: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Not Connected"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});