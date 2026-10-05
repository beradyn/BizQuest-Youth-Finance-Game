import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';

type IconName = keyof typeof Ionicons.glyphMap;

export function Page({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.pageContent,
          Platform.OS === 'web' && styles.webPageContent,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BrandHeader({ right }: { right?: ReactNode }) {
  const colors = useColors();
  const { level, xpIntoLevel } = useGame();
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandLeft}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.brandIcon}
          contentFit="cover"
          accessibilityLabel="BizQuest gold compass coin"
        />
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>bizquest</Text>
          <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
            MAKE YOUR IDEA COUNT
          </Text>
        </View>
      </View>
      {right ?? (
        <View style={[styles.levelPill, { backgroundColor: colors.goldSoft }]}>
          <Ionicons name="sparkles" size={15} color={colors.accentForeground} />
          <Text style={[styles.levelText, { color: colors.accentForeground }]}>
            LVL {level} · {xpIntoLevel}/100 XP
          </Text>
        </View>
      )}
    </View>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.headingWrap}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.pageDescription, { color: colors.mutedForeground }]}>
        {description}
      </Text>
    </View>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action}
    </View>
  );
}

export function Panel({
  children,
  style,
  tone,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'gold' | 'orange' | 'mint' | 'blue' | 'lavender' | 'plain';
}) {
  const colors = useColors();
  const background = {
    gold: colors.goldSoft,
    orange: colors.orangeSoft,
    mint: colors.mintSoft,
    blue: colors.blueSoft,
    lavender: colors.lavender,
    plain: colors.card,
  }[tone ?? 'plain'];
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  compact = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'light' | 'outline' | 'secondary';
  disabled?: boolean;
  compact?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  const stylesByVariant = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.primaryForeground,
    },
    light: {
      backgroundColor: colors.card,
      borderColor: colors.card,
      color: colors.foreground,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      color: colors.foreground,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      color: colors.secondaryForeground,
    },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor: stylesByVariant.backgroundColor,
          borderColor: stylesByVariant.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={[styles.buttonLabel, compact && styles.buttonLabelCompact, { color: stylesByVariant.color }]}>
        {label}
      </Text>
      {icon ? <Ionicons name={icon} size={18} color={stylesByVariant.color} /> : null}
    </Pressable>
  );
}

export function RoundIcon({
  name,
  color,
  background,
  size = 40,
}: {
  name: IconName;
  color: string;
  background: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pageContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 116,
    gap: 19,
  },
  webPageContent: {
    paddingTop: 67,
    paddingBottom: 122,
  },
  brandRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 42, height: 42, borderRadius: 14 },
  brandName: { fontSize: 20, fontWeight: '900', letterSpacing: -0.7, textTransform: 'lowercase' },
  brandTagline: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 1 },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  levelText: { fontSize: 10, fontWeight: '800' },
  headingWrap: { gap: 5 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  pageTitle: { fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -1 },
  pageDescription: { fontSize: 14, lineHeight: 20, maxWidth: 330 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  panel: {
    borderRadius: 24,
    padding: 17,
    borderWidth: 1,
    borderColor: 'rgba(64, 47, 30, 0.045)',
  },
  button: {
    minHeight: 50,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  buttonCompact: { minHeight: 40, borderRadius: 14, paddingHorizontal: 13 },
  buttonLabel: { fontSize: 14, fontWeight: '900' },
  buttonLabelCompact: { fontSize: 12 },
});
