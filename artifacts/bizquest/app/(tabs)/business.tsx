import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppButton, BrandHeader, Page, PageHeading, Panel, RoundIcon, SectionHeading } from '@/components/GameUI';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';
import { VENTURES, type Venture, type VentureId } from '@/constants/game-content';

export default function BusinessScreen() {
  const colors = useColors();
  const router = useRouter();
  const {
    state,
    startVenture,
    restock,
    sellProduct,
    changePrice,
    saveMoney,
    withdrawSavings,
  } = useGame();
  const venture = VENTURES.find((item) => item.id === state.ventureId);
  const feedback = (success: boolean, message: string) => {
    if (success) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else void Haptics.selectionAsync();
    return message;
  };
  const [message, setMessage] = React.useState('');

  if (!venture) {
    return (
      <Page>
        <BrandHeader />
        <PageHeading
          eyebrow="CHOOSE YOUR QUEST"
          title="What will you build?"
          description="Pick an idea, then use your 120 Biz Bucks starter grant to get it moving."
        />
        <View style={[styles.practiceNote, { backgroundColor: colors.goldSoft }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accentForeground} />
          <Text style={[styles.practiceNoteText, { color: colors.accentForeground }]}>
            Practice money only. Your choices help you learn — nothing is bought for real.
          </Text>
        </View>
        <View style={styles.ventureList}>
          {VENTURES.map((item) => (
            <VentureChoice
              key={item.id}
              venture={item}
              onChoose={() => {
                startVenture(item.id as VentureId);
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
          ))}
        </View>
        <AppButton
          label="Explore money quests first"
          icon="arrow-forward"
          variant="outline"
          onPress={() => router.navigate('/learn')}
        />
      </Page>
    );
  }

  const restockCost = venture.unitCost * 4;
  const profitPerItem = state.salePrice - venture.unitCost;

  return (
    <Page>
      <BrandHeader />
      <PageHeading
        eyebrow="YOUR STARTUP"
        title={venture.name}
        description="Make a plan, choose a price, and learn from every sale."
      />

      <View style={styles.moneyRow}>
        <MoneyTile
          title="READY TO SPEND"
          value={state.cash}
          icon="wallet-outline"
          tone="gold"
        />
        <MoneyTile
          title="SAVED FOR LATER"
          value={state.savings}
          icon="lock-closed-outline"
          tone="mint"
        />
      </View>

      <Panel tone="orange" style={styles.productPanel}>
        <View style={styles.productHeader}>
          <RoundIcon
            name={venture.icon}
            color={colors.primary}
            background={colors.card}
            size={49}
          />
          <View style={styles.productText}>
            <Text style={[styles.productOverline, { color: colors.primary }]}>YOUR PRODUCT</Text>
            <Text style={[styles.productName, { color: colors.foreground }]}>{venture.product}</Text>
            <Text style={[styles.productDetails, { color: colors.mutedForeground }]}>
              {state.inventory} in stock · {state.sold} sold
            </Text>
          </View>
          <View style={[styles.stockPill, { backgroundColor: colors.card }]}>
            <Ionicons name="cube-outline" size={15} color={colors.inkSoft} />
            <Text style={[styles.stockCount, { color: colors.inkSoft }]}>{state.inventory}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.pricingRow}>
          <View style={styles.priceBlock}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>COST TO MAKE</Text>
            <Text style={[styles.priceValue, { color: colors.foreground }]}>{venture.unitCost}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.mutedForeground} />
          <View style={styles.priceBlock}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>SELL FOR</Text>
            <View style={styles.priceAdjust}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lower product price"
                testID="price-lower"
                onPress={() => changePrice(-1)}
                style={[styles.adjustButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name="remove" size={15} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.priceValue, { color: colors.foreground }]}>{state.salePrice}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Raise product price"
                testID="price-raise"
                onPress={() => changePrice(1)}
                style={[styles.adjustButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name="add" size={15} color={colors.foreground} />
              </Pressable>
            </View>
          </View>
          <View style={[styles.profitChip, { backgroundColor: colors.mintSoft }]}>
            <Text style={[styles.profitValue, { color: colors.mint }]}>+{profitPerItem}</Text>
            <Text style={[styles.profitLabel, { color: colors.mint }]}>EACH</Text>
          </View>
        </View>
        <Text style={[styles.moneyDefinition, { color: colors.inkSoft }]}>
          Biz Bucks · a practice game, not real money
        </Text>
      </Panel>

      <SectionHeading title="Run your shop" />
      {message ? (
        <View style={[styles.actionMessage, { backgroundColor: colors.mintSoft }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.mint} />
          <Text style={[styles.actionMessageText, { color: colors.secondaryForeground }]}>{message}</Text>
        </View>
      ) : null}
      <View style={styles.actionRow}>
        <ActionCard
          icon="cart-outline"
          title="Restock 4"
          detail={`Spend ${restockCost} · cost ${venture.unitCost} each`}
          tone="blue"
          disabled={state.cash < restockCost}
          testID="restock-products"
          onPress={() => setMessage(feedback(restock(), 'Four products added to your shelf.'))}
        />
        <ActionCard
          icon="pricetag-outline"
          title="Make a sale"
          detail={`Earn ${state.salePrice} · ${state.inventory} ready`}
          tone="mint"
          disabled={state.inventory <= 0}
          testID="sell-product"
          onPress={() => setMessage(feedback(sellProduct(), 'Sale made! Your cash is growing.'))}
        />
      </View>

      <Panel tone="plain" style={styles.savingsPanel}>
        <View style={styles.savingsCopy}>
          <RoundIcon
            name="lock-closed-outline"
            color={colors.mint}
            background={colors.mintSoft}
            size={42}
          />
          <View style={styles.savingsText}>
            <Text style={[styles.savingsTitle, { color: colors.foreground }]}>Build your safety stash</Text>
            <Text style={[styles.savingsDescription, { color: colors.mutedForeground }]}>
              Save 10 before you spend. Future-you will thank you.
            </Text>
          </View>
        </View>
        <View style={styles.savingsActions}>
          <AppButton
            label="Save 10"
            icon="arrow-down"
            variant="secondary"
            compact
            disabled={state.cash < 10}
            testID="save-money"
            onPress={() => setMessage(feedback(saveMoney(), '10 Biz Bucks tucked away for later.'))}
          />
          <AppButton
            label="Take out 10"
            icon="arrow-up"
            variant="outline"
            compact
            disabled={state.savings < 10}
            testID="withdraw-savings"
            onPress={() => setMessage(feedback(withdrawSavings(), '10 Biz Bucks moved back to your wallet.'))}
          />
        </View>
      </Panel>

      <View style={styles.ledgerSection}>
        <SectionHeading title="Money trail" />
        {state.ledger.length === 0 ? (
          <Text style={[styles.emptyLedger, { color: colors.mutedForeground }]}>
            Your first money move will show up here.
          </Text>
        ) : (
          state.ledger.slice(0, 4).map((entry) => (
            <View key={entry.id} style={[styles.ledgerRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.ledgerLabel, { color: colors.inkSoft }]}>{entry.label}</Text>
              <Text
                style={[
                  styles.ledgerAmount,
                  { color: entry.amount < 0 ? colors.primary : colors.mint },
                ]}
              >
                {entry.amount > 0 ? '+' : '−'}{Math.abs(entry.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </Page>
  );
}

function VentureChoice({ venture, onChoose }: { venture: Venture; onChoose: () => void }) {
  const colors = useColors();
  const tone = {
    gold: { bg: colors.goldSoft, icon: colors.accentForeground },
    orange: { bg: colors.orangeSoft, icon: colors.primary },
    blue: { bg: colors.blueSoft, icon: colors.blue },
    mint: { bg: colors.mintSoft, icon: colors.mint },
  }[venture.tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Start a ${venture.name}`}
      testID={`choose-${venture.id}`}
      onPress={onChoose}
      style={({ pressed }) => [
        styles.ventureChoice,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.83 : 1 },
      ]}
    >
      <RoundIcon name={venture.icon} color={tone.icon} background={tone.bg} size={48} />
      <View style={styles.ventureCopy}>
        <Text style={[styles.ventureName, { color: colors.foreground }]}>{venture.name}</Text>
        <Text style={[styles.ventureDescription, { color: colors.mutedForeground }]}>{venture.description}</Text>
        <Text style={[styles.ventureProduct, { color: colors.inkSoft }]}>
          Make {venture.product.toLowerCase()} · costs {venture.unitCost} · sell for {venture.salePrice}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.mutedForeground} />
    </Pressable>
  );
}

function MoneyTile({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: 'wallet-outline' | 'lock-closed-outline';
  tone: 'gold' | 'mint';
}) {
  const colors = useColors();
  const tint = tone === 'gold'
    ? { bg: colors.goldSoft, fg: colors.accentForeground }
    : { bg: colors.mintSoft, fg: colors.mint };
  return (
    <Panel tone="plain" style={styles.moneyTile}>
      <View style={styles.moneyTileTop}>
        <Ionicons name={icon} size={17} color={tint.fg} />
        <Text style={[styles.moneyTileLabel, { color: colors.mutedForeground }]}>{title}</Text>
      </View>
      <View style={styles.moneyAmountRow}>
        <Text style={[styles.moneyValue, { color: colors.foreground }]}>{value}</Text>
        <View style={[styles.buckCoin, { backgroundColor: tint.bg }]}>
          <Ionicons name="sparkles" size={12} color={tint.fg} />
        </View>
      </View>
      <Text style={[styles.moneyUnit, { color: colors.mutedForeground }]}>Biz Bucks</Text>
    </Panel>
  );
}

function ActionCard({
  icon,
  title,
  detail,
  tone,
  disabled,
  testID,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  tone: 'blue' | 'mint';
  disabled: boolean;
  testID: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const theme = tone === 'blue'
    ? { bg: colors.blueSoft, fg: colors.blue }
    : { bg: colors.mintSoft, fg: colors.mint };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
      ]}
    >
      <RoundIcon name={icon} color={theme.fg} background={theme.bg} size={40} />
      <Text style={[styles.actionTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.actionDetail, { color: colors.mutedForeground }]}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  practiceNote: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  practiceNoteText: { flex: 1, fontSize: 11, fontWeight: '700', lineHeight: 16 },
  ventureList: { gap: 10 },
  ventureChoice: { borderWidth: 1, borderRadius: 21, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 112 },
  ventureCopy: { flex: 1, gap: 3 },
  ventureName: { fontSize: 15, fontWeight: '900' },
  ventureDescription: { fontSize: 11, lineHeight: 15 },
  ventureProduct: { marginTop: 2, fontSize: 10, fontWeight: '800' },
  moneyRow: { flexDirection: 'row', gap: 10 },
  moneyTile: { flex: 1, padding: 14, gap: 4 },
  moneyTileTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moneyTileLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  moneyAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moneyValue: { fontSize: 26, lineHeight: 30, fontWeight: '900', letterSpacing: -0.7 },
  moneyUnit: { fontSize: 10, fontWeight: '700' },
  buckCoin: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  productPanel: { gap: 12 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productText: { flex: 1, gap: 2 },
  productOverline: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  productName: { fontSize: 17, fontWeight: '900' },
  productDetails: { fontSize: 11 },
  stockPill: { borderRadius: 14, minWidth: 45, height: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  stockCount: { fontSize: 13, fontWeight: '900' },
  divider: { height: 1, opacity: 0.65 },
  pricingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  priceBlock: { alignItems: 'center', gap: 3 },
  priceLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  priceValue: { fontSize: 20, fontWeight: '900' },
  priceAdjust: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  adjustButton: { width: 23, height: 23, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  profitChip: { minWidth: 46, minHeight: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  profitValue: { fontSize: 14, fontWeight: '900' },
  profitLabel: { fontSize: 7, fontWeight: '900' },
  moneyDefinition: { textAlign: 'center', fontSize: 9, fontWeight: '700' },
  actionMessage: { borderRadius: 13, padding: 11, flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionMessageText: { flex: 1, fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, minHeight: 128, borderRadius: 21, borderWidth: 1, padding: 13, alignItems: 'flex-start', justifyContent: 'center', gap: 7 },
  actionTitle: { fontSize: 14, fontWeight: '900' },
  actionDetail: { fontSize: 10, lineHeight: 14 },
  savingsPanel: { gap: 13 },
  savingsCopy: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  savingsText: { flex: 1, gap: 3 },
  savingsTitle: { fontSize: 15, fontWeight: '900' },
  savingsDescription: { fontSize: 11, lineHeight: 16 },
  savingsActions: { flexDirection: 'row', gap: 8 },
  ledgerSection: { gap: 7 },
  emptyLedger: { fontSize: 12, lineHeight: 18 },
  ledgerRow: { minHeight: 42, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ledgerLabel: { flex: 1, fontSize: 12, fontWeight: '700' },
  ledgerAmount: { fontSize: 13, fontWeight: '900' },
});
