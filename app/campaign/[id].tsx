import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function CampaignScreen() {
  const { id } = useLocalSearchParams();
  const { identity } = useGuestIdentity();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    checkOrganizer();
  }, []);

  const checkOrganizer = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsOrganizer(!!session?.user);
  };

  const handleShareInvite = async () => {
    try {
      const inviteUrl = `tabletalk://invite/${id}`;
      await Share.share({
        message: `Join our Table Talk campaign! Tap here: ${inviteUrl}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Campaign Dashboard</Text>
      <Text style={[styles.text, { color: theme.icon }]}>Campaign ID: {id}</Text>
      
      {/* Sessions list placeholder for future implementation */}
      <View style={styles.sessionsContainer}>
        <Text style={[styles.subHeader, { color: theme.text }]}>Upcoming Sessions</Text>
        <Text style={{ color: theme.icon }}>No active sessions yet.</Text>
      </View>

      {identity ? (
        <Text style={[styles.text, { color: theme.tint, marginTop: 20 }]}>
          Playing as Guest: {identity.name}
        </Text>
      ) : isOrganizer ? (
        <View style={styles.organizerSection}>
          <Text style={[styles.text, { color: theme.tint, marginBottom: 12 }]}>
            Logged in as Organizer
          </Text>
          <Button 
            title="Share Invite Link" 
            onPress={handleShareInvite} 
            color={theme.icon} 
          />
          <View style={{ height: 16 }} />
          <Button 
            title="Propose New Session" 
            onPress={() => router.push(`/campaign/${id}/new-session`)} 
            color={theme.primary} 
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
  },
  sessionsContainer: {
    width: '100%',
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E8EB', // Fallback
  },
  organizerSection: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  }
});
