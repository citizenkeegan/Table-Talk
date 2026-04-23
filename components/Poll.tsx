import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { formatUTCToLocal } from '../utils/dateFormatting';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../constants/DesignTokens';
import { useLocalCalendar } from '../hooks/useLocalCalendar';
import ClayCard from './ui/ClayCard';
import ClayTag from './ui/ClayTag';

interface PollOption {
  id: string;
  session_id: string;
  proposed_time: string;
  votes: number;
}

interface PollProps {
  sessionId: string;
  userId: string | null;
}

export default function Poll({ sessionId, userId }: PollProps) {
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVoteId, setUserVoteId] = useState<string | null>(null);
  const { loadEventsForDateRange, checkConflict, permissionGranted } = useLocalCalendar();

  useEffect(() => {
    fetchOptions();
    fetchUserVote();

    const subscription = supabase
      .channel(`public:poll_options:session_id=eq.${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'poll_options',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setOptions(current =>
          current.map(opt => opt.id === payload.new.id ? payload.new as PollOption : opt)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [sessionId]);

  useEffect(() => {
    if (options.length > 0 && permissionGranted) {
      const dates = options.map(o => new Date(o.proposed_time).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates) + 24 * 60 * 60 * 1000);
      loadEventsForDateRange(minDate, maxDate);
    }
  }, [options.length, permissionGranted]);

  const fetchOptions = async () => {
    const { data } = await supabase
      .from('poll_options').select('*').eq('session_id', sessionId)
      .order('proposed_time', { ascending: true });
    if (data) setOptions(data);
  };

  const fetchUserVote = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('votes').select('option_id')
      .eq('session_id', sessionId).eq('user_id', userId).single();
    if (data) setUserVoteId(data.option_id);
  };

  const handleVote = async (optionId: string) => {
    if (!userId) return;
    const previous = userVoteId;
    setUserVoteId(optionId);
    try {
      const { error } = await supabase.from('votes').upsert(
        { session_id: sessionId, user_id: userId, option_id: optionId },
        { onConflict: 'session_id,user_id' }
      );
      if (error) throw error;
    } catch (e) {
      console.error(e);
      setUserVoteId(previous);
    }
  };

  const maxVotes = Math.max(...options.map(o => o.votes || 0), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vote on a Date</Text>
      {options.map(option => {
        const isSelected = userVoteId === option.id;
        const conflict = checkConflict(option.proposed_time);
        const votePercent = ((option.votes || 0) / maxVotes) * 100;

        return (
          <TouchableOpacity key={option.id} onPress={() => handleVote(option.id)} activeOpacity={0.85}>
            <View style={[
              styles.optionCard,
              isSelected && styles.selectedCard,
              conflict ? styles.conflictCard : null,
            ]}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTime}>{formatUTCToLocal(option.proposed_time)}</Text>
                <View style={styles.badges}>
                  {isSelected && <ClayTag label="✓ Your Vote" color="sage" />}
                  {conflict && <ClayTag label={`⚠ ${conflict.title}`} color="urgent" />}
                </View>
              </View>

              {/* Vote bar */}
              <View style={styles.voteBarRow}>
                <View style={styles.voteBarBg}>
                  <View style={[styles.voteBarFill, {
                    width: `${votePercent}%` as any,
                    backgroundColor: conflict ? Colors.mauve : (isSelected ? Colors.sage : Colors.periwinkle),
                  }]} />
                </View>
                <Text style={styles.voteCount}>{option.votes || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  header: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.whiteClay,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.mist,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedCard: {
    borderColor: Colors.sage,
    borderWidth: 2,
  },
  conflictCard: {
    borderColor: Colors.mauve,
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionTime: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.subheading,
    color: Colors.ink,
    flex: 1,
  },
  badges: { flexDirection: 'row', gap: 6 },
  voteBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  voteBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.mist,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  voteCount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.label,
    color: Colors.ink,
    minWidth: 24,
    textAlign: 'right',
  },
});
