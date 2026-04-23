import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { supabase } from '../../lib/supabase';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../constants/DesignTokens';
import ClayCard from '../../components/ui/ClayCard';
import ClayButton from '../../components/ui/ClayButton';

export default function CampaignInviteScreen() {
  const { campaignId } = useLocalSearchParams();
  const { identity, loading: guestLoading, saveIdentity } = useGuestIdentity();
  const [displayName, setDisplayName] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setIsOrganizer(true);
    setCheckingAuth(false);
  };

  const handleJoinAsGuest = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    await saveIdentity(displayName.trim());
    router.replace(`/campaign/${campaignId}`);
  };

  if (checkingAuth || guestLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.sage} />
      </View>
    );
  }

  if (isOrganizer || identity) {
    router.replace(`/campaign/${campaignId}`);
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.emoji}>🎲</Text>
      <Text style={styles.title}>You've been invited!</Text>
      <Text style={styles.subtitle}>
        Join the campaign to view schedules and vote on the next session. No account required.
      </Text>

      {/* Form Card */}
      <ClayCard variant="base" style={styles.card}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Grog Strongjaw"
          placeholderTextColor={Colors.periwinkleLight}
          value={displayName}
          onChangeText={setDisplayName}
          autoFocus
        />
        <ClayButton
          label="Join Campaign →"
          variant="primary"
          onPress={handleJoinAsGuest}
          disabled={!displayName.trim()}
          loading={loading}
          fullWidth
        />
      </ClayCard>

      {/* Organizer link */}
      <View style={styles.loginPrompt}>
        <Text style={styles.promptText}>Are you the organizer? </Text>
        <Text style={styles.link} onPress={() => router.push('/login')}>Sign In</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.subheading,
    color: Colors.ink,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.md,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.subheading,
    color: Colors.ink,
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
  loginPrompt: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  promptText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    opacity: 0.6,
  },
  link: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    color: Colors.periwinkle,
  },
});
