import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { BADGES } from '@/constants/game-content';
import { useGame } from '@/providers/GameProvider';
import { useAuth } from '@/providers/AuthProvider';

export function RewardCelebration() {
  const colors = useColors();
  const { state, level, hydrated } = useGame();
  const { user } = useAuth();
  const seen = useRef<{ level: number; badges: string[] } | null>(null);
  const [reward, setReward] = useState<{ title: string; detail: string; icon: keyof typeof Ionicons.glyphMap } | null>(null);
  const scale = useSharedValue(0.78);
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (!user || !hydrated) return;
    if (!seen.current) {
      seen.current = { level, badges: [...state.badges] };
      return;
    }
    const previous = seen.current;
    seen.current = { level, badges: [...state.badges] };
    if (level > previous.level) {
      setReward({
        title: `Level ${level}!`,
        detail: 'You earned this by practicing, planning, and making brave business choices.',
        icon: 'trophy',
      });
      return;
    }
    const newBadge = state.badges.find((badge) => !previous.badges.includes(badge));
    if (newBadge) {
      const badge = BADGES.find((item) => item.id === newBadge);
      setReward({
        title: badge?.name ?? 'New achievement!',
        detail: badge?.detail ?? 'Your shop just reached a new milestone.',
        icon: 'ribbon',
      });
    }
  }, [hydrated, level, state.badges, user]);

  useEffect(() => {
    if (!reward) return;
    opacity.value = withTiming(1, { duration: 170 });
    scale.value = withSequence(withSpring(1.06, { damping: 9, stiffness: 170 }), withSpring(1, { damping: 11 }));
  }, [opacity, reward, scale]);

  const close = () => {
    opacity.value = withTiming(0, { duration: 130 });
    scale.value = withTiming(0.85, { duration: 130 });
    setTimeout(() => setReward(null), 140);
  };

  return (
    <Modal visible={Boolean(reward && user)} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close reward" />
        <Animated.View style={[styles.card, { backgroundColor: colors.card }, animatedStyle]}>
          <View style={[styles.sparkle, { backgroundColor: colors.goldSoft }]}>
            <Ionicons name="sparkles" size={18} color={colors.accentForeground} />
          </View>
          <Image source={require('../assets/images/mascot-hero.png')} contentFit="cover" style={styles.mascot} />
          <Text style={[styles.title, { color: colors.foreground }]}>{reward?.title}</Text>
          <Text style={[styles.detail, { color: colors.inkSoft }]}>{reward?.detail}</Text>
          <View style={styles.confettiRow}>
            {(['star', 'sparkles', 'star', 'sparkles', 'star'] as const).map((icon, index) => (
              <Ionicons key={`${icon}-${index}`} name={icon} size={index % 2 ? 14 : 18} color={index % 2 ? colors.primary : colors.gold} />
            ))}
          </View>
          <Pressable onPress={close} style={[styles.button, { backgroundColor: colors.primary }]} accessibilityRole="button">
            <Text style={styles.buttonText}>Keep going!</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(39, 35, 32, 0.56)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  card: { width: '100%', maxWidth: 360, minHeight: 360, borderRadius: 28, padding: 21, alignItems: 'center', justifyContent: 'center', gap: 9, overflow: 'hidden' },
  sparkle: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 132, height: 132, borderRadius: 35, marginTop: 6 },
  title: { fontSize: 27, lineHeight: 32, textAlign: 'center', fontWeight: '900', letterSpacing: -0.7 },
  detail: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 275 },
  confettiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 5 },
  button: { minHeight: 48, alignSelf: 'stretch', borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 3 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
