import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import ClayCard from '../../components/ui/ClayCard';
import ClayButton from '../../components/ui/ClayButton';
import { PlayerDotStack } from '../../components/ui/PlayerDot';
import ClayTag from '../../components/ui/ClayTag';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../../constants/DesignTokens';
import { formatUTCToLocal } from '../../utils/dateFormatting';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ── Helper: Responsive Bento Grid (CSS Grid on web, flex on native)
function BentoGrid({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web') {
    // Responsive column count based on viewport width
    const cols = width >= 1024 ? 12 : width >= 640 ? 6 : 2;
    return (
      <View style={[
        styles.bentoGridWeb as any,
        { gridTemplateColumns: `repeat(${cols}, 1fr)` } as any,
      ]}>
        {children}
      </View>
    );
  }
  return <View style={styles.bentoGridNative}>{children}</View>;
}

// ── Individual Dashboard Cards ────────────────────────────────

function NextSessionCard({ session }: { session: any }) {
  return (
    <ClayCard variant="sage" style={styles.fillCard}>
      <ClayTag label="Next Session" color="neutral" />
      <Text style={styles.heroTitle} numberOfLines={2}>{session?.title ?? 'No session yet'}</Text>
      {session?.confirmed_time && (
        <Text style={styles.heroDate}>{formatUTCToLocal(session.confirmed_time)}</Text>
      )}
      <View style={{ height: Spacing.md }} />
      <PlayerDotStack names={['Dungeon Master', 'Grog', 'Vax', 'Keyleth']} size="md" />
      <View style={{ height: Spacing.lg }} />
      {session ? (
        <ClayButton
          label="View Session →"
          variant="secondary"
          onPress={() => router.push(`/campaign/${session.campaign_id}/session/${session.id}`)}
        />
      ) : (
        <ClayButton label="Create Campaign" variant="secondary" onPress={() => {}} />
      )}
    </ClayCard>
  );
}

function WhoIsInCard({ session }: { session: any }) {
  const players = ['Grog', 'Vax', 'Keyleth', 'Pike'];
  return (
    <ClayCard variant="periwinkle" style={styles.fillCard}>
      <Text style={styles.cardTitle}>Who's In?</Text>
      {/* ink on periwinkle = 5.49:1 ✅ */}
      <Text style={styles.cardSubtitle}>
        {players.length} members · {session ? '2 confirmed' : 'No active poll'}
      </Text>
      <View style={{ height: Spacing.md }} />
      {players.map((name, i) => (
        <View key={name} style={styles.playerRow}>
          <View style={styles.playerRowLeft}>
            {/* ink dot — visible on periwinkle ✅ */}
            <View style={[styles.dot, { backgroundColor: Colors.ink }]} />
            <Text style={styles.playerName}>{name}</Text>
          </View>
          {/* ink on periwinkle 5.49:1 ✅ | use semibold at 12px per WCAG large-text exception */}
          <Text style={styles.statusText}>
            {i < 2 ? '✓ In' : '⏳ Pending'}
          </Text>
        </View>
      ))}
    </ClayCard>
  );
}

function QuickActionsCard({ onNewSession, onShareInvite }: { onNewSession: () => void; onShareInvite: () => void }) {
  return (
    <ClayCard variant="base" style={styles.fillCard} padding={Spacing.md}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      <View style={{ height: Spacing.sm }} />
      <ClayButton label="＋ New Session" variant="primary" onPress={onNewSession} fullWidth />
      <View style={{ height: Spacing.sm }} />
      <ClayButton label="🔗 Share Invite" variant="secondary" onPress={onShareInvite} fullWidth />
    </ClayCard>
  );
}

function StatsCard({ sessionCount }: { sessionCount: number }) {
  return (
    <ClayCard variant="mauve" style={styles.fillCard} padding={Spacing.md}>
      <Text style={styles.cardTitle}>Campaign Stats</Text>
      <View style={{ height: Spacing.sm }} />
      <Text style={styles.statNumber}>{sessionCount}</Text>
      {/* ink on mauve = 4.79:1 ✅ | was mauveLight = 1.65:1 ❌ */}
      <Text style={styles.statLabel}>Sessions Scheduled</Text>
    </ClayCard>
  );
}

function PendingPollCard({ session, onPress }: { session: any; onPress: () => void }) {
  return (
    <ClayCard variant="base" style={styles.fillCard} onPress={onPress}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>Pending Vote</Text>
        <ClayTag label="Awaiting Quorum" color="mauve" />
      </View>
      <Text style={[styles.cardSubtitle, { marginTop: Spacing.xs }]}>{session?.title}</Text>
      {/* Mock vote bars for design */}
      {['Sat May 3, 7pm', 'Sun May 4, 5pm', 'Fri May 9, 8pm'].map((date, i) => (
        <View key={date} style={{ marginTop: Spacing.sm }}>
          <Text style={styles.pollOptionLabel}>{date}</Text>
          <View style={styles.voteBarBg}>
            <View style={[styles.voteBarFill, { width: `${[75, 50, 25][i]}%` as any, backgroundColor: [Colors.sage, Colors.periwinkle, Colors.mist][i] }]} />
          </View>
        </View>
      ))}
    </ClayCard>
  );
}

function EmptyStateCard() {
  return (
    <ClayCard variant="sage" style={styles.fillCard}>
      <Text style={styles.emptyEmoji}>🎲</Text>
      <Text style={styles.heroTitle}>Welcome to Table Talk</Text>
      <Text style={[styles.cardSubtitle, { marginTop: Spacing.sm, marginBottom: Spacing.lg }]}>
        Create your first campaign, invite your players, and schedule sessions without the back-and-forth.
      </Text>
      <ClayButton
        label="＋ Create Your First Campaign"
        variant="secondary"
        onPress={() => router.push('/login')}
      />
    </ClayCard>
  );
}

// ── Main Dashboard Screen ─────────────────────────────────────

export default function DashboardScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.user) { router.replace('/login'); return; }

      const { data } = await supabase
        .from('sessions')
        .select('*, campaigns(*)')
        .order('created_at', { ascending: false });

      setSessions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.sage} />
      </View>
    );
  }

  const confirmedSession = sessions.find(s => s.status === 'confirmed');
  const pendingSession = sessions.find(s => s.status === 'polling');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Table Talk</Text>
        <ClayButton label="Sign Out" variant="secondary" onPress={async () => { await supabase.auth.signOut(); router.replace('/login'); }} />
      </View>

      {/* Bento Grid with stagger entry animations */}
      <BentoGrid>
        {([
          {
            key: 'hero',
            gridStyle: styles.heroCard,
            card: confirmedSession || sessions.length > 0
              ? <NextSessionCard session={confirmedSession ?? sessions[0]} />
              : <EmptyStateCard />,
          },
          { key: 'whoisin',  gridStyle: styles.wideCard,  card: <WhoIsInCard session={confirmedSession} /> },
          {
            key: 'actions',
            gridStyle: styles.smallCard,
            card: <QuickActionsCard
              onNewSession={() => sessions[0] ? router.push(`/campaign/${sessions[0].campaign_id}/new-session`) : router.push('/login')}
              onShareInvite={() => {}}
            />
          },
          { key: 'stats', gridStyle: styles.smallCard, card: <StatsCard sessionCount={sessions.length} /> },
          pendingSession ? {
            key: 'poll',
            gridStyle: styles.pollCard,
            card: <PendingPollCard
              session={pendingSession}
              onPress={() => router.push(`/campaign/${pendingSession.campaign_id}/session/${pendingSession.id}`)}
            />
          } : null,
        ] as const).filter(Boolean).map((item: any, i) => (
          // Grid span goes on Animated.View (the direct CSS Grid child), not the inner card
          <Animated.View
            key={item.key}
            style={[item.gridStyle, styles.gridCell]}
            entering={FadeInDown.delay(i * 60).springify()}
          >
            {item.card}
          </Animated.View>
        ))}
      </BentoGrid>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appTitle: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    color: Colors.ink,
  },
  bentoGridWeb: Platform.select({
    web: {
      display: 'grid',
      // gridTemplateColumns is set dynamically in BentoGrid via width
      gridAutoRows: 'minmax(140px, auto)',
      gap: 16,
    } as any,
    default: {},
  }) ?? {},
  bentoGridNative: {
    gap: Spacing.md,
  },
  // fillCard: cards fill their Animated.View parent which carries the grid span
  fillCard: {
    flex: 1,
    height: '100%' as any,
  },
  // Grid span styles — applied to Animated.View (the direct CSS Grid child)
  heroCard: Platform.select({
    web: { gridColumn: 'span 6', gridRow: 'span 2' } as any,
    default: {},
  }) ?? {},
  wideCard: Platform.select({
    web: { gridColumn: 'span 3', gridRow: 'span 2' } as any,
    default: {},
  }) ?? {},
  smallCard: Platform.select({
    web: { gridColumn: 'span 3', gridRow: 'span 1' } as any,
    default: {},
  }) ?? {},
  pollCard: Platform.select({
    web: { gridColumn: 'span 6', gridRow: 'span 1' } as any,
    default: {},
  }) ?? {},
  gridCell: {
    // Ensure ClayCard inside fills the cell
    display: 'flex' as any,
    flexDirection: 'column' as any,
  },
  heroTitle: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    color: Colors.ink,
    marginTop: Spacing.sm,
    lineHeight: 40,
  },
  heroDate: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.subheading,
    color: Colors.ink,
    marginTop: Spacing.xs,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    color: Colors.ink,
  },
  cardSubtitle: {
    // semibold at 14px + full ink opacity = readable on all colored card backgrounds
    // ink on sage 5.90:1 ✅ | ink on periwinkle 5.49:1 ✅ | ink on mauve 4.79:1 ✅
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  playerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  statNumber: {
    fontFamily: FontFamily.extrabold,
    fontSize: 48,
    color: Colors.ink,
    lineHeight: 52,
  },
  statLabel: {
    // ink on mauve = 4.79:1 ✅ | was mauveLight = 1.65:1 ❌
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
    color: Colors.ink,
  },
  statusText: {
    // ink on periwinkle = 5.49:1 ✅ | was sageLight/periwinkleLight = 1.54–1.61:1 ❌
    fontFamily: FontFamily.bold,
    fontSize: FontSize.label,
    color: Colors.ink,
  },
  pollOptionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
    color: Colors.ink,
    marginBottom: 4,
  },
  voteBarBg: {
    height: 8,
    backgroundColor: Colors.mist,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
});
