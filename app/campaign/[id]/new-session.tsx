import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../../constants/DesignTokens';
import ClayCard from '../../../components/ui/ClayCard';
import ClayButton from '../../../components/ui/ClayButton';
import ClayTag from '../../../components/ui/ClayTag';
import { createUTCDate } from '../../../utils/dateFormatting';

export default function NewSessionScreen() {
  const { id: campaignId } = useLocalSearchParams();
  const [sessionTitle, setSessionTitle] = useState('');
  const [newDateStr, setNewDateStr] = useState('');
  const [proposedDates, setProposedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddDate = () => {
    try {
      const parsedDate = new Date(newDateStr);
      if (isNaN(parsedDate.getTime())) throw new Error('Invalid date');
      setProposedDates([...proposedDates, createUTCDate(parsedDate)]);
      setNewDateStr('');
    } catch {
      Alert.alert('Invalid Date', 'Please use format: YYYY-MM-DDTHH:MM');
    }
  };

  const handleCreateSession = async () => {
    if (!sessionTitle.trim() || proposedDates.length === 0) {
      Alert.alert('Missing Info', 'Please add a title and at least one proposed date.');
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{ campaign_id: campaignId, title: sessionTitle, status: 'polling' }])
        .select().single();
      if (sessionError) throw sessionError;

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(proposedDates.map(date => ({ session_id: sessionData.id, proposed_time: date })));
      if (optionsError) throw optionsError;

      Alert.alert('✅ Session Created', 'Players can now vote on their preferred date.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Propose Session</Text>
      <Text style={styles.subtitle}>Add a title and propose up to 5 dates for your players to vote on.</Text>

      {/* Title input */}
      <ClayCard variant="base" style={styles.section}>
        <Text style={styles.label}>Session Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Dragon's Lair"
          placeholderTextColor={Colors.periwinkleLight}
          value={sessionTitle}
          onChangeText={setSessionTitle}
        />
      </ClayCard>

      {/* Date inputs */}
      <ClayCard variant="base" style={styles.section}>
        <Text style={styles.label}>Proposed Dates</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="2026-05-01T19:00"
            placeholderTextColor={Colors.periwinkleLight}
            value={newDateStr}
            onChangeText={setNewDateStr}
          />
          <ClayButton label="Add" variant="primary" onPress={handleAddDate} />
        </View>

        {proposedDates.length > 0 && (
          <View style={styles.dateList}>
            {proposedDates.map((date, i) => (
              <View key={i} style={styles.dateItem}>
                <Text style={styles.dateText}>{new Date(date).toLocaleString()}</Text>
                <ClayTag label="Option" color="periwinkle" />
              </View>
            ))}
          </View>
        )}
      </ClayCard>

      {/* Submit */}
      <ClayButton
        label="Create Session Poll"
        variant="primary"
        onPress={handleCreateSession}
        loading={loading}
        disabled={!sessionTitle.trim() || proposedDates.length === 0}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    opacity: 0.65,
    lineHeight: 22,
  },
  section: {},
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.subheading,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.mist,
    padding: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  dateList: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mist,
  },
  dateText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
});
