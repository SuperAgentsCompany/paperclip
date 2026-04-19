const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMMA_API_ENDPOINT = "https://gemma4-4b-762452591869.us-central1.run.app/v1/chat/completions";

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
            content: `You are an expert English-Japanese language teacher. Your goal is to help the student learn Japanese effectively.
${context ? `The current focus of the lesson is: ${context}.` : ''}
For every response:
1. First, think about the pedagogical approach, grammar rules, and cultural context. Wrap your internal monologue in <thought> tags.
2. Provide a concise, helpful response. Focus on teaching one or two key concepts.
3. Use Markdown for formatting. Bold Japanese particles (e.g., **は**, **が**, **を**).
4. Always end with a short follow-up question to check understanding or encourage practice.
Keep your final response (outside <thought> tags) focused and pedagogical. Avoid being overly verbose.`
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return res.status(500).json({ error: 'Failed to communicate with Gemma API' });
    }

    const data = await response.json();
    const message = data.choices[0].message;
    
    let content = message.content || "";
    let reasoning = message.reasoning || "";

    // Extract thoughts from content if present
    if (content.includes('<thought>')) {
      const thoughtMatch = content.match(/<thought>([\s\S]*?)<\/thought>/);
      if (thoughtMatch) {
        reasoning = thoughtMatch[1].trim();
        content = content.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();
      }
    }

    res.json({
      content: content,
      reasoning: reasoning
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
