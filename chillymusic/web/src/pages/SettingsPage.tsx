import React, { useEffect } from 'react';
import { useAppTheme, ThemePreference } from '../context/ThemeContext'; // Assuming ThemeContext will be created for web
// import { saveThemePreference as saveWebThemePreference, getThemePreference as getWebThemePreference } from '../services/webSettingsService'; // Service calls handled by context

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System Default', value: 'system' },
];

const SettingsPage: React.FC = () => {
  const { themePreference, setAppThemePreference, currentTheme } = useAppTheme(); // Using currentTheme for styling if needed

  const handleSelectTheme = async (selectedPref: ThemePreference) => {
    setAppThemePreference(selectedPref);
  };

  // Tailwind classes automatically adapt based on the 'dark' class on the html element.
  // So, direct theme object usage for colors might not be needed if Tailwind is set up correctly.

  return (
    <div className='p-md bg-bg-primary text-text-primary min-h-[calc(100vh-60px)]'> {/* 60px for header height */}
      <h1 className='text-h1 font-bold text-text-primary mb-lg'>Settings</h1>

      <section className='mb-lg'>
        <h2 className='text-h2 font-semibold text-text-secondary mb-sm pb-xs border-b border-border-primary'>
          Appearance
        </h2>
        <div className='p-sm bg-bg-secondary rounded-md shadow'>
          <h3 className='text-lg font-medium text-text-primary mb-sm'>Theme</h3>
          <div className='space-y-sm'>
            {THEME_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelectTheme(option.value)}
                className={`w-full text-left px-md py-sm rounded-md transition-colors flex justify-between items-center
                            ${themePreference === option.value
                              ? 'bg-accent-primary text-white'
                              : 'bg-bg-tertiary hover:bg-opacity-70 text-text-primary'}`}
              >
                <span>{option.label}</span>
                {themePreference === option.value && (
                  <span className='text-lg'>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Add more settings sections here */}
    </div>
  );
};

export default SettingsPage;
