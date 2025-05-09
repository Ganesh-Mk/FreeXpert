// routes/workspace.js

const express = require('express');
const router = express.Router();
const Workspace = require('../models/workspaceModel'); // Adjust path if needed

// POST /api/workspaces/channel - Add a channel by workspace ID
router.post('/setWorkspaceChannel', async (req, res) => {
  try {
    const { workspaceId, channel } = req.body;

    if (!workspaceId || !workspaceId.trim()) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    if (!channel || !channel.trim()) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Find workspace by its ID
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Prevent duplicate channels
    if (workspace.channels.includes(channel)) {
      return res.status(400).json({ message: 'Channel already exists in this workspace' });
    }

    // Add the new channel to the channels array
    workspace.channels.push(channel);
    await workspace.save();

    res.status(200).json({ message: 'Channel added successfully', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
    