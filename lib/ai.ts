import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import { WorkoutEntry, getSetting } from './database';

const staticApiKey = Constants.expoConfig?.extra?.anthropicApiKey as string | undefined;

async function getClientAsync(): Promise<Anthropic> {
  const dbKey = await getSetting('anthropicApiKey');
  const key = dbKey?.trim() || staticApiKey;
  if (!key) throw new Error('NO_API_KEY');
  return new Anthropic({ apiKey: key });
}

export async function isAIConfiguredAsync(): Promise<boolean> {
  if (staticApiKey) return true;
  const dbKey = await getSetting('anthropicApiKey');
  return !!(dbKey && dbKey.trim());
}

const SYSTEM_PROMPT = `You are FitForge AI, a knowledgeable and encouraging personal fitness coach built into the FitForge app.

Your expertise covers:
- Progressive overload principles and periodisation
- Exercise technique and form cues
- Workout programming and split design
- Recovery and injury prevention
- Nutrition basics as they relate to training

When given workout history, you analyse trends such as:
- Whether weight/reps are stagnating (time to increase load)
- Whether the user is overtraining a muscle group
- Volume and frequency patterns
- Consistent progression vs plateaus

Always give specific, actionable advice. Be encouraging but realistic. Keep responses concise and practical — this is a mobile app, not an essay.

Format responses with clear structure when listing recommendations. Use numbers for steps/progressions.`;

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: AIMessage[],
  workoutHistory: WorkoutEntry[]
): Promise<string> {
  const ai = await getClientAsync();

  const historyContext = workoutHistory.length > 0
    ? `\n\nCurrent workout history (last 30 sessions):\n${formatHistory(workoutHistory)}`
    : '';

  const systemWithContext = SYSTEM_PROMPT + historyContext;

  const response = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemWithContext,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from AI');
  return block.text;
}

export async function getProgressionSuggestion(
  exerciseName: string,
  recentSessions: WorkoutEntry[]
): Promise<string> {
  if (recentSessions.length === 0) {
    return `No history found for ${exerciseName}. Log your first session and I'll start tracking your progression!`;
  }

  const ai = await getClientAsync();
  const historyText = formatHistory(recentSessions);

  const response = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyse this workout history for "${exerciseName}" and give me a short progression recommendation for my next session. Should I increase weight, reps, sets, or maintain? Be specific.\n\nHistory:\n${historyText}`,
    }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

function formatHistory(history: WorkoutEntry[]): string {
  return history
    .slice(0, 20)
    .map(w => `${w.date} | ${w.exerciseName} | ${w.sets}×${w.reps} @ ${w.weight}${w.weightUnit}`)
    .join('\n');
}
