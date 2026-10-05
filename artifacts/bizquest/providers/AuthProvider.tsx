import {
  bizquestLogin,
  bizquestLogout,
  bizquestMe,
  bizquestRegister,
  setAuthTokenGetter,
} from '@workspace/api-client-react';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

const TOKEN_KEY = 'bizquest-auth-session-v1';
export type FounderStyle = 'girl' | 'boy' | 'nonbinary' | 'prefer-not-to-say';
export interface BizQuestUser {
  id: string;
  username: string;
  gender: FounderStyle;
}

async function getStoredToken() {
  if (Platform.OS === 'web') {
    try { return globalThis.sessionStorage?.getItem(TOKEN_KEY) ?? null; } catch { return null; }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function storeToken(token: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (token) globalThis.sessionStorage?.setItem(TOKEN_KEY, token);
      else globalThis.sessionStorage?.removeItem(TOKEN_KEY);
    } catch { /* Browser storage may be unavailable in private contexts. */ }
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

setAuthTokenGetter(getStoredToken);

interface AuthContextValue {
  user: BizQuestUser | null;
  ready: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, gender: FounderStyle) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BizQuestUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getStoredToken()
      .then(async (token) => {
        if (!token) return;
        try {
          const account = await bizquestMe();
          if (active) setUser(account);
        } catch {
          await storeToken(null);
        }
      })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const session = await bizquestLogin({ username, password });
    await storeToken(session.token);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (username: string, password: string, gender: FounderStyle) => {
    const session = await bizquestRegister({ username, password, gender });
    await storeToken(session.token);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await bizquestLogout(); } finally {
      await storeToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signUp, signOut }), [user, ready, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
