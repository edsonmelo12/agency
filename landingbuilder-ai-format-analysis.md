# landingbuilder-ai format analysis

## Goal
Understand how the previous `landingbuilder-ai` project encoded the desired aspect ratio/format when sending requests to the Gemini image model so we can replicate it in the current Studio module.

## Tasks
- [ ] Task 1: Open `landingbuilder-ai` sources (App.tsx, services, etc.) and locate the code that builds the Gemini payload, noting where aspect ratio labels (9:16, 16:9, etc.) are appended. → Verify: describe file/line references and payload structure.
- [ ] Task 2: Compare the current Studio module payload builder (likely in `services/geminiService.ts` or similar) to see what parameters we currently send and how format values are derived. → Verify: summarize differences and identify missing format metadata.
- [ ] Task 3: Identify where the Studio UI exposes format labels and trace how the selection value flows into the payload (component, hook, state). → Verify: document component properties or functions involved.
- [ ] Task 4: Note any constraints or previous fixes (e.g., custom format labels, `Preservar Produto`) that should be considered when re-syncing format handling. → Verify: list any toggles/flags with their expected behavior.

## Done When
- [ ] We have a clear map of how format metadata was previously set and how the current code diverges, supporting the next implementation steps.
