import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { formatUTCToLocal } from '../utils/dateFormatting';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { useLocalCalendar } from '../hooks/useLocalCalendar';

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
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { loadEventsForDateRange, checkConflict, permissionGranted } = useLocalCalendar();

  useEffect(() => {
    fetchOptions();
    fetchUserVote();

    const subscription = supabase
      .channel(`public:poll_options:session_id=eq.${sessionId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'poll_options',
        filter: `session_id=eq.${sessionId}` 
      }, (payload) => {
        setOptions(current => 
          current.map(opt => opt.id === payload.new.id ? payload.new as PollOption : opt)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId]);

  // Load calendar events once options are fetched to detect conflicts
  useEffect(() => {
    if (options.length > 0 && permissionGranted) {
      const dates = options.map(o => new Date(o.proposed_time).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates) + (24 * 60 * 60 * 1000)); // Add a day padding
      
      loadEventsForDateRange(minDate, maxDate);
    }
  }, [options.length, permissionGranted]);

  const fetchOptions = async () => {
    const { data } = await supabase
      .from('poll_options')
      .select('*')
      .eq('session_id', sessionId)
      .order('proposed_time', { ascending: true });
    if (data) setOptions(data);
  };

  const fetchUserVote = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('votes')
      .select('option_id')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (data) setUserVoteId(data.option_id);
  };

  const handleVote = async (optionId: string) => {
    if (!userId) return;
    const previousVote = userVoteId;
    setUserVoteId(optionId);

    try {
      const { error } = await supabase
        .from('votes')
        .upsert({ session_id: sessionId, user_id: userId, option_id: optionId }, { onConflict: 'session_id,user_id' });
      if (error) throw error;
    } catch (e) {
      console.error('Failed to vote', e);
      setUserVoteId(previousVote); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: theme.text }]}>Select your preferred date</Text>
      {options.map(option => {
        const isSelected = userVoteId === option.id;
        const conflict = checkConflict(option.proposed_time);
        
        return (
          <TouchableOpacity 
            key={option.id}
            style={[
              styles.optionCard, 
              { 
                backgroundColor: theme.card, 
                borderColor: conflict ? '#ef4444' : (isSelected ? theme.tint : theme.border),
                borderWidth: isSelected || conflict ? 2 : 1
              }
            ]}
            onPress={() => handleVote(option.id)}
          >
            <View style={styles.optionContent}>
              <View>
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {formatUTCToLocal(option.proposed_time)}
                </Text>
                {conflict && (
                  <Text style={styles.conflictText}>Conflict: {conflict.title}</Text>
                )}
              </View>
              <View style={[styles.voteBadge, { backgroundColor: theme.border }]}>
                <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold' }}>
                  {option.votes || 0} Votes
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  conflictText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: 'bold',
  },
  voteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  }
});
