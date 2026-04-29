import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { sendChatMessage, AIMessage, isAIConfiguredAsync } from '@/lib/ai';
import { getRecentWorkouts, getChatHistory, insertChatMessage, clearChatHistory } from '@/lib/database';

export default function AIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadHistory();
    isAIConfiguredAsync().then(setAiReady);
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(40);
      setMessages(history);
    } finally {
      setInitialised(true);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!aiReady) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI coach not configured. Add your Anthropic API key in Settings (gear icon on the Muscles tab) to enable it.',
      }]);
      return;
    }

    const userMsg: AIMessage = { role: 'user', content: text };
    setInput('');
    setLoading(true);

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    scrollToBottom();

    try {
      await insertChatMessage(userMsg);
      const workoutHistory = await getRecentWorkouts(30);
      const reply = await sendChatMessage(newMessages, workoutHistory);
      const assistantMsg: AIMessage = { role: 'assistant', content: reply };
      await insertChatMessage(assistantMsg);
      setMessages(prev => [...prev, assistantMsg]);
      scrollToBottom();
    } catch (e: any) {
      const errMsg: AIMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't reach the AI right now. ${e?.message ?? 'Please try again.'}`,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, aiReady]);

  const handleClear = async () => {
    await clearChatHistory();
    setMessages([]);
  };

  if (!initialised) {
    return <ActivityIndicator color={Colors.accent} style={{ flex: 1, marginTop: 60 }} />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {/* Header actions */}
      <View style={styles.chatHeader}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.accent} />
          <Text style={styles.aiBadgeText}>FitForge AI Coach</Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={16} color={Colors.subtext} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Your AI Fitness Coach</Text>
            <Text style={styles.emptyText}>
              Ask me anything about your training. I can analyse your workout history, suggest progressions, help with form, and build you a plan.
            </Text>
            <View style={styles.suggestionList}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.suggestion} onPress={() => setInput(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color={Colors.accent} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach anything..."
          placeholderTextColor={Colors.muted}
          multiline
          maxLength={500}
          selectionColor={Colors.accent}
          onSubmitEditing={send}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={Colors.accent} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const SUGGESTIONS = [
  'How should I progress on bench press?',
  'Am I overtraining any muscle groups?',
  'What should I focus on this week?',
  'Suggest a full body workout plan',
];

const styles = StyleSheet.create({
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.accentLight },
  clearBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.subtext, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  suggestionList: { width: '100%', gap: 8 },
  suggestion: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: { fontSize: 14, color: Colors.text },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
    minWidth: 60,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  userBubbleText: { color: Colors.white },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
