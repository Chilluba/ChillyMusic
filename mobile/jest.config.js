module.exports = {
  preset: 'react-native', // Standard preset for React Native projects
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Keep babel-jest for JS/JSX if any
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Or point to your specific tsconfig if different
        babelConfig: true, // Use babel config for other transformations if needed
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Jest will automatically look for test files in __tests__ folders
  // or files with .test.ts(x) or .spec.ts(x) extensions.

  // Optional: Setup files, module name mappers if needed later
  // setupFilesAfterEnv: ['./jest-setup.js'],
  moduleNameMapper: {
    // For handling asset imports or module aliases
    // e.g., '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // transformIgnorePatterns is crucial for React Native testing with Jest.
  // It ensures that native modules and specific react-native libraries are transformed.
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-fs|react-native-video|uuid)',
    // Add other modules that need transformation if errors arise from them
  ],
};
