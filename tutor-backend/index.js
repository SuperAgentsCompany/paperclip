const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMMA_API_ENDPOINT = process.env.GEMMA_API_ENDPOINT || "https://gemma4-4b-762452591869.us-central1.run.app/v1/chat/completions";

let userStats = {
  progress: 15,
  masteryLevel: "N5",
  wordsLearned: 120,
  lessonsCompleted: 5,
  streakDays: 3
};

app.post('/api/chat', async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Update stats slightly on each message
  userStats.wordsLearned += Math.floor(Math.random() * 3);
  if (userStats.progress < 100) {
    userStats.progress += 1;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(GEMMA_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemma4-4b",
        messages: [
          { 
            role: "system", 
            content: `You are a minimalist, calm, and expert English-Japanese language teacher. Your style is inspired by Muji and Scandinavian design: clean, simple, and high-quality.
    ${context ? `Current focus: ${context}.` : ''}
    
    Guidelines:
    1. Internal Monologue: Wrap your pedagogical reasoning in <thought> tags.
    2. Minimalist Response: Provide an extremely concise, elegant response (MAX 2-3 short sentences). 
    3. Calm Tone: Use polite Japanese (Teineigo) and a supportive, serene English tone.
    4. Clarity: Focus on ONE key concept. Avoid lists, tables, or complex formatting unless vital.
    5. Particle Highlighting: Bold Japanese particles (e.g., **は**, **が**, **を**).
    6. Zen Ending: End with a single, focused question to guide the student's next step. Always use the full-width Japanese question mark "？" for this follow-up question.
    7. Language Balance: Ensure consistent English explanations when the user asks queries in English.
    
    Avoid all pedagogical fluff and excessive praise. Let the clarity of the instruction speak for itself.`
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return res.status(500).json({ error: 'Failed to communicate with Gemma API' });
    }

    const data = await response.json();
    const message = data.choices[0].message;
    
    let fullContent = message.content || "";
    let reasoningArray = [];

    // Extract all thought blocks (handle unclosed tags at the end of content)
    const thoughtRegex = /<thought>([\s\S]*?)(?:<\/thought>|$)/g;
    let match;
    while ((match = thoughtRegex.exec(fullContent)) !== null) {
      if (match[1].trim()) {
        reasoningArray.push(match[1].trim());
      }
    }

    // Clean content by removing all thought blocks
    const cleanContent = fullContent.replace(thoughtRegex, '').trim();
    const combinedReasoning = reasoningArray.join('\n\n---\n\n');

    res.json({
      content: cleanContent,
      reasoning: combinedReasoning || message.reasoning || ""
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/stats', (req, res) => {
  res.json({
    ...userStats,
    lastUpdate: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
