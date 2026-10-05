import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { FounderStyle, useAuth } from '@/providers/AuthProvider';

const STYLES: { id: FounderStyle; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'girl', title: 'Girl', icon: 'flower-outline' },
  { id: 'boy', title: 'Boy', icon: 'rocket-outline' },
  { id: 'nonbinary', title: 'Mix it up', icon: 'sparkles-outline' },
  { id: 'prefer-not-to-say', title: 'Surprise me', icon: 'color-wand-outline' },
];

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, signUp, user, ready } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<FounderStyle>('prefer-not-to-say');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitScale = useSharedValue(1);
  const submitAnimation = useAnimatedStyle(() => ({ transform: [{ scale: submitScale.value }] }));

  React.useEffect(() => {
    if (ready && user) router.replace('/(tabs)');
  }, [ready, user, router]);

  const submit = async () => {
    setError('');
    if (username.trim().length < 3) {
      setError('Choose a username with at least 3 letters, numbers, or underscores.');
      return;
    }
    if (password.length < 8) {
      setError('Your password needs at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (isCreating) await signUp(username.trim(), password, gender);
      else await signIn(username.trim(), password);
      router.replace('/(tabs)');
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : '';
      setError(detail.includes('409') || detail.toLowerCase().includes('already taken')
        ? 'That username is already taken. Try another one.'
        : detail.includes('401')
          ? 'That username and password do not match. Try again.'
          : detail.includes('Network request failed') || detail.includes('fetch')
            ? 'The account service is not connected right now. Please try again in a moment.'
            : detail || 'We could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        <View style={styles.brand}>
          <Image source={require('../assets/images/icon.png')} style={styles.brandCoin} contentFit="cover" />
          <Text style={[styles.brandName, { color: colors.foreground }]}>bizquest</Text>
        </View>
        <View style={[styles.hero, { backgroundColor: colors.goldSoft }]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: colors.accentForeground }]}>YOUR IDEA STARTS HERE</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {isCreating ? 'Ready, future founder?' : 'Welcome back, founder!'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              {isCreating ? 'Make a username and build your first big idea.' : 'Sign in to get back to your business.'}
            </Text>
          </View>
          <Image
            source={require('../assets/images/mascot-hero.png')}
            contentFit="cover"
            style={styles.mascot}
            accessibilityLabel="BizQuest guide mascot showing a gold coin"
          />
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.foreground }]}>Username</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            maxLength={18}
            value={username}
            onChangeText={setUsername}
            placeholder="3–18 letters, numbers, or _"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            accessibilityLabel="Username"
            testID="auth-username"
          />
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              autoComplete={isCreating ? 'new-password' : 'current-password'}
              maxLength={72}
              returnKeyType="go"
              onSubmitEditing={submit}
              style={[styles.passwordInput, { color: colors.foreground }]}
              accessibilityLabel="Password"
              testID="auth-password"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((visible) => !visible)}
              style={styles.eyeButton}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {isCreating ? (
            <View style={styles.styleChooser}>
              <Text style={[styles.label, { color: colors.foreground }]}>Pick your founder's look</Text>
              <Text style={[styles.helper, { color: colors.mutedForeground }]}>You can change your avatar whenever you like.</Text>
              <View style={styles.styleGrid}>
                {STYLES.map((item) => {
                  const selected = gender === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setGender(item.id)}
                      style={[
                        styles.styleOption,
                        { backgroundColor: selected ? colors.orangeSoft : colors.card, borderColor: selected ? colors.primary : colors.border },
                      ]}
                    >
                      <Ionicons name={item.icon} size={21} color={selected ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.styleTitle, { color: selected ? colors.primary : colors.inkSoft }]}>{item.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.orangeSoft }]}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={[styles.errorText, { color: colors.foreground }]}>{error}</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={submit}
            onPressIn={() => { submitScale.value = withSpring(0.96, { damping: 13, stiffness: 260 }); }}
            onPressOut={() => { submitScale.value = withSpring(1, { damping: 12, stiffness: 240 }); }}
            testID="auth-submit"
            style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: busy ? 0.7 : pressed ? 0.85 : 1 }]}
          >
            <Animated.View style={[styles.submitContent, submitAnimation]}>
              {busy ? <ActivityIndicator color="white" /> : (
                <>
                  <Text style={styles.submitText}>{isCreating ? 'Create my account' : 'Let me in'}</Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                </>
              )}
            </Animated.View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setError(''); setIsCreating((value) => !value); }}
            style={styles.switchButton}
          >
            <Text style={[styles.switchText, { color: colors.inkSoft }]}>
              {isCreating ? 'Already have an account? ' : 'New to BizQuest? '}
              <Text style={{ color: colors.primary, fontWeight: '900' }}>
                {isCreating ? 'Sign in' : 'Create one'}
              </Text>
            </Text>
          </Pressable>
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.mint} />
            <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
              No email needed. Choose a nickname you like, and keep your password somewhere safe with a grown-up.
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 38, gap: 20, maxWidth: 520, width: '100%', alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandCoin: { width: 39, height: 39, borderRadius: 14 },
  brandName: { fontSize: 21, fontWeight: '900', letterSpacing: -0.8 },
  hero: { minHeight: 216, borderRadius: 28, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 17 },
  heroCopy: { flex: 1, gap: 8, zIndex: 1 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 25, lineHeight: 29, fontWeight: '900', letterSpacing: -0.8, maxWidth: 205 },
  subtitle: { fontSize: 12, lineHeight: 17, maxWidth: 190 },
  mascot: { width: 148, height: 176, borderRadius: 22, marginRight: -10 },
  form: { gap: 9 },
  label: { fontSize: 13, fontWeight: '900', marginTop: 5 },
  input: { minHeight: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, fontSize: 14, fontWeight: '700' },
  passwordRow: { minHeight: 52, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 15 },
  passwordInput: { flex: 1, minHeight: 50, fontSize: 14, fontWeight: '700' },
  eyeButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  styleChooser: { gap: 5, marginTop: 8 },
  helper: { fontSize: 11 },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  styleOption: { width: '48%', minHeight: 54, borderWidth: 1.5, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  styleTitle: { fontSize: 12, fontWeight: '900' },
  errorBox: { borderRadius: 14, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  submit: { minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  submitContent: { minHeight: 54, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  switchButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  switchText: { fontSize: 12 },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 3 },
  privacyText: { flex: 1, fontSize: 11, lineHeight: 16 },
});
