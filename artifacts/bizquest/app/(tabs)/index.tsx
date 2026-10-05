import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';
import { FounderAvatar } from '@/components/FounderAvatar';
import { AppButton, BrandHeader, Page, Panel, RoundIcon, SectionHeading } from '@/components/GameUI';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, level, xpIntoLevel, storageIssue } = useGame();
  const ventureName =
    state.ventureId === 'lemonade'
      ? 'Lemonade Stand'
      : state.ventureId === 'art'
        ? 'Art & Print Studio'
        : state.ventureId === 'bakes'
          ? 'Little Bake Shop'
          : state.ventureId === 'plants'
            ? 'Plant Pals'
            : null;

  return (
    <Page>
      <BrandHeader />

      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Hey, {state.playerName}!
          </Text>
          <Text style={[styles.subGreeting, { color: colors.mutedForeground }]}>
            Ready to make your next big move?
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Customize your founder avatar"
          testID="home-avatar-shortcut"
          onPress={() => router.navigate('/avatar')}
          style={styles.avatarShortcut}
        >
          <FounderAvatar avatar={state.avatar} size={74} animate />
        </Pressable>
      </View>

      {storageIssue ? (
        <View style={[styles.storageNotice, { backgroundColor: colors.goldSoft }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accentForeground} />
          <Text style={[styles.storageNoticeText, { color: colors.accentForeground }]}>
            Progress could not be saved on this device.
          </Text>
        </View>
      ) : null}

      <View style={styles.statRow}>
        <StatBlock icon="sparkles" value={`${state.points}`} label="BIZ POINTS" tone="gold" />
        <StatBlock icon="flash" value={`${state.xp}`} label="XP EARNED" tone="violet" />
        <StatBlock icon="ribbon" value={`${state.badges.length}`} label="BADGES" tone="mint" />
      </View>

      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>YOUR FOUNDER STORY</Text>
          <Text style={styles.heroTitle}>Little idea. Big future.</Text>
          <Text style={styles.heroDescription}>
            Build a business, make smart money moves, and grow your skills.
          </Text>
          <AppButton
            label={ventureName ? 'Open my business' : 'Choose a business'}
            icon="arrow-forward"
            variant="light"
            compact
            testID="home-business-cta"
            onPress={() => router.navigate('/business')}
          />
        </View>
        <Image
          source={require('../../assets/images/founder.png')}
          contentFit="cover"
          style={styles.founderArt}
          accessibilityLabel="Young founder ready to open a neighborhood business"
        />
        <View style={styles.heroSparkleTop}>
          <Ionicons name="sparkles" size={19} color="#FFF4C6" />
        </View>
      </View>

      <Panel tone="gold" style={styles.salesSprint}>
        <View style={styles.sprintTop}>
          <RoundIcon name="storefront-outline" color={colors.accentForeground} background={colors.card} size={40} />
          <View style={styles.sprintCopy}>
            <Text style={[styles.sprintTitle, { color: colors.foreground }]}>
              {state.weeksCompleted ? 'Your next sales sprint' : 'Your first sales sprint'}
            </Text>
            <Text style={[styles.sprintDescription, { color: colors.inkSoft }]}>
              {state.weekSales} of 5 customers · {state.weeksCompleted} market weeks finished
            </Text>
          </View>
          <Ionicons name="star" size={18} color={colors.gold} />
        </View>
        <View style={[styles.xpTrack, { backgroundColor: colors.card }]}>
          <View style={[styles.xpFill, { backgroundColor: colors.primary, width: `${Math.max(5, state.weekSales * 20)}%` }]} />
        </View>
        <Text style={[styles.sprintHint, { color: colors.accentForeground }]}>5 sales unlock the Sales Star badge + 25 XP</Text>
        <AppButton label={ventureName ? 'Meet my next customer' : 'Choose my first shop'} icon="arrow-forward" compact variant="light" onPress={() => router.navigate('/business')} />
      </Panel>

      <Panel tone="plain" style={styles.questPanel}>
        <View style={styles.questHeader}>
          <RoundIcon
            name="flash-outline"
            color={colors.primary}
            background={colors.orangeSoft}
            size={44}
          />
          <View style={styles.questText}>
            <Text style={[styles.questOverline, { color: colors.primary }]}>TODAY'S QUEST</Text>
            <Text style={[styles.questTitle, { color: colors.foreground }]}>The Pop-up Budget</Text>
            <Text style={[styles.questDescription, { color: colors.mutedForeground }]}>
              Plan a budget and earn 25 XP
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </View>
        <View style={[styles.xpTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.xpFill,
              { backgroundColor: colors.primary, width: `${Math.max(8, xpIntoLevel)}%` },
            ]}
          />
        </View>
        <View style={styles.levelLine}>
          <Text style={[styles.levelCaption, { color: colors.mutedForeground }]}>
            LEVEL {level}
          </Text>
          <Text style={[styles.levelCaption, { color: colors.mutedForeground }]}>
            {xpIntoLevel}/100 XP
          </Text>
        </View>
        <AppButton
          label="Play today's quest"
          icon="arrow-forward"
          compact
          testID="home-quest-cta"
          onPress={() => router.navigate('/learn')}
        />
      </Panel>

      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.mint} />
        <Text style={[styles.footerNoteText, { color: colors.mutedForeground }]}>
          Biz Bucks are just for practice — no real money involved.
        </Text>
      </View>

      <View style={styles.progressCallout}>
        <SectionHeading title="Small choices add up" />
        <View style={styles.skillRow}>
          <SkillItem icon="wallet-outline" label="Plan" color={colors.gold} />
          <SkillItem icon="save-outline" label="Save" color={colors.mint} />
          <SkillItem icon="trending-up-outline" label="Grow" color={colors.blue} />
        </View>
      </View>
    </Page>
  );
}

function StatBlock({
  icon,
  value,
  label,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone: 'gold' | 'violet' | 'mint';
}) {
  const colors = useColors();
  const theme = {
    gold: { bg: colors.goldSoft, icon: colors.accentForeground },
    violet: { bg: colors.lavender, icon: colors.violet },
    mint: { bg: colors.mintSoft, icon: colors.mint },
  }[tone];
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon} size={17} color={theme.icon} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SkillItem({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.skillItem, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.skillLabel, { color: colors.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 86 },
  greetingText: { flex: 1, gap: 5 },
  greeting: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -1 },
  subGreeting: { fontSize: 13, lineHeight: 18 },
  avatarShortcut: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  storageNotice: { borderRadius: 13, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  storageNoticeText: { flex: 1, fontSize: 12, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 93, borderRadius: 20, padding: 11, alignItems: 'center', justifyContent: 'center', gap: 4 },
  statIcon: { width: 27, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  statValue: { fontSize: 19, fontWeight: '900', lineHeight: 22 },
  statLabel: { fontSize: 8, letterSpacing: 0.65, fontWeight: '800' },
  heroCard: { minHeight: 193, borderRadius: 27, overflow: 'hidden', padding: 17, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  heroCopy: { flex: 1.04, gap: 8, zIndex: 1 },
  heroEyebrow: { color: '#FFE4A4', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 25, letterSpacing: -0.7, fontWeight: '900', maxWidth: 178 },
  heroDescription: { color: '#FFF7EF', fontSize: 11, lineHeight: 15, maxWidth: 175, marginBottom: 2 },
  founderArt: { width: 128, height: 158, borderRadius: 23, marginLeft: -3 },
  heroSparkleTop: { position: 'absolute', right: 13, top: 11 },
  questPanel: { gap: 12 },
  questHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  questText: { flex: 1, gap: 2 },
  questOverline: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  questTitle: { fontSize: 17, fontWeight: '900' },
  questDescription: { fontSize: 11, lineHeight: 15 },
  xpTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 8 },
  levelLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  levelCaption: { fontSize: 9, fontWeight: '800' },
  footerNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 3 },
  footerNoteText: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  progressCallout: { gap: 12 },
  skillRow: { flexDirection: 'row', gap: 9 },
  skillItem: { flex: 1, minHeight: 44, borderRadius: 15, borderWidth: 1, backgroundColor: '#FFFEFB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  skillLabel: { fontSize: 12, fontWeight: '800' },
  salesSprint: { gap: 10 },
  sprintTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sprintCopy: { flex: 1, gap: 2 },
  sprintTitle: { fontSize: 14, fontWeight: '900' },
  sprintDescription: { fontSize: 10, lineHeight: 14 },
  sprintHint: { fontSize: 10, fontWeight: '900' },
});
