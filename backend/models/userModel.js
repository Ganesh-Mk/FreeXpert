const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['admin', 'developer', 'user'],
    required: [true, 'Role is required']
  },
  about: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
  },
  social: {
    twitter: String,
    instagram: String,
    linkedin: String,
    github: String
  },
  modulesCompleted: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  badges: {
    type: Number,
    default: 0
  },
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  requestsCame: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  workspaces: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Remove password when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
