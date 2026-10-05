import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AvatarAccessory,
  HAIR_COLORS,
  PLAYER_NAMES,
  SKIN_TONES,
  SHIRT_COLORS,
  VentureId,
  VENTURES,
} from '@/constants/game-content';

const STORAGE_KEY = 'bizquest-progress-v1';
const STARTING_GRANT = 120;
const RESTOCK_UNITS = 4;

export interface AvatarConfig {
  skin: string;
  hair: string;
  shirt: string;
  accessory: AvatarAccessory;
}

export interface LedgerEntry {
  id: string;
  label: string;
  amount: number;
}

export interface GameState {
  playerName: string;
  avatar: AvatarConfig;
  ventureId: VentureId | null;
  cash: number;
  savings: number;
  inventory: number;
  sold: number;
  salePrice: number;
  xp: number;
  points: number;
  badges: string[];
  completedQuests: string[];
  ledger: LedgerEntry[];
}

const DEFAULT_STATE: GameState = {
  playerName: 'Alex',
  avatar: {
    skin: SKIN_TONES[1].value,
    hair: HAIR_COLORS[0].value,
    shirt: SHIRT_COLORS[1].value,
    accessory: 'none',
  },
  ventureId: null,
  cash: 0,
  savings: 0,
  inventory: 0,
  sold: 0,
  salePrice: 0,
  xp: 0,
  points: 0,
  badges: [],
  completedQuests: [],
  ledger: [],
};

interface GameContextValue {
  state: GameState;
  hydrated: boolean;
  storageIssue: boolean;
  level: number;
  xpIntoLevel: number;
  chooseName: (name: string) => void;
  updateAvatar: (changes: Partial<AvatarConfig>) => void;
  startVenture: (id: VentureId) => void;
  restock: () => boolean;
  sellProduct: () => boolean;
  changePrice: (amount: number) => void;
  saveMoney: () => boolean;
  withdrawSavings: () => boolean;
  completeQuest: (id: string, correct: boolean) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

function makeEntry(label: string, amount: number): LedgerEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, amount };
}

function restoredState(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      avatar: { ...DEFAULT_STATE.avatar, ...(parsed.avatar ?? {}) },
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      completedQuests: Array.isArray(parsed.completedQuests) ? parsed.completedQuests : [],
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
    };
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [storageIssue, setStorageIssue] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const saved = restoredState(raw);
          if (saved) setState(saved);
          else setStorageIssue(true);
        }
      })
      .catch(() => {
        if (active) setStorageIssue(true);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => setStorageIssue(true));
  }, [hydrated, state]);

  const chooseName = useCallback((name: string) => {
    if (!PLAYER_NAMES.includes(name)) return;
    setState((current) => ({ ...current, playerName: name }));
  }, []);

  const updateAvatar = useCallback((changes: Partial<AvatarConfig>) => {
    setState((current) => ({ ...current, avatar: { ...current.avatar, ...changes } }));
  }, []);

  const startVenture = useCallback((id: VentureId) => {
    const venture = VENTURES.find((item) => item.id === id);
    if (!venture) return;
    setState((current) => {
      if (current.ventureId) return current;
      return {
        ...current,
        ventureId: id,
        cash: STARTING_GRANT,
        salePrice: venture.salePrice,
        badges: current.badges.includes('first-idea')
          ? current.badges
          : [...current.badges, 'first-idea'],
        ledger: [makeEntry('Mentor starter grant', STARTING_GRANT), ...current.ledger].slice(0, 8),
      };
    });
  }, []);

  const restock = useCallback(() => {
    const venture = VENTURES.find((item) => item.id === state.ventureId);
    if (!venture || state.cash < venture.unitCost * RESTOCK_UNITS) return false;
    const cost = venture.unitCost * RESTOCK_UNITS;
    setState((current) => {
      const currentVenture = VENTURES.find((item) => item.id === current.ventureId);
      if (!currentVenture || current.cash < cost) return current;
      return {
        ...current,
        cash: current.cash - cost,
        inventory: current.inventory + RESTOCK_UNITS,
        ledger: [makeEntry(`Stocked ${RESTOCK_UNITS} ${currentVenture.product.toLowerCase()}s`, -cost), ...current.ledger].slice(0, 8),
      };
    });
    return true;
  }, [state.cash, state.ventureId]);

  const sellProduct = useCallback(() => {
    if (!state.ventureId || state.inventory <= 0) return false;
    setState((current) => {
      const venture = VENTURES.find((item) => item.id === current.ventureId);
      if (!venture || current.inventory <= 0) return current;
      const nextBadges =
        current.sold === 0 && !current.badges.includes('first-sale')
          ? [...current.badges, 'first-sale']
          : current.badges;
      return {
        ...current,
        inventory: current.inventory - 1,
        sold: current.sold + 1,
        cash: current.cash + current.salePrice,
        badges: nextBadges,
        ledger: [makeEntry(`Sold 1 ${venture.product.toLowerCase()}`, current.salePrice), ...current.ledger].slice(0, 8),
      };
    });
    return true;
  }, [state.inventory, state.ventureId]);

  const changePrice = useCallback((amount: number) => {
    setState((current) => {
      const venture = VENTURES.find((item) => item.id === current.ventureId);
      if (!venture) return current;
      const nextPrice = Math.max(venture.unitCost + 1, Math.min(venture.salePrice + 20, current.salePrice + amount));
      return { ...current, salePrice: nextPrice };
    });
  }, []);

  const saveMoney = useCallback(() => {
    if (state.cash < 10) return false;
    setState((current) => {
      if (current.cash < 10) return current;
      const getsBadge = current.savings < 10 && !current.badges.includes('smart-saver');
      return {
        ...current,
        cash: current.cash - 10,
        savings: current.savings + 10,
        badges: getsBadge ? [...current.badges, 'smart-saver'] : current.badges,
        ledger: [makeEntry('Moved 10 to savings', -10), ...current.ledger].slice(0, 8),
      };
    });
    return true;
  }, [state.cash]);

  const withdrawSavings = useCallback(() => {
    if (state.savings < 10) return false;
    setState((current) => {
      if (current.savings < 10) return current;
      return {
        ...current,
        cash: current.cash + 10,
        savings: current.savings - 10,
        ledger: [makeEntry('Moved 10 from savings', 10), ...current.ledger].slice(0, 8),
      };
    });
    return true;
  }, [state.savings]);

  const completeQuest = useCallback(
    (id: string, correct: boolean) => {
      if (state.completedQuests.includes(id)) return false;
      const completedCount = state.completedQuests.length + 1;
      setState((current) => {
        if (current.completedQuests.includes(id)) return current;
        const completedQuests = [...current.completedQuests, id];
        const badges = [...current.badges];
        if (completedCount === 1 && !badges.includes('first-quest')) badges.push('first-quest');
        if (completedQuests.length >= 3 && !badges.includes('decision-maker')) badges.push('decision-maker');
        return {
          ...current,
          completedQuests,
          xp: current.xp + 25,
          points: current.points + (correct ? 15 : 5),
          badges,
        };
      });
      return true;
    },
    [state.completedQuests],
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      storageIssue,
      level: Math.floor(state.xp / 100) + 1,
      xpIntoLevel: state.xp % 100,
      chooseName,
      updateAvatar,
      startVenture,
      restock,
      sellProduct,
      changePrice,
      saveMoney,
      withdrawSavings,
      completeQuest,
    }),
    [
      state,
      hydrated,
      storageIssue,
      chooseName,
      updateAvatar,
      startVenture,
      restock,
      sellProduct,
      changePrice,
      saveMoney,
      withdrawSavings,
      completeQuest,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
