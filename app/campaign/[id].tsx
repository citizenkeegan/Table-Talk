import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Share, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { supabase } from '../../lib/supabase';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/DesignTokens';
import ClayCard from '../../components/ui/ClayCard';
import ClayButton from '../../components/ui/ClayButton';
import ClayTag from '../../components/ui/ClayTag';

export default function CampaignScreen() {
  const { id } = useLocalSearchParams();
  const { identity } = useGuestIdentity();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOrganizer();
  }, []);

  const checkOrganizer = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsOrganizer(!!session?.user);
    setLoading(false);
  };

  const handleShareInvite = async () => {
    try {
      const inviteUrl = `tabletalk://invite/${id}`;
      await Share.share({ message: `Join our Table Talk campaign! Tap here: ${inviteUrl}` });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.sage} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Campaign</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>

      {/* Sessions placeholder */}
      <ClayCard variant="base" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          <ClayTag label="No Sessions" color="neutral" />
        </View>
        <Text style={styles.emptyText}>No active sessions yet. Propose one to get started.</Text>
      </ClayCard>

      {/* Guest identity */}
      {identity && (
        <ClayCard variant="periwinkle" style={styles.section}>
          <Text style={styles.sectionTitle}>Playing as Guest</Text>
          <Text style={[styles.emptyText, { color: Colors.periwinkleDark, marginTop: 4 }]}>{identity.name}</Text>
        </ClayCard>
      )}

      {/* Organizer controls */}
      {isOrganizer && (
        <ClayCard variant="sage" style={styles.section}>
          <Text style={styles.sectionTitle}>Organizer Controls</Text>
          <View style={styles.buttonGroup}>
            <ClayButton
              label="＋ Propose New Session"
              variant="secondary"
              onPress={() => router.push(`/campaign/${id}/new-session`)}
              fullWidth
            />
            <ClayButton
              label="🔗 Share Invite Link"
              variant="secondary"
              onPress={handleShareInvite}
              fullWidth
            />
          </View>
        </ClayCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
    opacity: 0.5,
    marginBottom: Spacing.md,
  },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    color: Colors.ink,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    opacity: 0.6,
  },
  buttonGroup: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
});
