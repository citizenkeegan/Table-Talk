import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_urgent: boolean;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const timeString = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
      {!isOwnMessage && (
        <Text style={[styles.nameText, { color: theme.icon }]}>{message.user_name}</Text>
      )}
      
      <View style={[
        styles.bubble, 
        isOwnMessage ? { backgroundColor: theme.tint } : { backgroundColor: theme.card },
        message.is_urgent && styles.urgentBubble
      ]}>
        {message.is_urgent && (
          <View style={styles.urgentHeader}>
            <Text style={styles.urgentHeaderText}>⚠️ URGENT</Text>
          </View>
        )}
        
        <Text style={[
          styles.messageText, 
          isOwnMessage ? { color: '#fff' } : { color: theme.text },
          message.is_urgent && { color: '#991b1b', fontWeight: '500' }
        ]}>
          {message.content}
        </Text>
      </View>
      
      <Text style={[styles.timeText, { color: theme.icon }]}>{timeString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  nameText: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  urgentBubble: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  urgentHeader: {
    marginBottom: 4,
  },
  urgentHeaderText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    marginHorizontal: 4,
  }
});
