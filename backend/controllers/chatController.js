const {
  generateAIResponse,
} = require("../services/aiService");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// =====================================
// CREATE NEW CONVERSATION
// =====================================
const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      user: req.user._id,
      title: "New Chat",
    });

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: {
        conversation,
      },
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating conversation",
    });
  }
};

// =====================================
// GET ALL USER CONVERSATIONS
// =====================================
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      user: req.user._id,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        conversations,
      },
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching conversations",
    });
  }
};

// =====================================
// GET SINGLE CONVERSATION
// =====================================
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversation._id,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching conversation",
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { conversationId, content, imageUrl } = req.body;

    const cleanContent = content?.trim() || "";

    if (
      !conversationId ||
      (!cleanContent && !imageUrl)
    ) {
      return res.status(400).json({
        success: false,
        message: "Message text or image is required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Save user's message
    const userMessage = await Message.create({
      conversation: conversationId,
      role: "user",
      content: cleanContent,
      imageUrl: imageUrl || "",
    });

    // Get previous messages
    const previousMessages = await Message.find({
      conversation: conversationId,
    })
      .sort({ createdAt: 1 })
      .select("role content imageUrl -_id");

    // Convert messages into Groq format
    const aiMessages = previousMessages.map(
      (message) => {
        // Image message
        if (
          message.role === "user" &&
          message.imageUrl
        ) {
          return {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  message.content ||
                  "Please analyze this image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: message.imageUrl,
                },
              },
            ],
          };
        }

        // Normal text message
        return {
          role: message.role,
          content: message.content,
        };
      }
    );

    // Ask AI
    const aiResponse =
      await generateAIResponse(aiMessages);

    // Save AI response
    const assistantMessage =
      await Message.create({
        conversation: conversationId,
        role: "assistant",
        content: aiResponse,
      });

    conversation.updatedAt = new Date();

    if (
      conversation.title === "New Chat" &&
      cleanContent
    ) {
      conversation.title =
        cleanContent.substring(0, 50);
    }

    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error(
      "Add Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while processing message",
    });
  }
};
// =====================================
// DELETE CONVERSATION
// =====================================
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Message.deleteMany({
      conversation: conversationId,
    });

    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting conversation",
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  addMessage,
  deleteConversation,
};