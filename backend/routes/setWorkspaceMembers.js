    // routes/workspace.js

const express = require('express');
const router = express.Router();
const Workspace = require('../models/workspaceModel'); // Adjust path if needed

// POST /api/workspaces/channel - Add a channel by workspace name
router.post('/setWorkspaceMember', async (req, res) => {
  try {
    const { workspaceName, member } = req.body;

    if (!workspaceName || !workspaceName.trim()) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    if (!member || !member.trim()) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    const workspace = await Workspace.findOne({ name: workspaceName.trim() });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    workspace.members.push(member);
    await workspace.save();

    res.status(200).json({ message: 'Member added successfully', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
