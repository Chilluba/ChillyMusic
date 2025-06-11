import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../context/ThemeContext'; // Import useAppTheme
import Icon from '../ui/Icon';

type HeaderNavigationProp = StackNavigationProp<RootStackParamList>;

const Header: React.FC = () => {
  const { theme } = useAppTheme(); // Use theme from context
  const navigation = useNavigation<HeaderNavigationProp>();

  // Styles are now created inside the component or use a function to pass theme
  // This is a common pattern when styles depend on context or props.
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.backgroundPrimary, // Use theme color
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border, // Use theme color
    },
    title: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: theme.typography.fontWeight.bold as any,
      color: theme.colors.textPrimary, // Use theme color
      fontFamily: theme.typography.fontFamily.primary,
    },
    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      // gap: theme.spacing.md, // 'gap' might not be supported if not using a specific version or library
    },
    iconButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm, // Use marginLeft if 'gap' is not supported/used
    }
  });

  return (
    <View style={styles.container}>
      <View style={{width: 40}} />
      <Text style={styles.title}>ChillyMusic</Text>
      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={() => navigation.navigate('Library')} style={styles.iconButton}>
            <Icon name="Bookmark" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Downloads')} style={styles.iconButton}>
            <Icon name="DownloadQueue" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
          <Icon name="Gear" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
