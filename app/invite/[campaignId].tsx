import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function CampaignInviteScreen() {
  const { campaignId } = useLocalSearchParams();
  const { identity, loading: guestLoading, saveIdentity } = useGuestIdentity();
  const [displayName, setDisplayName] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsOrganizer(true);
    }
    setCheckingAuth(false);
  };

  const handleJoinAsGuest = async () => {
    if (!displayName.trim()) return;
    await saveIdentity(displayName.trim());
    // Proceed to the campaign dashboard/voting screen
    router.replace(`/campaign/${campaignId}`);
  };

  if (checkingAuth || guestLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  // If they are an organizer OR they already have a guest identity, redirect them to the campaign.
  // In a real app, you might want to ask the organizer if they want to join this campaign,
  // or add the campaign to their account. For now, we redirect to the campaign view.
  if (isOrganizer || identity) {
    // Optionally redirect immediately or show a "Continue as {name}" button
    router.replace(`/campaign/${campaignId}`);
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>You've been invited!</Text>
      <Text style={[styles.subHeader, { color: theme.icon }]}>
        Join the campaign to view schedules and vote on the next session. No account required.
      </Text>

      <View style={styles.card}>
        <Text style={[styles.label, { color: theme.text }]}>What should we call you?</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="e.g. Grog Strongjaw"
          placeholderTextColor={theme.icon}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Button 
          title="Join Campaign" 
          disabled={!displayName.trim()} 
          onPress={handleJoinAsGuest}
          color={theme.primary}
        />
      </View>

      <View style={styles.loginPrompt}>
        <Text style={{ color: theme.icon }}>Are you the organizer? </Text>
        <Text 
          style={[styles.link, { color: theme.tint }]} 
          onPress={() => router.push('/login')}
        >
          Sign In
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 400,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  loginPrompt: {
    flexDirection: 'row',
    marginTop: 32,
  },
  link: {
    fontWeight: 'bold',
  },
});
