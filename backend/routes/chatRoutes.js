const express = require("express");

const {
  createConversation,
  getConversations,
  getConversation,
  addMessage,
  deleteConversation,
} = require("../controllers/chatController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create new conversation
router.post("/", protect, createConversation);

// Get all conversations
router.get("/", protect, getConversations);

// Get single conversation with messages
router.get("/:conversationId", protect, getConversation);

// Add user message
router.post("/message", protect, addMessage);

// Delete conversation
router.delete("/:conversationId", protect, deleteConversation);

module.exports = router;