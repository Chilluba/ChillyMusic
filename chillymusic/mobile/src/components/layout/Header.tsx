import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DefaultTheme, Spacing, Typography } from '../../theme/theme';
import Icon from '../ui/Icon'; // Corrected path

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <Icon name="List" size={24} color={DefaultTheme.colors.textPrimary} onPress={() => console.log('Menu pressed')} />
      <Text style={styles.title}>ChillyMusic</Text>
      <View style={styles.rightIcons}>
        <Icon name="Moon" size={24} color={DefaultTheme.colors.textPrimary} onPress={() => console.log('Theme toggle pressed')} />
        <Icon name="Gear" size={24} color={DefaultTheme.colors.textPrimary} onPress={() => console.log('Settings pressed')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: Spacing.md,
    backgroundColor: DefaultTheme.colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: DefaultTheme.colors.border,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: DefaultTheme.colors.textPrimary,
    fontFamily: Typography.fontFamily.primary,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});

export default Header;
