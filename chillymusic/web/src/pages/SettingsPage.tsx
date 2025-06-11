import React from 'react';
import { useAppTheme, ThemePreference } from '../context/ThemeContext';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System Default', value: 'system' },
];

const SettingsPage: React.FC = () => {
  const { themePreference, setAppThemePreference } = useAppTheme();

  const handleSelectTheme = (selectedPref: ThemePreference) => {
    setAppThemePreference(selectedPref);
  };

  return (
    <div className='p-md bg-bg-primary text-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary min-h-[calc(100vh-60px)]'>
      <h1 className='text-h1 font-bold text-text-primary dark:text-dark-text-primary mb-lg'>Settings</h1>

      <section className='mb-lg'>
        <h2 className='text-h2 font-semibold text-text-secondary dark:text-dark-text-secondary mb-sm pb-xs border-b border-border-primary dark:border-dark-border-primary'>
          Appearance
        </h2>
        <div className='p-sm bg-bg-secondary dark:bg-dark-bg-secondary rounded-md shadow'>
          <h3 className='text-lg font-medium text-text-primary dark:text-dark-text-primary mb-sm'>Theme</h3>
          <div className='space-y-sm'>
            {THEME_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelectTheme(option.value)}
                className={`w-full text-left px-md py-sm rounded-md transition-colors duration-150 flex justify-between items-center
                            ${themePreference === option.value
                              ? 'bg-accent-primary text-white dark:bg-dark-accent-primary dark:text-white' // Assuming dark accent also uses white text
                              : 'bg-bg-tertiary hover:bg-bg-primary text-text-primary dark:bg-dark-bg-tertiary dark:hover:bg-dark-bg-primary dark:text-dark-text-primary'}`}
              >
                <span>{option.label}</span>
                {themePreference === option.value && (
                  // Ensure checkmark color contrasts with selected button background
                  <span className={`text-lg ${themePreference === option.value ? 'text-white dark:text-white' : 'text-text-primary dark:text-dark-text-primary'}`}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default SettingsPage;
