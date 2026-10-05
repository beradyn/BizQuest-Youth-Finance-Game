import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppButton, BrandHeader, Page, PageHeading, Panel, RoundIcon, SectionHeading } from '@/components/GameUI';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';
import { BUSINESS_EVENTS, VENTURES, type Venture, type VentureId } from '@/constants/game-content';

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
    hireHelper,
    resolveBusinessEvent,
  } = useGame();
  const venture = VENTURES.find((item) => item.id === state.ventureId);
  const feedback = (success: boolean, message: string) => {
    if (success) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else void Haptics.selectionAsync();
    return message;
  };
  const [message, setMessage] = React.useState('');
  const [eventOpen, setEventOpen] = React.useState(false);
  const [eventMessage, setEventMessage] = React.useState('');
  const [eventError, setEventError] = React.useState('');

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
  const event = BUSINESS_EVENTS[state.eventCycle % BUSINESS_EVENTS.length]!;
  const customerMood = state.salePrice > venture.salePrice + 2
    ? 'That price is a bit high for me. Could you lower it?'
    : state.salePrice < venture.salePrice - 2
      ? 'What a deal! I might tell my friends.'
      : 'That looks great! I could go for one.';
  const makeSale = () => {
    if (state.salePrice > venture.salePrice + 2) {
      setMessage('A customer passed: “That price is a bit high for me.” Try lowering it to make a sale.');
      void Haptics.selectionAsync();
      return;
    }
    const sold = sellProduct();
    if (!sold) {
      setMessage(state.inventory <= 0 ? 'You are sold out! Restock before the next customer arrives.' : 'No sale just yet. Try a different price.');
      return;
    }
    const finishesWeek = state.weekSales === 4;
    const reactions = [
      '“So refreshing! I’ll tell my friends.”',
      '“This is exactly what I was looking for!”',
      '“Great value. I’ll come back next market day.”',
    ];
    setMessage(finishesWeek
      ? 'Five happy customers! You earned the Sales Star weekly badge and a 25 XP bonus.'
      : `A customer bought one! ${reactions[state.sold % reactions.length]}`);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Page>
      <BrandHeader />
      <PageHeading
        eyebrow="YOUR STARTUP"
        title={venture.name}
        description="Make a plan, choose a price, and learn from every sale."
      />

      <View style={styles.sceneCard}>
        <Image
          source={artForVenture(venture.id)}
          contentFit="cover"
          style={styles.sceneImage}
          accessibilityLabel={`${venture.name} illustrated business scene`}
        />
        <View style={[styles.sceneCaption, { backgroundColor: colors.card }]}>
          <Ionicons name="sunny" size={15} color={colors.accentForeground} />
          <Text style={[styles.sceneCaptionText, { color: colors.foreground }]}>
            {state.helperHired ? 'Your helper is ready for the next customer!' : 'Your shop is open. The neighborhood is waking up!'}
          </Text>
        </View>
      </View>

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

      <Panel tone="lavender" style={styles.weekPanel}>
        <View style={styles.weekTop}>
          <RoundIcon name="ribbon-outline" color={colors.violet} background={colors.card} size={42} />
          <View style={styles.weekCopy}>
            <Text style={[styles.weekTitle, { color: colors.foreground }]}>
              {`Shop level ${Math.floor(state.sold / 5) + 1} · ${state.weeksCompleted ? `market week ${state.weeksCompleted + 1}` : 'first sales sprint'}`}
            </Text>
            <Text style={[styles.weekDescription, { color: colors.mutedForeground }]}>
              {state.weeksCompleted} weeks finished · 5 sales earns a Sales Star
            </Text>
          </View>
          <Text style={[styles.weekCount, { color: colors.violet }]}>{state.weekSales}/5</Text>
        </View>
        <View style={[styles.weekTrack, { backgroundColor: colors.card }]}>
          <View style={[styles.weekFill, { backgroundColor: colors.violet, width: `${Math.max(4, state.weekSales * 20)}%` }]} />
        </View>
        <View style={styles.weekFooter}>
          <Text style={[styles.weekHint, { color: colors.inkSoft }]}>{state.sold} happy customers served</Text>
          <Text style={[styles.weekHint, { color: colors.violet }]}>+25 XP at 5</Text>
        </View>
      </Panel>

      <Panel tone="gold" style={styles.customerPanel}>
        <View style={styles.customerTop}>
          <View style={[styles.customerAvatar, { backgroundColor: colors.card }]}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.customerCopy}>
            <Text style={[styles.customerEyebrow, { color: colors.primary }]}>A NEIGHBOR IS SHOPPING</Text>
            <Text style={[styles.customerTitle, { color: colors.foreground }]}>{customerMood}</Text>
          </View>
          <Ionicons name="chatbubble-ellipses" size={19} color={colors.accentForeground} />
        </View>
        {message ? (
          <View style={[styles.actionMessage, { backgroundColor: colors.card }]}>
            <Ionicons name={message.includes('passed') || message.includes('sold out') ? 'chatbubble-ellipses' : 'checkmark-circle'} size={18} color={message.includes('passed') || message.includes('sold out') ? colors.primary : colors.mint} />
            <Text style={[styles.actionMessageText, { color: colors.secondaryForeground }]}>{message}</Text>
          </View>
        ) : null}
        <AppButton
          label={state.inventory > 0 ? 'Serve this customer' : 'Restock for the next customer'}
          icon={state.inventory > 0 ? 'basket-outline' : 'cart-outline'}
          compact
          disabled={state.inventory <= 0}
          testID="sell-product"
          onPress={makeSale}
        />
      </Panel>

      <SectionHeading title="Run your shop" />
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
          icon={state.helperHired ? 'people-outline' : 'person-add-outline'}
          title={state.helperHired ? 'Helper on shift' : 'Hire a helper'}
          detail={state.helperHired ? 'Earn +2 per sale together' : 'Spend 35 · +2 per sale'}
          tone="mint"
          disabled={state.helperHired || state.cash < 35}
          testID="hire-helper"
          onPress={() => setMessage(feedback(hireHelper(), 'A shop helper joined your team! You now earn 2 extra Biz Bucks per sale.'))}
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
            <Text style={[styles.savingsTitle, { color: colors.foreground }]}>Emergency fund</Text>
            <Text style={[styles.savingsDescription, { color: colors.mutedForeground }]}>
              Save Biz Bucks for surprise costs like a broken cooler or rainy market day.
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

      <Panel tone="orange" style={styles.eventPanel}>
        <View style={styles.eventHeading}>
          <RoundIcon name="warning-outline" color={colors.primary} background={colors.card} size={43} />
          <View style={styles.eventTitleWrap}>
            <Text style={[styles.eventOverline, { color: colors.primary }]}>FOUNDER DECISION</Text>
            <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
          </View>
        </View>
        <Text style={[styles.eventStory, { color: colors.inkSoft }]}>{event.story}</Text>
        {eventMessage ? (
          <View style={[styles.eventFeedback, { backgroundColor: colors.mintSoft }]}>
            <Ionicons name="checkmark-circle" size={19} color={colors.mint} />
            <Text style={[styles.eventFeedbackText, { color: colors.secondaryForeground }]}>{eventMessage}</Text>
          </View>
        ) : null}
        {eventError ? <Text style={[styles.eventError, { color: colors.destructive }]}>{eventError}</Text> : null}
        {eventOpen && !eventMessage ? event.choices.map((choice, index) => {
          const price = event.id === 'broken-cooler' && index === 0 ? 12
            : event.id === 'broken-cooler' && index === 2 ? 5
            : event.id === 'rainy-market' && index === 0 ? 8
            : event.id === 'supply-shortage' && index === 0 ? 16
            : 0;
          const usesFund = event.id === 'broken-cooler' && index === 0;
          const canAfford = usesFund ? state.savings >= price : state.cash >= price;
          return (
            <Pressable
              key={choice.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAfford }}
              disabled={!canAfford}
              onPress={() => {
                setEventError('');
                const result = resolveBusinessEvent(index);
                if (result) { setEventMessage(result); setEventOpen(false); }
                else setEventError(usesFund ? 'Your emergency fund needs more savings first. Choose a different plan.' : 'Your wallet needs a few more Biz Bucks for that choice. Choose another plan.');
              }}
              style={[styles.choiceCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: canAfford ? 1 : 0.55 }]}
            >
              <View style={[styles.choiceNumber, { backgroundColor: colors.goldSoft }]}>
                <Text style={[styles.choiceNumberText, { color: colors.accentForeground }]}>{index + 1}</Text>
              </View>
              <View style={styles.choiceCopy}>
                <Text style={[styles.choiceTitle, { color: colors.foreground }]}>{choice.label}</Text>
                <Text style={[styles.choiceDescription, { color: colors.mutedForeground }]}>{choice.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          );
        }) : null}
        {eventMessage ? (
          <AppButton label="Next surprise" icon="arrow-forward" compact variant="secondary" onPress={() => { setEventMessage(''); setEventError(''); }} />
        ) : !eventOpen ? (
          <AppButton label="Choose what to do" icon="bulb-outline" compact variant="light" onPress={() => setEventOpen(true)} />
        ) : null}
        {eventMessage ? <Text style={[styles.eventXp, { color: colors.violet }]}>+10 Biz Points · smart thinking!</Text> : null}
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
      <Image source={artForVenture(venture.id)} contentFit="cover" style={styles.ventureArtwork} accessibilityLabel={`${venture.name} illustration`} />
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

function artForVenture(id: VentureId) {
  if (id === 'lemonade') return require('../../assets/images/lemonade-hero.png');
  if (id === 'art') return require('../../assets/images/art-studio.png');
  if (id === 'bakes') return require('../../assets/images/bake-shop.png');
  return require('../../assets/images/plant-shop.png');
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
  ventureArtwork: { width: 74, height: 84, borderRadius: 15 },
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
  sceneCard: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', position: 'relative' },
  sceneImage: { width: '100%', height: 192 },
  sceneCaption: { minHeight: 41, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sceneCaptionText: { flex: 1, fontSize: 11, fontWeight: '800' },
  weekPanel: { gap: 10 },
  weekTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  weekCopy: { flex: 1, gap: 2 },
  weekTitle: { fontSize: 14, fontWeight: '900' },
  weekDescription: { fontSize: 10, lineHeight: 14 },
  weekCount: { fontSize: 15, fontWeight: '900' },
  weekTrack: { height: 9, borderRadius: 9, overflow: 'hidden' },
  weekFill: { height: '100%', borderRadius: 9 },
  weekFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  weekHint: { fontSize: 9, fontWeight: '800' },
  customerPanel: { gap: 11 },
  customerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customerAvatar: { width: 43, height: 43, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  customerCopy: { flex: 1, gap: 3 },
  customerEyebrow: { fontSize: 8, letterSpacing: 0.8, fontWeight: '900' },
  customerTitle: { fontSize: 12, lineHeight: 17, fontWeight: '800' },
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
  eventPanel: { gap: 12 },
  eventHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventTitleWrap: { flex: 1, gap: 3 },
  eventOverline: { fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  eventTitle: { fontSize: 16, fontWeight: '900' },
  eventStory: { fontSize: 12, lineHeight: 18 },
  choiceCard: { borderWidth: 1, borderRadius: 16, minHeight: 68, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  choiceNumber: { width: 27, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  choiceNumberText: { fontSize: 12, fontWeight: '900' },
  choiceCopy: { flex: 1, gap: 2 },
  choiceTitle: { fontSize: 12, fontWeight: '900' },
  choiceDescription: { fontSize: 10, lineHeight: 14 },
  eventFeedback: { borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  eventFeedbackText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  eventError: { fontSize: 11, lineHeight: 15, fontWeight: '700' },
  eventXp: { textAlign: 'center', fontSize: 10, fontWeight: '900' },
  ledgerSection: { gap: 7 },
  emptyLedger: { fontSize: 12, lineHeight: 18 },
  ledgerRow: { minHeight: 42, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ledgerLabel: { flex: 1, fontSize: 12, fontWeight: '700' },
  ledgerAmount: { fontSize: 13, fontWeight: '900' },
});
