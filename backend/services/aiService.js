const OpenAI = require("openai");

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const generateAIResponse = async (messages) => {
  try {
    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",

      messages: [
        {
          role: "system",
          content: `
You are NeuroChat, a helpful AI assistant.

Answer users clearly, accurately and naturally.

Important instructions:
- Give complete answers.
- When an image is provided, actually analyze the image.
- If the user asks what you see, describe the visible objects, people, text, colors, environment and important details.
- If the image contains text, read and explain the visible text when possible.
- Never claim that you cannot see images when an image has been provided.
- Never invent details that are not visible.
- For technical questions, provide practical examples and code when appropriate.
`,
        },
        ...messages,
      ],

      temperature: 0.7,
      max_tokens: 800,
    });

    const content =
      response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "AI returned an empty response"
      );
    }

    return content;
  } catch (error) {
    console.error(
      "Groq AI Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Failed to generate AI response"
    );
  }
};

module.exports = {
  generateAIResponse,
};