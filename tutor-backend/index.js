const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

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
    
    Style: Calm, Muji-inspired, Teineigo (polite Japanese). Avoid all fluff, praise, or unnatural language mixing. Keep English and Japanese distinct.
    
    ### OUTPUT STRUCTURE:
    <thought>...</thought>
    [Explanation/Translation here]
    [Single follow-up question here？]`
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
    let cleanContent = fullContent.replace(thoughtRegex, '').trim();

    // Post-processing to enforce pedagogical constraints and fix model edge-cases
    
    // 1. Fix multiple question marks and ensure single full-width at the end
    cleanContent = cleanContent.replace(/[？?]{2,}/g, '？');
    if (cleanContent.endsWith('?')) {
      cleanContent = cleanContent.slice(0, -1) + '？';
    }

    // 2. Remove bolding around English words that are NOT Romaji particles
    cleanContent = cleanContent.replace(/\*\*([a-zA-Z]+)\*\*/g, (match, word) => {
      const allowed = ['wa', 'ga', 'o', 'wo', 'ni', 'de', 'e', 'to', 'mo', 'ka', 'ya'];
      if (allowed.includes(word.toLowerCase())) {
        return match;
      }
      return word; // Strip bolding
    });

    // 3. Remove bolding around the copula 'desu' / 'deshita' parts
    // More comprehensive copula de-bolding:
    cleanContent = cleanContent.replace(/\*\*で\*\*(?=す)/g, 'で');
    cleanContent = cleanContent.replace(/(?<=す)\*\*か\*\*/g, 'か');
    cleanContent = cleanContent.replace(/(?<=です)\*\*か\*\*/g, 'か');
    cleanContent = cleanContent.replace(/\*\*で\*\*(?=した)/g, 'で');
    cleanContent = cleanContent.replace(/(?<=で)\*\*す\*\*/g, 'す');
    cleanContent = cleanContent.replace(/(?<=で)\*\*した\*\*/g, 'した');
    cleanContent = cleanContent.replace(/\*\*ですか\*\*/g, 'ですか');
    cleanContent = cleanContent.replace(/\*\*でした\*\*/g, 'でした');
    cleanContent = cleanContent.replace(/\*\*です\*\*/g, 'です');
    cleanContent = cleanContent.replace(/\*\*だ\*\*/g, 'だ');

    // 4. Remove bolding around partial greetings or common words that models mistakenly bold
    cleanContent = cleanContent.replace(/\*\*こ\*\*ん\*\*に\*\*ち\*\*は\*\*/g, 'こんにちは');
    cleanContent = cleanContent.replace(/\*\*こ\*\*ん\*\*に\*\*ちは/g, 'こんにちは');
    cleanContent = cleanContent.replace(/こん\*\*に\*\*ちは/g, 'こんにちは');
    cleanContent = cleanContent.replace(/こん\*\*に\*\*ち\*\*は\*\*/g, 'こんにちは');
    
    // 5. Remove any remaining ** around single characters that are NOT particles
    // We only keep ** if it wraps EXACTLY one of the allowed particles.
    // If it wraps anything else, we strip the **.
    cleanContent = cleanContent.replace(/\*\*([^\*]+)\*\*/g, (match, word) => {
      const validParticles = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'か', 'や', 'wa', 'ga', 'o', 'wo', 'ni', 'de', 'e', 'to', 'mo', 'ka', 'ya'];
      if (validParticles.includes(word.trim().toLowerCase())) {
        return match;
      }
      return word; // Strip bolding from invalid stuff
    });

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
