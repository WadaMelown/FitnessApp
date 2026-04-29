# Graph Report - C:\Users\tamir\FitnessApp  (2026-04-29)

## Corpus Check
- 23 files · ~27,331 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 111 nodes · 134 edges · 25 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `getDatabase()` - 18 edges
2. `FitnessApp Icon` - 7 edges
3. `Adaptive Icon Image` - 6 edges
4. `getSetting()` - 5 edges
5. `Expo Framework Favicon` - 5 edges
6. `loadDashboard()` - 4 edges
7. `isSelected()` - 4 edges
8. `getClientAsync()` - 4 edges
9. `getProgressionSuggestion()` - 4 edges
10. `setSetting()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `loadDashboard()` --calls--> `getRecentWorkouts()`  [INFERRED]
  C:\Users\tamir\FitnessApp\app\(tabs)\tracker.tsx → C:\Users\tamir\FitnessApp\lib\database.ts
- `loadDashboard()` --calls--> `getWeeklyVolume()`  [INFERRED]
  C:\Users\tamir\FitnessApp\app\(tabs)\tracker.tsx → C:\Users\tamir\FitnessApp\lib\database.ts
- `loadHistory()` --calls--> `getChatHistory()`  [INFERRED]
  C:\Users\tamir\FitnessApp\components\tracker\AIChat.tsx → C:\Users\tamir\FitnessApp\lib\database.ts
- `handleClear()` --calls--> `clearChatHistory()`  [INFERRED]
  C:\Users\tamir\FitnessApp\components\tracker\AIChat.tsx → C:\Users\tamir\FitnessApp\lib\database.ts
- `handleGetSuggestion()` --calls--> `getWorkoutsForExercise()`  [INFERRED]
  C:\Users\tamir\FitnessApp\components\tracker\ProgressHistory.tsx → C:\Users\tamir\FitnessApp\lib\database.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (18): clearChatHistory(), deleteWorkout(), getAllMeasurements(), getChatHistory(), getDatabase(), getLastWorkoutForExercise(), getLatestMeasurement(), getPersonalBest() (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (8): formatHistory(), getClientAsync(), getProgressionSuggestion(), isAIConfiguredAsync(), sendChatMessage(), getSetting(), handleGetSuggestion(), loadDashboard()

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (3): setSetting(), save(), finish()

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (8): Concentric Circles Motif, Expo Default Icon Template, Fitness Application, FitnessApp Icon, Grid Background, Light Gray Color Scheme, Placeholder App Icon, React Native App

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.48
Nodes (7): Adaptive Icon Image, Android Adaptive Icon Standard, Concentric Circles Visual Motif, Expo React Native Mobile App Project, Fitness App, Placeholder Template Asset, Adaptive Icon Safe Zone Guide

### Community 6 - "Community 6"
Cohesion: 0.53
Nodes (6): Expo (React Native Framework), Expo Framework Favicon, FitnessApp Project, Isometric 3D Block Cube, Monochrome / Black-and-White Icon Style, Floating Sphere / Circle Element

### Community 7 - "Community 7"
Cohesion: 0.7
Nodes (4): isSelected(), muscleFill(), muscleOpacity(), muscleStroke()

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (5): Concentric Circles Motif, Expo Default Splash Template, FitnessApp Mobile Application, Grid Guide Overlay, Splash Screen Image

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): handleClear(), loadHistory()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (3): Fitness Tracker, FitnessApp, Starter App

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **2 isolated node(s):** `Light Gray Color Scheme`, `FitnessApp Mobile Application`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (2 nodes): `App()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `_layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `getScales()`, `AvatarSVG.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `MeasurementsForm.tsx`, `parseNum()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `ExerciseModal.tsx`, `openYoutube()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `RestTimer.tsx`, `adjust()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `babel.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `body-sim.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `_layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `colors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `useTrackerStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDatabase()` connect `Community 0` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `setSetting()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `getSetting()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FitnessApp Icon` (e.g. with `React Native App` and `Fitness Application`) actually correct?**
  _`FitnessApp Icon` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Adaptive Icon Image` (e.g. with `Android Adaptive Icon Standard` and `Expo React Native Mobile App Project`) actually correct?**
  _`Adaptive Icon Image` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getSetting()` (e.g. with `loadDashboard()` and `getClientAsync()`) actually correct?**
  _`getSetting()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Light Gray Color Scheme`, `FitnessApp Mobile Application` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._