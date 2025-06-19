import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-text-primary">Settings</h1>
      <p className="text-text-secondary">This is a placeholder for the Settings Page.</p>
      <p className="text-text-secondary mt-2">Theme, language, and other preferences would be managed here.</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Appearance</h2>
        <div className="space-y-2">
          <div>
            <label htmlFor="theme-select" className="block text-sm font-medium text-text-secondary">Theme</label>
            <select id="theme-select" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm rounded-md bg-background-tertiary text-text-primary">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
