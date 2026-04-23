import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { formatUTCToLocal } from '../../utils/dateFormatting';

export default function DashboardScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      // For MVP, fetch all sessions where the user's campaign matches
      // Since campaigns might belong to user, we'd normally join. 
      // Simplified: Just fetch recent sessions assuming single-campaign MVP or basic join
      const { data, error } = await supabase
        .from('sessions')
        .select('*, campaigns(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  const confirmedSessions = sessions.filter(s => s.status === 'confirmed');
  const pendingSessions = sessions.filter(s => s.status === 'polling');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Clarity Dashboard</Text>
        <Button title="Sign Out" onPress={handleSignOut} color={theme.icon} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Action Required (Pending Polls)</Text>
      {pendingSessions.length === 0 ? (
        <Text style={{ color: theme.icon, marginBottom: 24 }}>No pending polls.</Text>
      ) : (
        <FlatList
          data={pendingSessions}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/campaign/${item.campaign_id}/session/${item.id}`)}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={{ color: theme.tint, fontWeight: 'bold' }}>Awaiting Quorum</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>Upcoming Sessions</Text>
      {confirmedSessions.length === 0 ? (
        <Text style={{ color: theme.icon }}>No confirmed sessions.</Text>
      ) : (
        <FlatList
          data={confirmedSessions}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }]}
              onPress={() => router.push(`/campaign/${item.campaign_id}/session/${item.id}`)}
            >
              <Text style={[styles.cardTitle, { color: '#166534' }]}>{item.title}</Text>
              <Text style={{ color: '#15803d', fontWeight: 'bold' }}>
                {item.confirmed_time ? formatUTCToLocal(item.confirmed_time) : 'Confirmed'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  }
});
