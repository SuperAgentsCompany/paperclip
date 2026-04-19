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
   - ONLY bold these standalone Japanese particles: は, が, を, に, で, へ, と, も, か, や.
   - NEVER bold characters within verb conjugations or polite endings (e.g., NEVER bold **で** or **か** within **ですか**, **でしょう**, **ます**, etc.).
   - Example of correct bolding: ラーメン**が**好きです。
   - NEVER bold English, romaji, or punctuation.
5. Internal Monologue: Wrap your reasoning in <thought> tags. List each particle you identified and confirm it is a standalone grammatical marker and NOT part of a word.

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

    // Post-processing to enforce pedagogical constraints and fix model edge-cases
    
    // 1. Fix multiple question marks and ensure single full-width at the end
    content = content.replace(/[？?]{2,}/g, '？');
    if (content.endsWith('?')) {
      content = content.slice(0, -1) + '？';
    }

    // 2. Remove bolding around English words that are NOT Romaji particles
    content = content.replace(/\*\*([a-zA-Z]+)\*\*/g, (match, word) => {
      const allowed = ['wa', 'ga', 'o', 'wo', 'ni', 'de', 'e', 'to', 'mo', 'ka', 'ya'];
      if (allowed.includes(word.toLowerCase())) {
        return match;
      }
      return word; // Strip bolding
    });

    // 3. Remove bolding around the copula 'desu' / 'deshita' parts
    // More comprehensive copula de-bolding:
    content = content.replace(/\*\*で\*\*(?=す)/g, 'で');
    content = content.replace(/(?<=す)\*\*か\*\*/g, 'か');
    content = content.replace(/(?<=です)\*\*か\*\*/g, 'か');
    content = content.replace(/\*\*で\*\*(?=した)/g, 'で');
    content = content.replace(/(?<=で)\*\*す\*\*/g, 'す');
    content = content.replace(/(?<=で)\*\*した\*\*/g, 'した');
    content = content.replace(/\*\*ですか\*\*/g, 'ですか');
    content = content.replace(/\*\*でした\*\*/g, 'でした');
    content = content.replace(/\*\*です\*\*/g, 'です');
    content = content.replace(/\*\*だ\*\*/g, 'だ');

    // 4. Remove bolding around partial greetings or common words that models mistakenly bold
    content = content.replace(/\*\*こ\*\*ん\*\*に\*\*ち\*\*は\*\*/g, 'こんにちは');
    content = content.replace(/\*\*こ\*\*ん\*\*に\*\*ちは/g, 'こんにちは');
    content = content.replace(/こん\*\*に\*\*ちは/g, 'こんにちは');
    content = content.replace(/こん\*\*に\*\*ち\*\*は\*\*/g, 'こんにちは');
    
    // 5. Remove any remaining ** around single characters that are NOT particles
    content = content.replace(/\*\*([^\*]+)\*\*/g, (match, word) => {
      const validParticles = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'か', 'や', 'wa', 'ga', 'o', 'wo', 'ni', 'de', 'e', 'to', 'mo', 'ka', 'ya'];
      if (validParticles.includes(word.trim().toLowerCase())) {
        return match;
      }
      return word; // Strip bolding from invalid stuff
    });

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
