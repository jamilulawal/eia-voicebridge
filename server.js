const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --------------------------------------------------
// SERVE FRONTEND
// --------------------------------------------------

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EIA VoiceBridge",
    version: "2.2"
  });
});

// --------------------------------------------------
// AI ENDPOINT
// --------------------------------------------------

app.post("/ask-ai", async (req, res) => {
  try {
    // Frontend sends the document as "context"
    const { question, context, language } = req.body;

    // Convert context into documentText
    const documentText =
      typeof context === "string" ? context : "";

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please provide a question."
      });
    }

    const prompt = `
You are EIA VoiceBridge, an Environmental AI Assistant designed to make
environmental knowledge easier to understand and use.

You can help users with:

- Environmental Management
- Environmental Impact Assessment (EIA) and ESIA
- Water, Sanitation and Hygiene (WASH)
- Water quality and water pollution
- Air pollution and air quality
- Waste management and recycling
- Climate change and global warming
- Biodiversity, wildlife and conservation
- Deforestation and land degradation
- Soil and agricultural environmental issues
- Noise pollution
- Industrial pollution
- Environmental health and safety
- Energy and renewable energy
- Sustainability
- Environmental laws, policies and regulations
- Pollution prevention
- Community environmental problems
- Environmental education
- Sustainable development
- Environmental research and innovation

IMPORTANT RULES:

1. Answer the user's question directly and clearly.

2. If the user asks a general environmental question, answer using your
environmental knowledge even when no document is provided.

3. If an environmental document is provided, use the document as an important
source for your answer.

4. Never invent information from the document.

5. If the document does not contain the requested information, clearly say so.

6. Explain difficult environmental concepts using simple language and practical
examples where appropriate.

7. Answer in the same language used by the user.

8. The user's language preference is:
${language || "English"}

9. When appropriate, explain:
   - What the issue is
   - Causes
   - Effects
   - Who or what is affected
   - Possible solutions
   - Prevention or mitigation measures

10. For environmental projects, explain possible environmental risks,
benefits, mitigation measures and sustainability considerations.

11. Do not pretend to be a government authority, lawyer, doctor or certified
environmental consultant.

12. For current laws, regulations, official standards or information that may
change over time, advise the user to verify with the relevant official source.

13. Keep answers practical, understandable and useful.

USER QUESTION:
${question}

ENVIRONMENTAL DOCUMENT:
${
  documentText
    ? documentText
    : "No document was provided. Answer using your environmental knowledge."
}
`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    res.json({
      answer: response.output_text
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI request failed. Please check the server and API key."
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `EIA VoiceBridge Environmental AI is running on port ${PORT}`
  );
});
