import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import ChatMessage, { Message } from './ChatMessage';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

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
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`public:messages:session_id=eq.${sessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `session_id=eq.${sessionId}` 
      }, (payload) => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId) return;

    const newMessage = {
      session_id: sessionId,
      user_id: userId,
      user_name: userName,
      content: inputText.trim(),
      is_urgent: isUrgent,
    };

    setInputText('');
    setIsUrgent(false);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([newMessage]);
      
      if (error) throw error;
      
      // On mobile, if isUrgent was true, this is where we would trigger 
      // an Expo Push Notification to other session members via a cloud function.
      
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
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>Logistics Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatMessage 
            message={item} 
            isOwnMessage={item.user_id === userId} 
          />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.urgentToggleContainer}>
          <Switch 
            value={isUrgent} 
            onValueChange={setIsUrgent}
            trackColor={{ false: theme.border, true: '#fca5a5' }}
            thumbColor={isUrgent ? '#dc2626' : '#f4f3f4'}
          />
          <Text style={{ color: isUrgent ? '#dc2626' : theme.icon, fontSize: 12, fontWeight: isUrgent ? 'bold' : 'normal' }}>
            Urgent
          </Text>
        </View>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Discuss snacks, delays..."
          placeholderTextColor={theme.icon}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <Button 
          title="Send" 
          onPress={handleSendMessage} 
          disabled={!inputText.trim() || !userId} 
          color={theme.tint}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderRadius: 8,
    overflow: 'hidden',
    height: 400, // Fixed height for MVP embedding
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  urgentToggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    minHeight: 40,
  }
});
