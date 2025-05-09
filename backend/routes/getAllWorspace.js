// routes/workspaceRoutes.js

const express = require('express');
const router = express.Router();
const Workspace = require('../models/workspaceModel');

// POST /api/workspaces/findWorkspaces
router.get('/findWorkspaces', async (req, res) => {

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const workspaces = await Workspace.find({ userId: userId });

    if (!workspaces.length) {
      return res.status(404).json({ message: 'No workspaces found for this user' });
    }

    res.status(200).json({ message: 'Workspaces fetched successfully', workspaces });
  } catch (error) {
    console.error("Error in findWorkspaces:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
