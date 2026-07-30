import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "Itqan English" });
});

// Generate Custom Practice Story Route using Gemini AI
app.post("/api/ai/generate-story", async (req, res) => {
  try {
    const { words, topic, level } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if no API key configured
      return res.json({
        title: "A Day in the Life",
        titleAr: "يوم في الحياة",
        story: "Yesterday I went to school with my friend. We had lunch and studied together.",
        storyAr: "بالأمس ذهبت إلى المدرسة مع صديقي. تناولنا الغداء ودرسنا معاً.",
        keyWords: words || ["Yesterday", "school", "friend", "lunch", "studied"]
      });
    }

    const prompt = `You are an English language tutor creating an easy practice story for Arabic native learners at level ${level || 'beginner'}.
Create a simple 2-4 sentence story including these key words: ${(words || []).join(', ')}.
The topic is: ${topic || 'daily routine'}.

Return a JSON object with:
- title: English title (short)
- titleAr: Arabic translation of title
- story: English practice text (simple English grammar, clear sentences)
- storyAr: Arabic translation of story
- keyWords: array of 3-5 target vocabulary words used in the story.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error generating story:", err);
    res.status(500).json({ error: err.message || "Failed to generate story" });
  }
});

// Start Express + Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Itqan English Server running on http://localhost:${PORT}`);
  });
}

startServer();
