const express = require('express');
const router = express.Router();
const Group = require('../models/groupModel');
const GroupMessage = require('../models/groupMessageModel');
const mongoose = require('mongoose');

// Create a new group
router.post('/groups', async (req, res) => {
  try {
    const { name, creatorId, members } = req.body;

    if (!name || !creatorId) {
      return res.status(400).json({
        success: false,
        message: 'Group name and creator ID are required'
      });
    }

    // Ensure creator is included in members
    const allMembers = Array.from(new Set([...members, creatorId]));

    const group = new Group({
      name,
      creator: creatorId,
      members: allMembers
    });

    await group.save();

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message
    });
  }
});

// Get all groups for a user
router.get('/user/:userId/groups', async (req, res) => {
  try {
    const { userId } = req.params;

    const groups = await Group.find({
      members: userId
    }).populate('members', 'name email image');

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message
    });
  }
});

// Get a specific group by ID
router.get('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members', 'name email image')
      .populate('creator', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group',
      error: error.message
    });
  }
});

// Add a member to a group
router.post('/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is already a member
    if (group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    group.members.push(memberId);
    group.updatedAt = Date.now();
    await group.save();

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
});

// Remove a member from a group
router.delete('/groups/:groupId/members/:memberId', async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member
    if (!group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Cannot remove the creator
    if (group.creator.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the group creator'
      });
    }

    group.members = group.members.filter(member => member.toString() !== memberId);
    group.updatedAt = Date.now();
    await group.save();

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
});

// Send a message to a group
router.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, content, senderName } = req.body;

    if (!senderId || !content || !senderName) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, sender name, and content are required'
      });
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if sender is a member of the group
    if (!group.members.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'Sender is not a member of this group'
      });
    }

    const message = new GroupMessage({
      groupId,
      sender: senderId,
      senderName,
      content
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get messages for a group
router.get('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before } = req.query;

    // Create query
    const query = { groupId };

    // Add pagination if 'before' is provided
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await GroupMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name email image');

    // Return in chronological order
    messages.reverse();

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Delete a group (only by creator)
router.delete('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can delete the group'
      });
    }

    // Delete all messages for this group
    await GroupMessage.deleteMany({ groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group',
      error: error.message
    });
  }
});

module.exports = router;