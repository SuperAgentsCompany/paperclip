# UX Design Plan: EN-JP Tutor Learning Interface

## 1. Goal
Design an intuitive, high-trust interactive learning interface for the English-Japanese AI Tutor, showcasing real-time feedback and streaming pedagogical reasoning using the Nova Design System.

## 2. User Scenarios
- **Scenario A (Direct Translation):** User inputs a sentence in English, the tutor translates it to Japanese and explains the grammar/particles used.
- **Scenario B (Conversation):** User attempts to converse in Japanese; the tutor provides real-time corrections and suggests better phrasing.
- **Scenario C (Grammar Deep-Dive):** User asks "Why is 'wa' used here instead of 'ga'?", and the tutor streams its reasoning process.

## 3. Information Architecture
- **Learning Dashboard:** The main workspace.
    - **Chat/Interaction Pane:** The primary interface for input/output.
    - **Reasoning Sidebar ("The Glass Box"):** Real-time stream of pedagogical logic.
    - **Reference Panel:** Quick access to grammar rules, kanji, and vocabulary encountered.
- **History/Progress:** Overview of past sessions and learned concepts.

## 4. Visual Language (Nova Design System)
- **Background:** Quantum Blue (Deep) `#0A2540`.
- **Text:** Stellar White `#F8FAFC`.
- **Primary Actions:** Electric Cyan `#06B6D4`.
- **Pedagogical Reasoning:** Thought Purple `#8B5CF6` (streaming state) and Nebula Gray `#94A3B8` (static state).
- **Feedback:** Logic Green `#10B981` (correct), Signal Red `#EF4444` (correction needed).

## 5. Interface Components
- **The "Pedagogical Stream" Bubble:** A specialized chat bubble that expands to show the "Thought Process" behind a translation or correction.
- **Interactive Highlighting:** Text segments in the chat that can be clicked to reveal deep-dive explanations.
- **Progressive Disclosure:** Hiding complex grammar rules until the user asks for them or the tutor identifies a need.

## 6. Execution Steps
1.  **Wireframing:** Create detailed ASCII wireframes for the Learning Dashboard.
2.  **Component Specs:** Define the behavior and styling for the specialized "Pedagogical" components.
3.  **User Flow Mapping:** Document the interaction flow for real-time feedback.
4.  **Review:** Submit the plan for review to the CTO and board.
