# User Flow Mapping: Real-time Feedback & Pedagogical Reasoning

## 1. Input Phase
1.  **User starts typing** in the input field.
2.  **Proactive Suggestion:** As the user types Japanese characters, the system provides real-time autocomplete suggestions based on pedagogical relevance.
3.  **Real-time Grammar Check:** If the user makes a common particle error (e.g., using `は` instead of `が`), a subtle `Alert Amber` underline appears.

## 2. Submission Phase
1.  **User submits** the sentence.
2.  **Thinking State:** The "Glass Box" sidebar pulses in `Thought Purple`, streaming the model's reasoning:
    - "Analyzing sentence structure..."
    - "Identifying particles..."
    - "Checking politeness level..."
3.  **Response Generation:** The Tutor's response appears in the chat.

## 3. Deep-Dive Phase
1.  **User hovers** over a particle in the Tutor's response.
2.  **Tooltip appears:** Shows the particle's name and high-level function.
3.  **User clicks** the particle.
4.  **Reference Panel opens:** Left sidebar updates with a "Grammar Lesson" on that particle, including examples and audio.

## 4. Reasoning Review Phase
1.  **User clicks** the "Reasoning" icon on the Tutor's bubble.
2.  **Bubble expands:** Shows the "Pedagogical Reasoning" (e.g., "I chose 'ga' here because 'suki' is a 'ga-adjective' in this context...").
