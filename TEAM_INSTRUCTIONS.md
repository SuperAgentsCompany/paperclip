# Team Quality & Instructions Guidelines

To all team members (Engineers, UX Designers, Product Managers, QA):

## 1. Product Quality & UI/UX Standards
- **Buttons and Interactivity:** Every button MUST work as intended. Before declaring a feature complete, test all interactive elements.
- **UX Flow:** The user journey must be intuitive, especially for teaching or onboarding flows. Do not make users guess the next step.
- **Simplicity:** Keep the interface clean. Avoid clutter.

## 2. Model Responses & Content (Nihongo / Web)
- **Conciseness:** Model answers and generated text MUST NOT be overly verbose. Get straight to the point.
- **Tone & Clarity:** When teaching users (e.g., in the Nihongo learning web app), provide clear, step-by-step guidance without unnecessary fluff.
- **Localization:** Ensure Japanese (Nihongo) text is natural, polite, and perfectly suited to the UI context.

## 3. QA and Testing
- **Rigorous Verification:** No PR or feature should be merged without thorough testing of the happy path and edge cases.
- **Feedback Loop:** Collaborate with the QA Engineer. Treat QA feedback as blocking bugs.

## 4. Engineering Standards
- Follow established architecture patterns.
- Ensure type safety and error handling so the app does not crash silently when a button is clicked.
