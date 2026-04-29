---
type: "query"
date: "2026-04-29T11:34:41.150271+00:00"
question: "Why does getDatabase() have 16 edges and bridge so many communities?"
contributor: "graphify"
source_nodes: ["getDatabase", "Workout & Measurements DB", "AI Chat Interface", "Onboarding & Settings"]
---

# Q: Why does getDatabase() have 16 edges and bridge so many communities?

## Answer

getDatabase() in lib/database.ts is the single SQLite connection factory for the entire app. Every feature that needs persistence calls it directly with no abstraction layer. Workout tracking, AI chat history, user settings, measurements, onboarding state, and progression history all couple directly to database.ts. Changing the DB schema or switching storage backends requires touching every feature. Potential improvement: route DB access through Zustand stores or a service layer.

## Source Nodes

- getDatabase
- Workout & Measurements DB
- AI Chat Interface
- Onboarding & Settings