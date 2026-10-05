import React, { useEffect } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AvatarConfig } from '@/providers/GameProvider';

export function FounderAvatar({
  avatar,
  size = 144,
  animate = false,
}: {
  avatar: AvatarConfig;
  size?: number;
  animate?: boolean;
}) {
  const float = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  useEffect(() => {
    if (animate) {
      float.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 950 }),
          withTiming(0, { duration: 950 }),
        ),
        -1,
        false,
      );
    } else {
      float.value = withTiming(0, { duration: 180 });
    }
  }, [animate, float]);

  const body = (
    <Svg width={size} height={size} viewBox="0 0 128 144" accessibilityLabel="Custom BizQuest founder avatar">
      <Ellipse cx="64" cy="129" rx="43" ry="9" fill="#EADCCA" opacity="0.55" />
      <Path d="M25 137 Q26 105 48 101 L80 101 Q103 106 104 137 Z" fill={avatar.shirt} />
      <Path d="M53 98 L53 111 Q64 120 75 111 L75 98 Z" fill={avatar.skin} />
      <Ellipse cx="31" cy="68" rx="8" ry="12" fill={avatar.skin} />
      <Ellipse cx="97" cy="68" rx="8" ry="12" fill={avatar.skin} />
      <Ellipse cx="64" cy="67" rx="40" ry="46" fill={avatar.hair} />
      <Ellipse cx="64" cy="70" rx="33" ry="39" fill={avatar.skin} />
      <Path
        d="M30 61 Q28 29 54 23 Q82 14 98 41 Q103 50 98 64 Q91 54 84 47 Q71 55 51 49 Q41 55 30 68 Z"
        fill={avatar.hair}
      />
      <Path d="M34 52 Q45 42 53 31 Q50 48 41 56 Z" fill={avatar.hair} />
      <Ellipse cx="51" cy="69" rx="3.2" ry="4.2" fill="#332821" />
      <Ellipse cx="77" cy="69" rx="3.2" ry="4.2" fill="#332821" />
      <Circle cx="50" cy="68" r="1.1" fill="#FFFFFF" />
      <Circle cx="76" cy="68" r="1.1" fill="#FFFFFF" />
      <Path d="M58 82 Q64 86 70 82" fill="none" stroke="#A34E49" strokeWidth="2.6" strokeLinecap="round" />
      <Ellipse cx="44" cy="79" rx="5" ry="2.8" fill="#E88275" opacity="0.42" />
      <Ellipse cx="84" cy="79" rx="5" ry="2.8" fill="#E88275" opacity="0.42" />
      <Path d="M47 113 Q64 124 81 113" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.76" />
      {avatar.accessory === 'cap' ? (
        <>
          <Path d="M28 48 Q34 23 61 20 Q85 18 99 43 Q66 35 30 54 Z" fill="#F5BD3F" />
          <Path d="M39 49 Q72 39 102 49 Q85 61 46 55 Z" fill="#E6A52A" />
        </>
      ) : null}
      {avatar.accessory === 'glasses' ? (
        <>
          <Circle cx="51" cy="70" r="10" fill="none" stroke="#35536A" strokeWidth="2.7" />
          <Circle cx="77" cy="70" r="10" fill="none" stroke="#35536A" strokeWidth="2.7" />
          <Path d="M61 70 Q64 67 67 70" fill="none" stroke="#35536A" strokeWidth="2.5" />
        </>
      ) : null}
      {avatar.accessory === 'headband' ? (
        <Path d="M29 53 Q63 31 98 52" fill="none" stroke="#F2734E" strokeWidth="7" strokeLinecap="round" />
      ) : null}
      {avatar.accessory === 'bow' ? (
        <>
          <Path d="M79 36 Q67 26 72 18 Q84 20 88 29 Q96 19 104 20 Q106 32 93 38 Z" fill="#8970CB" />
          <Circle cx="88" cy="30" r="4" fill="#F5BD3F" />
        </>
      ) : null}
      <Rect x="60" y="120" width="8" height="9" rx="3" fill="#F5BD3F" />
    </Svg>
  );

  if (!animate) return body;
  return <Animated.View style={animatedStyle}>{body}</Animated.View>;
}
