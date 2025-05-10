const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel');
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require('./passport')

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
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));



app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/signup'
  }),
  (req, res) => {
    const user = req.user;
    const userData = {
      name: user.name,
      email: user.email,
      role: user.role || 'developer',
      id: user._id
    };

    const encoded = encodeURIComponent(JSON.stringify(userData));
    res.redirect(`http://localhost:5173?user=${encoded}`);
  }
);


app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000/');
  });
});

app.get('/auth/google', (req, res) => {
  res.send(req.user);
});

// Import routes 

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use('/api/payments', paymentRoutes);


// Import routes

const getAll = require("./routes/getAll");
const signupRoute = require("./routes/singup");
const loginRoute = require("./routes/login");
const deleteUser = require("./routes/deleteUser");
const getAllUser = require("./routes/getAllUser");
const updateUser = require("./routes/updateUser");
const getSingleuser = require("./routes/getSingleUser");
const updatePassword = require("./routes/updatePassword");
const sendRequests = require("./routes/sendRequest");
const reqestss = require("./routes/requests");
const handleRequests = require("./routes/handleRequest");
const hasNotifications = require("./routes/notifications");
const unreadMessagess = require("./routes/unreadMessages");
const readUnread = require("./routes/readUndreadNotify");

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
const aiResponse = require("./routes/getAIResponse")
const groupRoutes = require("./routes/groupRoutes") // New route for groups

// User
app.use(getAll);
app.use(signupRoute);
app.use(loginRoute);
app.use(deleteUser);
app.use(getAllUser);
app.use(updateUser);
app.use(getSingleuser);
app.use(updatePassword);
app.use(sendRequests);
app.use(reqestss);
app.use(handleRequests);
app.use(hasNotifications);
app.use(unreadMessagess);
app.use(readUnread);
app.use(aiResponse);

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
app.use(groupRoutes); // Add group routes

const onlineUsers = new Map();
const userGroups = new Map(); // Store user group memberships

// Socket.io
io.on('connection', (socket) => {
  let currentUserId = null;

  socket.on('userOnline', (userId) => {
    currentUserId = userId;
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle regular direct messages
  socket.on('sendMessage', async (data) => {
    try {
      // If it's a group message
      if (data.groupId) {
        // Handle as a normal message but include group information
        const newMessage = new Message({
          sender: data.senderId,
          recipient: data.recipientId,
          content: data.content,
          groupId: data.groupId,
          senderName: data.senderName || "Unknown"
        });
        await newMessage.save();

        const recipientSocketId = onlineUsers.get(data.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', newMessage);
        }

        socket.emit('messageSent', newMessage);
      } else {
        // Regular direct message
        const newMessage = new Message({
          sender: data.senderId,
          recipient: data.recipientId,
          content: data.content
        });
        await newMessage.save();

        const recipientSocketId = onlineUsers.get(data.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', newMessage);
        }

        socket.emit('messageSent', newMessage);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle group messages
  socket.on('sendGroupMessage', async (data) => {
    try {
      // Broadcast to everyone in the group (who is online)
      // For a proper implementation, we would fetch group members from DB
      // Here we are relying on client to send to individual members

      // Emit to everyone except sender
      socket.broadcast.emit('receiveGroupMessage', {
        _id: new mongoose.Types.ObjectId().toString(),
        sender: data.senderId,
        senderName: data.senderName,
        groupId: data.groupId,
        content: data.content,
        createdAt: new Date()
      });

      socket.emit('groupMessageSent', {
        success: true,
        groupId: data.groupId
      });
    } catch (error) {
      console.error('Error handling group message:', error);
      socket.emit('groupMessageError', { error: error.message });
    }
  });

  // Join a group chat room
  socket.on('joinGroup', (groupId) => {
    socket.join(`group:${groupId}`);
    console.log(`User ${currentUserId} joined group ${groupId}`);
  });

  // Leave a group chat room
  socket.on('leaveGroup', (groupId) => {
    socket.leave(`group:${groupId}`);
    console.log(`User ${currentUserId} left group ${groupId}`);
  });

  socket.on('disconnect', () => {
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      console.log(`User ${currentUserId} disconnected`);
    }
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