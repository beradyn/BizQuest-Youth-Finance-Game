import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FounderAvatar } from '@/components/FounderAvatar';
import { AppButton, BrandHeader, Page, PageHeading, Panel, SectionHeading } from '@/components/GameUI';
import {
  BADGES,
  HAIR_COLORS,
  PLAYER_NAMES,
  SHIRT_COLORS,
  SKIN_TONES,
  type AvatarAccessory,
} from '@/constants/game-content';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';
import { useAuth } from '@/providers/AuthProvider';

const ACCESSORIES: { id: AvatarAccessory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'none', label: 'None', icon: 'close' },
  { id: 'cap', label: 'Cap', icon: 'sunny-outline' },
  { id: 'glasses', label: 'Glasses', icon: 'glasses-outline' },
  { id: 'headband', label: 'Headband', icon: 'ribbon-outline' },
  { id: 'bow', label: 'Star clip', icon: 'star-outline' },
];
const HAIR_STYLES = [
  { id: 'short', name: 'Cropped', selection: 'short', icon: 'cut-outline' },
  { id: 'curls', name: 'Curly', selection: 'curls', icon: 'sunny-outline' },
  { id: 'long', name: 'Long waves', selection: 'long', icon: 'water-outline' },
] as const;

export default function AvatarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { state, updateAvatar, chooseName, level, xpIntoLevel } = useGame();
  const earnedBadges = BADGES.filter((badge) => state.badges.includes(badge.id));
  const setAvatar = (key: 'skin' | 'hair' | 'shirt', value: string) => {
    updateAvatar({ [key]: value });
    void Haptics.selectionAsync();
  };

  return (
    <Page>
      <BrandHeader />
      <PageHeading
        eyebrow="YOUR FOUNDER CARD"
        title="Make it yours."
        description="Pick a look that feels like you. Your founder grows as you learn."
      />

      <Panel tone="gold" style={styles.avatarHero}>
        <View style={styles.avatarRing}>
          <FounderAvatar avatar={state.avatar} size={172} animate />
        </View>
        <Text style={[styles.avatarName, { color: colors.foreground }]}>{state.playerName}</Text>
        <Text style={[styles.avatarLevel, { color: colors.inkSoft }]}>LEVEL {level} FOUNDER</Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { backgroundColor: colors.primary, width: `${xpIntoLevel}%` }]} />
        </View>
        <Text style={[styles.xpCaption, { color: colors.inkSoft }]}>{xpIntoLevel}/100 XP to next level</Text>
      </Panel>

      <View style={styles.nameSection}>
        <SectionHeading title="Choose your name" />
        <View style={styles.choiceRow}>
          {PLAYER_NAMES.map((name) => (
            <ChoiceChip
              key={name}
              label={name}
              selected={state.playerName === name}
              onPress={() => {
                chooseName(name);
                void Haptics.selectionAsync();
              }}
            />
          ))}
        </View>
      </View>

      <CustomizeGroup
        title="Skin tone"
        description="Choose your founder's look"
        values={SKIN_TONES.map((tone) => ({ ...tone, selection: tone.value }))}
        selected={state.avatar.skin}
        onSelect={(value) => setAvatar('skin', value)}
        colorsAsSwatches
      />
      <CustomizeGroup
        title="Hairstyle"
        description="Choose a silhouette that feels like you"
        values={HAIR_STYLES.map((style) => ({ name: style.name, value: style.id, selection: style.selection, icon: style.icon }))}
        selected={state.avatar.hairStyle}
        onSelect={(value) => {
          updateAvatar({ hairStyle: value as 'short' | 'curls' | 'long' });
          void Haptics.selectionAsync();
        }}
        colorsAsSwatches={false}
      />
      <CustomizeGroup
        title="Hair color"
        description="Pick a style that feels like you"
        values={HAIR_COLORS.map((tone) => ({ ...tone, selection: tone.value }))}
        selected={state.avatar.hair}
        onSelect={(value) => setAvatar('hair', value)}
        colorsAsSwatches
      />
      <CustomizeGroup
        title="Founder outfit"
        description="Choose your business-day color"
        values={SHIRT_COLORS.map((tone) => ({ ...tone, selection: tone.value }))}
        selected={state.avatar.shirt}
        onSelect={(value) => setAvatar('shirt', value)}
        colorsAsSwatches
      />

      <View style={styles.accessorySection}>
        <SectionHeading title="Add an accessory" />
        <View style={styles.accessoryGrid}>
          {ACCESSORIES.map((item) => (
            <AccessoryChoice
              key={item.id}
              icon={item.icon}
              label={item.label}
              selected={state.avatar.accessory === item.id}
              onPress={() => {
                updateAvatar({ accessory: item.id });
                void Haptics.selectionAsync();
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.badgesSection}>
        <SectionHeading title="Badges earned" />
        {earnedBadges.length === 0 ? (
          <Panel tone="plain" style={styles.badgeEmpty}>
            <Ionicons name="ribbon-outline" size={22} color={colors.gold} />
            <Text style={[styles.badgeEmptyText, { color: colors.mutedForeground }]}>
              Complete quests and make sales to fill your badge shelf.
            </Text>
          </Panel>
        ) : (
          <View style={styles.badgesGrid}>
            {earnedBadges.map((badge) => (
              <Panel key={badge.id} tone="gold" style={styles.badgeCard}>
                <Ionicons name={badge.icon} size={23} color={colors.accentForeground} />
                <Text style={[styles.badgeName, { color: colors.foreground }]}>{badge.name}</Text>
                <Text style={[styles.badgeDetail, { color: colors.inkSoft }]}>{badge.detail}</Text>
              </Panel>
            ))}
          </View>
        )}
      </View>

      <Panel tone="mint" style={styles.saveNote}>
        <Ionicons name="checkmark-circle-outline" size={19} color={colors.mint} />
        <Text style={[styles.saveNoteText, { color: colors.secondaryForeground }]}>
          Your founder look saves as you make each choice.
        </Text>
      </Panel>
      <Panel tone="plain" style={styles.accountPanel}>
        <View style={styles.accountCopy}>
          <Ionicons name="person-circle-outline" size={27} color={colors.primary} />
          <View style={styles.accountText}>
            <Text style={[styles.accountTitle, { color: colors.foreground }]}>Signed in as {user?.username}</Text>
            <Text style={[styles.accountDetail, { color: colors.mutedForeground }]}>Your founder profile is ready whenever you are.</Text>
          </View>
        </View>
        <AppButton
          label="Sign out"
          icon="log-out-outline"
          variant="outline"
          compact
          onPress={() => { void signOut().finally(() => router.replace('/auth')); }}
        />
      </Panel>
    </Page>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.nameChip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.nameChipText, { color: selected ? colors.primaryForeground : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CustomizeGroup({
  title,
  description,
  values,
  selected,
  onSelect,
  colorsAsSwatches,
}: {
  title: string;
  description: string;
  values: { name: string; value: string; selection: string }[];
  selected: string;
  onSelect: (value: string) => void;
  colorsAsSwatches: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.customizeGroup}>
      <View style={styles.customizeHeading}>
        <Text style={[styles.customizeTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.customizeDescription, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <View style={styles.swatchRow}>
        {values.map((item) => {
          const active = selected === item.selection;
          return (
            <Pressable
              key={item.selection}
              accessibilityRole="button"
              accessibilityLabel={`${title}: ${item.name}`}
              accessibilityState={{ selected: active }}
              testID={`avatar-${title.toLowerCase().replaceAll(' ', '-')}-${item.name.toLowerCase()}`}
              onPress={() => onSelect(item.selection)}
              style={({ pressed }) => [
                styles.swatchButton,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: item.value,
                    borderColor: active ? colors.foreground : colors.border,
                    borderWidth: active ? 3 : 1,
                  },
                ]}
              >
                {active ? <Ionicons name="checkmark" size={15} color={colors.card} /> : null}
              </View>
              <Text style={[styles.swatchLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AccessoryChoice({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={`accessory-${label.toLowerCase().replaceAll(' ', '-')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.accessoryCard,
        {
          backgroundColor: selected ? colors.goldSoft : colors.card,
          borderColor: selected ? colors.gold : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={selected ? colors.accentForeground : colors.inkSoft} />
      <Text style={[styles.accessoryLabel, { color: selected ? colors.accentForeground : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarHero: { alignItems: 'center', gap: 4, paddingTop: 19, paddingBottom: 15 },
  avatarRing: { width: 185, height: 172, alignItems: 'center', justifyContent: 'center' },
  avatarName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  avatarLevel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  xpTrack: { width: '72%', height: 7, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.75)', overflow: 'hidden', marginTop: 9 },
  xpFill: { height: '100%', borderRadius: 10 },
  xpCaption: { fontSize: 10, fontWeight: '700' },
  nameSection: { gap: 10 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  nameChip: { flex: 1, minHeight: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nameChipText: { fontSize: 12, fontWeight: '800' },
  customizeGroup: { gap: 10 },
  customizeHeading: { gap: 2 },
  customizeTitle: { fontSize: 16, fontWeight: '900' },
  customizeDescription: { fontSize: 11, lineHeight: 15 },
  swatchRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  swatchButton: { flex: 1, minWidth: 48, alignItems: 'center', gap: 5 },
  swatch: { width: 39, height: 39, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  swatchLabel: { fontSize: 8, fontWeight: '800', textAlign: 'center' },
  accessorySection: { gap: 10 },
  accessoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accessoryCard: { width: '31.5%', minHeight: 62, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  accessoryLabel: { fontSize: 10, fontWeight: '800' },
  badgesSection: { gap: 10 },
  saveNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveNoteText: { flex: 1, fontSize: 11, fontWeight: '700' },
  badgeEmpty: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  badgeEmptyText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeCard: { width: '48%', minHeight: 102, padding: 12, gap: 4 },
  badgeName: { fontSize: 13, fontWeight: '900' },
  badgeDetail: { fontSize: 10, lineHeight: 14 },
  accountPanel: { gap: 12 },
  accountCopy: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  accountText: { flex: 1, gap: 3 },
  accountTitle: { fontSize: 13, fontWeight: '900' },
  accountDetail: { fontSize: 10, lineHeight: 14 },
});
