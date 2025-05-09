const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      unique: true,
    },
    color: {
      type: String,
      default: "#3B82F6", // Optional: Default to blue if not provided
    },
    channels: [
      {
        type: String,
        trim: true,
        unique: true,
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    userId: {
      type: String, 
      ref: "User",
      required: true, // Make it required if a user is always associated with the workspace
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;
