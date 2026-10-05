import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useColors } from '@/hooks/useColors';

export default function EntryScreen() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const colors = useColors();
  useEffect(() => {
    if (ready) router.replace(user ? '/(tabs)' : '/auth');
  }, [ready, user, router]);
  return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
