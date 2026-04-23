import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../constants/DesignTokens';
import ClayTag from './ui/ClayTag';

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
  const timeString = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.container, isOwnMessage ? styles.own : styles.other]}>
      {!isOwnMessage && (
        <Text style={styles.name}>{message.user_name}</Text>
      )}

      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
        message.is_urgent && styles.urgentBubble,
      ]}>
        {message.is_urgent && (
          <View style={{ marginBottom: 6 }}>
            <ClayTag label="⚠️ URGENT" color="urgent" />
          </View>
        )}
        <Text style={[
          styles.text,
          isOwnMessage && !message.is_urgent ? { color: Colors.ink } : { color: Colors.ink },
          message.is_urgent && styles.urgentText,
        ]}>
          {message.content}
        </Text>
      </View>

      <Text style={styles.time}>{timeString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  own: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  other: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
    color: Colors.periwinkle,
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  ownBubble: {
    backgroundColor: Colors.sageLight,
    borderColor: Colors.sageDark,
  },
  otherBubble: {
    backgroundColor: Colors.whiteClay,
    borderColor: Colors.mist,
  },
  urgentBubble: {
    backgroundColor: Colors.urgentBg,
    borderColor: Colors.urgent,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: 20,
  },
  urgentText: {
    color: Colors.urgent,
    fontFamily: FontFamily.semibold,
  },
  time: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: Colors.ink,
    opacity: 0.5,
    marginTop: 3,
    marginHorizontal: 4,
  },
});
