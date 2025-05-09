// routes/workspace.js

const express = require('express');
const router = express.Router();
const Workspace = require('../models/workspaceModel'); // Adjust path as needed

// POST /api/workspaces - Create a new workspace
router.post('/setWorkspaceName', async (req, res) => {
  try {
    const { name, userId, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = new Workspace({ name, userId, color });
    await workspace.save();

    res.status(201).json({ message: 'Workspace created successfully', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
