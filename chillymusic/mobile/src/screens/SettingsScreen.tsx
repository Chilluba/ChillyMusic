import React, { useEffect } from 'react'; // Removed useState, isLoading as context handles it
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
// import { DefaultTheme, Spacing, Typography, BorderRadius } from '../theme/theme'; // No longer directly use DefaultTheme for colors
import { ThemePreference } from '../services/settingsService'; // Keep this type
import { useAppTheme } from '../context/ThemeContext'; // Import context hook
import Icon from '../components/ui/Icon'; // Ensure Icon is imported

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;
interface Props { navigation: SettingsScreenNavigationProp; }

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System Default', value: 'system' },
];

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, themePreference, setAppThemePreference } = useAppTheme(); // Use theme from context

  // No need for isLoading or local currentTheme state, context provides themePreference and handles loading internally.

  const handleSelectTheme = async (selectedPref: ThemePreference) => {
    setAppThemePreference(selectedPref);
    // Alert.alert('Theme Updated', `Theme set to: ${selectedPref}`); // Optional: feedback, removed as per prompt's direction
  };

  // Styles are now a function of the theme from context
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary, padding: theme.spacing.md },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.backgroundPrimary }, // For potential future loading state
    headerTitle: {
      fontSize: theme.typography.fontSize.display,
      fontWeight: theme.typography.fontWeight.bold as any,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xl,
      fontFamily: theme.typography.fontFamily.primary,
    },
    section: {
      marginBottom: theme.spacing.lg
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: theme.typography.fontWeight.medium as any, // Use medium if '600' is not directly in fontWeight type
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      fontFamily: theme.typography.fontFamily.primary,
    },
    optionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.accentPrimary
    },
    optionText: {
      fontSize: theme.typography.fontSize.bodyLarge,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.primary,
    },
    optionTextSelected: {
      color: theme.colors.white, // Assuming good contrast with accentPrimary
      fontWeight: theme.typography.fontWeight.medium as any,
      fontFamily: theme.typography.fontFamily.primary,
    },
    selectedIndicator: {
      fontSize: theme.typography.fontSize.bodyLarge,
      color: theme.colors.white,
      fontFamily: theme.typography.fontFamily.primary,
    }
  });

  // The ThemeProvider handles initial loading of preference, so SettingsScreen doesn't need its own isLoading.
  // If context didn't have an initial value or if direct async check was still desired here,
  // then isLoading state would be relevant. For now, relying on context's readiness.

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Appearance</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        {THEME_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[ styles.optionButton, themePreference === option.value && styles.optionButtonSelected ]}
            onPress={() => handleSelectTheme(option.value)}
          >
            <Text style={[ styles.optionText, themePreference === option.value && styles.optionTextSelected ]}>
              {option.label}
            </Text>
            {themePreference === option.value && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Manage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage</Text>
        <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate('Downloads')}
        >
            <Text style={styles.optionText}>View Downloads</Text>
            <Icon name='Download' size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsScreen;
