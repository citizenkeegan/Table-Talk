import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import ChatMessage, { Message } from './ChatMessage';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../constants/DesignTokens';
import ClayButton from './ui/ClayButton';

interface ChatThreadProps {
  sessionId: string;
  userId: string | null;
  userName: string;
}

export default function ChatThread({ sessionId, userId, userName }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`public:messages:session_id=eq.${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [sessionId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages').select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId) return;
    const content = inputText.trim();
    setInputText('');
    setIsUrgent(false);
    try {
      const { error } = await supabase.from('messages').insert([{
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
        content,
        is_urgent: isUrgent,
      }]);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Logistics Chat</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatMessage message={item} isOwnMessage={item.user_id === userId} />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No messages yet. Be the first to say something!</Text>
        }
      />

      {/* Input row */}
      <View style={styles.inputContainer}>
        <View style={styles.urgentToggle}>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: Colors.mist, true: Colors.urgentBg }}
            thumbColor={isUrgent ? Colors.urgent : Colors.whiteClay}
          />
          <Text style={[
            styles.urgentLabel,
            { color: isUrgent ? Colors.urgent : Colors.ink, opacity: isUrgent ? 1 : 0.5 }
          ]}>
            Urgent
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Discuss snacks, delays..."
          placeholderTextColor={Colors.periwinkleLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <ClayButton
          label="Send"
          variant="primary"
          onPress={handleSendMessage}
          disabled={!inputText.trim() || !userId}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Spacing.lg,
    borderRadius: Radius.card,         // ✅ Fixed: was 8px
    borderWidth: 1.5,
    borderColor: Colors.mist,          // ✅ Fixed: was hardcoded '#E6E8EB'
    overflow: 'hidden',
    height: 400,
    backgroundColor: Colors.whiteClay, // ✅ Fixed: now using token
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mist,    // ✅ Fixed: token
    backgroundColor: Colors.cream,
  },
  headerText: {
    fontFamily: FontFamily.bold,       // ✅ Fixed: Plus Jakarta Sans
    fontSize: FontSize.subheading,
    color: Colors.ink,
  },
  messageList: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.mist,       // ✅ Fixed: token
    backgroundColor: Colors.whiteClay,
    gap: Spacing.xs,
  },
  urgentToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  urgentLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.md,           // ✅ Fixed: was 20 (still ok, ≥20)
    borderColor: Colors.mist,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    maxHeight: 100,
    minHeight: 44,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    backgroundColor: Colors.cream,
  },
});
