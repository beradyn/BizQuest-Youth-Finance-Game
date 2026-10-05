import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, BrandHeader, Page, PageHeading, Panel, RoundIcon } from '@/components/GameUI';
import { BADGES, QUESTS } from '@/constants/game-content';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/providers/GameProvider';

export default function LearnScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, completeQuest } = useGame();
  const [sessionQuestId, setSessionQuestId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const activeQuest =
    QUESTS.find((quest) => quest.id === sessionQuestId) ??
    QUESTS.find((quest) => !state.completedQuests.includes(quest.id));
  const doneCount = state.completedQuests.length;
  const earnedBadges = BADGES.filter((badge) => state.badges.includes(badge.id));

  const answer = (index: number) => {
    if (!activeQuest || selectedOption !== null) return;
    const correct = index === activeQuest.answerIndex;
    const earned = completeQuest(activeQuest.id, correct);
    setSessionQuestId(activeQuest.id);
    setSelectedOption(index);
    setAnswerCorrect(correct);
    setRewardEarned(earned);
    void Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  };

  const moveOn = () => {
    setSessionQuestId(null);
    setSelectedOption(null);
    setRewardEarned(false);
  };

  return (
    <Page>
      <BrandHeader />
      <PageHeading
        eyebrow="THE LEARNING TRAIL"
        title="Brain power, unlocked."
        description="Short quests turn real-world money choices into skills you can use."
      />

      <Panel tone="lavender" style={styles.progressCard}>
        <View style={styles.progressTop}>
          <RoundIcon name="school-outline" color={colors.violet} background={colors.card} size={46} />
          <View style={styles.progressCopy}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              {doneCount === QUESTS.length ? 'Trail complete!' : `${doneCount} of ${QUESTS.length} quests complete`}
            </Text>
            <Text style={[styles.progressDescription, { color: colors.mutedForeground }]}>
              Every answer earns 25 XP and helps your next decision.
            </Text>
          </View>
          <Text style={[styles.progressCount, { color: colors.violet }]}>{doneCount}/{QUESTS.length}</Text>
        </View>
        <View style={styles.questDots}>
          {QUESTS.map((quest, index) => (
            <View
              key={quest.id}
              style={[
                styles.questDot,
                {
                  backgroundColor: state.completedQuests.includes(quest.id)
                    ? colors.violet
                    : colors.card,
                },
              ]}
            >
              {state.completedQuests.includes(quest.id) ? (
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              ) : (
                <Text style={[styles.dotNumber, { color: colors.mutedForeground }]}>{index + 1}</Text>
              )}
            </View>
          ))}
          <View style={[styles.questLine, { backgroundColor: colors.card }]} />
        </View>
      </Panel>

      {activeQuest ? (
        <Panel tone="plain" style={styles.challengeCard}>
          <View style={styles.challengeHeading}>
            <View style={[styles.questNumber, { backgroundColor: colors.orangeSoft }]}>
              <Ionicons name="flash-outline" size={19} color={colors.primary} />
            </View>
            <View style={styles.challengeTitleWrap}>
              <Text style={[styles.challengeSkill, { color: colors.primary }]}>{activeQuest.skill}</Text>
              <Text style={[styles.challengeTitle, { color: colors.foreground }]}>{activeQuest.title}</Text>
            </View>
            <View style={[styles.rewardPill, { backgroundColor: colors.goldSoft }]}>
              <Ionicons name="sparkles" size={13} color={colors.accentForeground} />
              <Text style={[styles.rewardText, { color: colors.accentForeground }]}>25 XP</Text>
            </View>
          </View>
          <Text style={[styles.promptText, { color: colors.inkSoft }]}>{activeQuest.prompt}</Text>
          <View style={styles.optionList}>
            {activeQuest.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isAnswer = activeQuest.answerIndex === index;
              const revealedCorrect = selectedOption !== null && isAnswer;
              const revealedWrong = selectedOption !== null && isSelected && !answerCorrect;
              const backgroundColor = revealedCorrect
                ? colors.mintSoft
                : revealedWrong
                  ? colors.orangeSoft
                  : colors.card;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: selectedOption !== null }}
                  testID={`answer-${activeQuest.id}-${index}`}
                  disabled={selectedOption !== null}
                  onPress={() => answer(index)}
                  style={[
                    styles.answerOption,
                    { backgroundColor, borderColor: isSelected || revealedCorrect ? 'transparent' : colors.border },
                  ]}
                >
                  <View style={[styles.answerLetter, { backgroundColor: colors.background }]}>
                    <Text style={[styles.answerLetterText, { color: colors.inkSoft }]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.answerText, { color: colors.foreground }]}>{option}</Text>
                  {revealedCorrect ? <Ionicons name="checkmark-circle" size={21} color={colors.mint} /> : null}
                  {revealedWrong ? <Ionicons name="close-circle" size={21} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
          {selectedOption !== null ? (
            <View
              style={[
                styles.feedbackBox,
                { backgroundColor: answerCorrect ? colors.mintSoft : colors.goldSoft },
              ]}
            >
              <View style={styles.feedbackHeading}>
                <Ionicons
                  name={answerCorrect ? 'checkmark-circle' : 'bulb-outline'}
                  size={20}
                  color={answerCorrect ? colors.mint : colors.accentForeground}
                />
                <Text style={[styles.feedbackTitle, { color: answerCorrect ? colors.secondaryForeground : colors.accentForeground }]}>
                  {answerCorrect ? 'Brilliant move!' : 'Good try — now you know.'}
                </Text>
              </View>
              <Text style={[styles.feedbackText, { color: colors.inkSoft }]}>{activeQuest.explanation}</Text>
              {rewardEarned ? (
                <Text style={[styles.rewardEarned, { color: colors.violet }]}>
                  +25 XP · +{answerCorrect ? 15 : 5} Biz Points
                </Text>
              ) : (
                <Text style={[styles.rewardEarned, { color: colors.mutedForeground }]}>
                  You already earned this quest reward.
                </Text>
              )}
              <AppButton
                label={doneCount === QUESTS.length ? 'See my badges' : 'Next quest'}
                icon="arrow-forward"
                compact
                testID="next-quest"
                onPress={moveOn}
              />
            </View>
          ) : null}
        </Panel>
      ) : (
        <Panel tone="gold" style={styles.completeCard}>
          <RoundIcon name="trophy-outline" color={colors.accentForeground} background={colors.card} size={54} />
          <Text style={[styles.completeTitle, { color: colors.foreground }]}>You cleared the trail!</Text>
          <Text style={[styles.completeCopy, { color: colors.inkSoft }]}>
            Budgeting, saving, and profit — you practiced the moves real founders use.
          </Text>
          <AppButton
            label="Review my badges"
            icon="arrow-forward"
            variant="light"
            onPress={() => router.navigate('/avatar')}
          />
        </Panel>
      )}

      <View style={styles.badgeSection}>
        <Text style={[styles.badgeHeading, { color: colors.foreground }]}>Your reward shelf</Text>
        {earnedBadges.length === 0 ? (
          <Panel tone="plain" style={styles.emptyBadges}>
            <Ionicons name="ribbon-outline" size={22} color={colors.gold} />
            <Text style={[styles.emptyBadgeText, { color: colors.mutedForeground }]}>
              Finish a quest to earn your first badge.
            </Text>
          </Panel>
        ) : (
          <View style={styles.badgeRow}>
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
    </Page>
  );
}

const styles = StyleSheet.create({
  progressCard: { gap: 14 },
  progressTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  progressCopy: { flex: 1, gap: 3 },
  progressTitle: { fontSize: 16, fontWeight: '900' },
  progressDescription: { fontSize: 11, lineHeight: 15 },
  progressCount: { fontSize: 16, fontWeight: '900' },
  questDots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questDot: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dotNumber: { fontSize: 10, fontWeight: '900' },
  questLine: { position: 'absolute', left: 18, right: 18, height: 2 },
  challengeCard: { gap: 15 },
  challengeHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  questNumber: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  challengeTitleWrap: { flex: 1, gap: 2 },
  challengeSkill: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  challengeTitle: { fontSize: 16, fontWeight: '900' },
  rewardPill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardText: { fontSize: 10, fontWeight: '900' },
  promptText: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  optionList: { gap: 8 },
  answerOption: { minHeight: 53, borderRadius: 16, borderWidth: 1, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  answerLetter: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  answerLetterText: { fontSize: 11, fontWeight: '900' },
  answerText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  feedbackBox: { padding: 13, borderRadius: 17, gap: 9 },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  feedbackTitle: { fontSize: 14, fontWeight: '900' },
  feedbackText: { fontSize: 12, lineHeight: 18 },
  rewardEarned: { fontSize: 11, fontWeight: '900' },
  completeCard: { alignItems: 'center', gap: 11, paddingVertical: 25 },
  completeTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  completeCopy: { fontSize: 13, textAlign: 'center', lineHeight: 19, maxWidth: 280 },
  badgeSection: { gap: 10 },
  badgeHeading: { fontSize: 17, fontWeight: '900' },
  emptyBadges: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  emptyBadgeText: { flex: 1, fontSize: 12, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeCard: { width: '48%', minHeight: 105, padding: 12, gap: 5 },
  badgeName: { fontSize: 13, fontWeight: '900' },
  badgeDetail: { fontSize: 10, lineHeight: 14 },
});
