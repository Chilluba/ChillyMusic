import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { DefaultTheme, Spacing } from '../../theme/theme'; // Adjusted path

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
}

// Simple placeholder icons
const iconMap: Record<string, string> = {
  List: '☰',
  Gear: '⚙️',
  Moon: '🌙',
  MagnifyingGlass: '🔍',
  Clock: '🕒',
  Fire: '🔥',
  Play: '▶️',
  Download: '⬇️',
  ArrowLeft: '←',
  DotsThree: '⋮',
  // Add more as needed
};

const Icon: React.FC<IconProps> = ({ name, size = 24, color = DefaultTheme.colors.textPrimary, onPress }) => {
  const iconChar = iconMap[name] || '?';
  const iconStyle = { fontSize: size, color };

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
    padding: Spacing.sm / 2, // Make touch target slightly larger
  },
});

export default Icon;
