---
type: "query"
date: "2026-04-29T11:34:41.624490+00:00"
question: "What are the surprising connections in FitnessApp?"
contributor: "graphify"
source_nodes: ["finish", "setSetting", "loadDashboard", "getChatHistory", "getWorkoutsForExercise"]
---

# Q: What are the surprising connections in FitnessApp?

## Answer

finish() in onboarding.tsx calls setSetting() in database.ts — onboarding writes settings directly to SQLite. save() in tabs/index.tsx also calls setSetting() via DB. loadDashboard() in tracker.tsx pulls both getSetting() and getRecentWorkouts() on every load. loadHistory() in AIChat.tsx persists chat to SQLite via getChatHistory(). getWorkoutsForExercise() bridges AI Coaching to Workout DB — AI reads raw workout history to generate progression suggestions.

## Source Nodes

- finish
- setSetting
- loadDashboard
- getChatHistory
- getWorkoutsForExercise