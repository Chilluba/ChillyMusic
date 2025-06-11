import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { DefaultTheme, Spacing, Typography } from '../../theme/theme';
import Icon from '../ui/Icon';

type HeaderNavigationProp = StackNavigationProp<RootStackParamList>;

const Header: React.FC = () => {
  const navigation = useNavigation<HeaderNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={{width: 40}} /> {/* Placeholder for left icon or spacing */}
      <Text style={styles.title}>ChillyMusic</Text>
      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={() => navigation.navigate('Library')} style={styles.iconButton}>
            <Icon name="Bookmark" size={24} color={DefaultTheme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
            <Icon name="Gear" size={24} color={DefaultTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60, // Standard header height
    paddingHorizontal: Spacing.md,
    backgroundColor: DefaultTheme.colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: DefaultTheme.colors.border,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold as any, // Cast for now, ensure 'bold' is a valid FontWeight value in your Typography
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: Spacing.md, // 'gap' is not supported in all React Native versions without specific libraries
  },
  iconButton: {
    padding: Spacing.sm, // Increased padding for better touch area
    marginLeft: Spacing.xs, // Add some space between icons if gap is not used
  }
});

export default Header;
