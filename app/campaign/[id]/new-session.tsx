import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { createUTCDate } from '../../../utils/dateFormatting';

export default function NewSessionScreen() {
  const { id: campaignId } = useLocalSearchParams();
  const [sessionTitle, setSessionTitle] = useState('');
  // For MVP simplicity, we accept a raw date string or use a native abstraction.
  // In a full build we'd use @react-native-community/datetimepicker
  const [newDateStr, setNewDateStr] = useState(''); 
  const [proposedDates, setProposedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleAddDate = () => {
    try {
      // Basic validation for MVP format (YYYY-MM-DDTHH:MM)
      const parsedDate = new Date(newDateStr);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
      
      const utcString = createUTCDate(parsedDate);
      setProposedDates([...proposedDates, utcString]);
      setNewDateStr('');
    } catch (e) {
      Alert.alert('Invalid Date', 'Please enter a valid date/time format (e.g. 2026-05-01T18:00)');
    }
  };

  const handleCreateSession = async () => {
    if (!sessionTitle.trim() || proposedDates.length === 0) {
      Alert.alert('Error', 'Please provide a title and at least one proposed date.');
      return;
    }

    setLoading(true);
    try {
      // 1. Insert Session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{ campaign_id: campaignId, title: sessionTitle, status: 'polling' }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Insert Proposed Dates (Poll Options)
      const optionsToInsert = proposedDates.map(date => ({
        session_id: sessionData.id,
        proposed_time: date,
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      Alert.alert('Success', 'Session and poll created!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error creating session', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Propose New Session</Text>
      
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Session Title (e.g. Boss Fight)"
        placeholderTextColor={theme.icon}
        value={sessionTitle}
        onChangeText={setSessionTitle}
      />

      <View style={styles.addDateContainer}>
        <TextInput
          style={[styles.input, styles.flexInput, { borderColor: theme.border, color: theme.text }]}
          placeholder="YYYY-MM-DDTHH:MM"
          placeholderTextColor={theme.icon}
          value={newDateStr}
          onChangeText={setNewDateStr}
        />
        <Button title="Add Option" onPress={handleAddDate} color={theme.icon} />
      </View>

      <FlatList
        data={proposedDates}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.dateOption, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.text }}>{new Date(item).toLocaleString()}</Text>
          </View>
        )}
        style={styles.list}
      />

      <Button 
        title="Create Session Poll" 
        onPress={handleCreateSession} 
        disabled={loading} 
        color={theme.primary} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  addDateContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  dateOption: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  }
});
