import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import Poll from '../../../../components/Poll';
import ChatThread from '../../../../components/ChatThread';
import { useGuestIdentity } from '../../../../hooks/useGuestIdentity';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { exportSessionToCalendar } from '../../../../utils/calendarExport';
import { formatUTCToLocal } from '../../../../utils/dateFormatting';

export default function SessionScreen() {
  const { id: campaignId, sessionId } = useLocalSearchParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { identity } = useGuestIdentity();
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchSession();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setOrganizerId(session.user.id);
    }
  };

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      setSessionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCalendar = async () => {
    if (!sessionData || !sessionData.confirmed_time) return;
    await exportSessionToCalendar(sessionData.title, sessionData.confirmed_time);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Session not found.</Text>
      </View>
    );
  }

  const userId = organizerId || identity?.id || null;
  const userName = organizerId ? 'Organizer' : (identity?.name || 'Unknown Guest');
  const isConfirmed = sessionData.status === 'confirmed' && sessionData.confirmed_time;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>{sessionData.title}</Text>
      
      {isConfirmed ? (
        <View style={styles.confirmedBox}>
          <Text style={styles.confirmedHeader}>🎉 Session Confirmed!</Text>
          <Text style={styles.confirmedTime}>{formatUTCToLocal(sessionData.confirmed_time)}</Text>
          <View style={{ marginTop: 16 }}>
            <Button 
              title="Add to Calendar" 
              onPress={handleExportCalendar} 
              color={theme.primary} 
            />
          </View>
        </View>
      ) : (
        <>
          <Text style={[styles.status, { color: theme.icon }]}>Status: {sessionData.status}</Text>
          <Poll sessionId={sessionId as string} userId={userId} />
          
          {!userId && (
            <Text style={{ color: '#ef4444', marginTop: 16 }}>
              You must have a guest name or be logged in to vote.
            </Text>
          )}
        </>
      )}

      {/* Embedded Chat Thread */}
      {userId && (
        <ChatThread 
          sessionId={sessionId as string} 
          userId={userId} 
          userName={userName} 
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 24,
  },
  confirmedBox: {
    padding: 24,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  confirmedHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  confirmedTime: {
    fontSize: 18,
    color: '#15803d',
    fontWeight: '500',
  }
});
