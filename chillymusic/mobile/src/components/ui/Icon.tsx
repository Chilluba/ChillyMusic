import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { DefaultTheme, Spacing } from '../theme/theme'; // Ensure Spacing is imported if used

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
}

const iconMap: Record<string, string> = {
  List: '☰',
  Gear: '⚙️',
  Moon: '🌙',
  MagnifyingGlass: '🔍',
  Clock: '🕒',
  Fire: '🔥',
  Play: '▶️',
  Pause: '❚❚',
  Download: '⬇️',
  DownloadQueue: '📥', // Added DownloadQueue
  ArrowLeft: '←',
  DotsThree: '⋮',
  Close: '✕',
  Bookmark: '🔖',
  SkipBack: '⏮️',
  SkipForward: '⏭️',
  Repeat: '🔁',
  RepeatOne: '🔁¹',
  Heart: '❤️',
  HeartOutline: '♡',
  PlaylistAdd: '➕🎶',
  Check: '✓',
  Error: '⚠️',
};

const Icon: React.FC<IconProps> = ({ name, size = 24, color = DefaultTheme.colors.textPrimary, onPress }) => {
  const iconChar = iconMap[name] || '?';
  const iconStyle = { fontSize: size, color, fontFamily: DefaultTheme.typography.fontFamily.primary };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <Text style={iconStyle}>{iconChar}</Text>
      </TouchableOpacity>
    );
  }
  return <Text style={iconStyle}>{iconChar}</Text>;
};

const styles = StyleSheet.create({
  touchable: {
    // padding: Spacing.sm / 2, // Example, if Spacing is needed
  },
});

export default Icon;
