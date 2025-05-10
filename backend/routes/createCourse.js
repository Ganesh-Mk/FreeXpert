const express = require("express");
const multer = require("multer");
const uploadImage = require("../utils/uploadImage");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Quiz = require("../models/quizModel");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/createCourse", upload.single("thumbnail"), async (req, res) => {
  try {
    let { title, description, userId, quizzes, isPremium, price } = req.body;
    const thumbnailFile = req.file;

    // Handle case when quizzes is not provided
    quizzes = quizzes ? JSON.parse(quizzes) : [];

    // Parse isPremium from string to boolean
    isPremium = isPremium === "true" || isPremium === true;

    // Parse price from string to number
    price = price ? parseFloat(price) : 9.99;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let thumbnailUrl = "";
    if (thumbnailFile) {
      thumbnailUrl = await uploadImage(thumbnailFile.buffer, "course");
    }

    let quizIds = [];
    if (quizzes && Array.isArray(quizzes)) {
      const quizDocs = await Quiz.insertMany(quizzes);
      quizIds = quizDocs.map(quiz => quiz._id);
    }

    const newCourse = new Course({
      title,
      description,
      thumbnail: thumbnailUrl,
      role: user.role,
      userId,
      quizzes: quizIds,
      isPremium,
      price
    });

    const savedCourse = await newCourse.save();
    await User.findByIdAndUpdate(userId, { $push: { courses: savedCourse._id } });

    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;