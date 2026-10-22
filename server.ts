import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    campus: 'GNIOT Greater Noida',
    geminiConfigured: Boolean(aiClient),
    timestamp: new Date().toISOString(),
  });
});

// 1. AURA Campus Assistant
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!aiClient) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY not configured on server',
    });
  }

  try {
    const systemInstruction = `You are AURA, the official Lost & Found AI Assistant for GNIOT (Greater Noida Institute of Technology), Knowledge Park II, Greater Noida, India.
Guidelines:
1. Always assist students and staff in recovering lost belongings or reporting found property.
2. Direct physical handovers to Main Gate 1 Security Desk or Admin Block Room 104 (Student Welfare). Desk hours: Mon-Sat 8:30 AM to 6:00 PM IST.
3. Remind users that private verification answers (screen wallpaper, distinctive scratches, serial numbers) protect items against false claims.
4. Keep answers friendly, accurate, and concise. Never fabricate official university policies or staff names.`;

    const contents = [
      { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] },
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const replyText = response.text || 'I am currently unable to generate a response. Please check campus help desk records.';
    res.json({ reply: replyText });
  } catch (err: unknown) {
    console.error('Gemini assistant error:', err);
    res.status(500).json({ error: 'Gemini assistant failed to generate reply' });
  }
});

// 2. Visual Image Attribute Extraction
app.post('/api/gemini/analyze-image', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image base64 data required' });
  }

  if (!aiClient) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this college student item for a campus lost and found registry. Return a JSON object with:
- "predicted_category": One of ("Phones & Electronics", "Student ID Cards", "Wallets & Bags", "Keys & Smart Fobs", "Books & Stationery", "Clothing & Accessories", "Bottles & Lunch Boxes", "Calculators & Gear", "Other Belongings")
- "predicted_color": dominant color (e.g. Black, Blue, Silver, Gold, Red)
- "suggested_title": short title (e.g. "Scientific Calculator with cover")
- "keywords": array of 3-5 distinctive words (e.g. ["calculator", "casio", "scientific", "black"])
- "confidence": number between 0.7 and 0.99
Respond ONLY with raw valid JSON, no markdown formatting.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
    const extraction = JSON.parse(text);
    res.json({ extraction });
  } catch (err: unknown) {
    console.error('Gemini image analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze image with Gemini' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GNIOT Lost & Found server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
