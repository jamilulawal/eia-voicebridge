const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("EIA VoiceBridge AI backend is working!");
});

app.post("/ask-ai", async (req, res) => {
  try {
    const { question, documentText } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Please provide a question."
      });
    }

    const prompt = `
You are EIA VoiceBridge, an Environmental Impact Assessment assistant.

Your job is to explain Environmental Impact Assessment documents in simple,
clear language that ordinary community members can understand.

Answer the user's question using the EIA document provided below.

If the document does not contain enough information to answer the question,
say clearly that the information is not available in the provided document.
Do not invent facts.

The user may ask in English or Hausa. Answer in the same language as the user.

USER QUESTION:
${question}

EIA DOCUMENT:
${documentText || "No document text provided."}
`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI request failed. Please check the server and API key."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EIA VoiceBridge server is running on port ${PORT}`);
});
