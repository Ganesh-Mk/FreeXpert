const express = require("express");
const router = express.Router();
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Friendly, polite, and creative system prompt
const addOnPrompt = `You are Medi-Care, a kind and friendly AI medical assistant. Always respond to user health concerns with compassion, creativity, and encouragement. Your tone should be warm, polite, and easy to understand.

Your goal is to offer helpful suggestions, support, and insights in a natural, conversational format. Respond as if you're talking to a friend who needs medical advice.

Keep your response:
- Simple and easy to follow
- Polite and respectful
- Creative and caring
- Supportive and hopeful

`;

router.post("/getAIResponse", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("Received prompt:", prompt);
    if (!prompt) {
      return res.status(400).json({ error: "User input is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(addOnPrompt + prompt);

    const responseText = result.response.candidates[0].content.parts[0].text;
    console.log("AI response:", responseText);

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      details: error.message,
    });
  }
});

module.exports = router;
