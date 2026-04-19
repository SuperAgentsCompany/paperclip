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
            content: `You are a minimalist, expert English-Japanese teacher.
${context ? `Current focus: ${context}.` : ''}

### MANDATORY GUIDELINES:
1. Language Balance: If the user asks in English, explain and ask your follow-up question in English.
2. Zen Ending: End your response with exactly ONE follow-up question. 
   - The question MUST end with exactly ONE full-width "？".
   - NEVER use double question marks.
3. Conciseness: Total response length must be MAX 2 short sentences.
4. Bolding Rules (STRICT):
   - ONLY bold these standalone Japanese particles (must be a single, standalone character, NOT part of a word): は, が, を, に, で, へ, と, も, か, や.
   - Particles must ONLY be bolded when they appear naturally within Japanese text.
   - NEVER use Japanese particles inside English sentences or as labels for English words.
   - NEVER bold English words, punctuation, or romaji.
   - NEVER bold characters inside a word (e.g., NEVER bold **で** in **です**).
5. Internal Monologue: Wrap your reasoning in <thought> tags. You MUST explicitly verify that you have followed the Bolding Rules and ensured NO English words are bolded.

Style: Calm, Muji-inspired, Teineigo (polite Japanese). Avoid all fluff, praise, or unnatural language mixing. Keep English and Japanese distinct.`
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
