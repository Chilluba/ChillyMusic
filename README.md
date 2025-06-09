# 🎵 ChillyMusic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A clean, cross-platform music streaming and download application built for learning modern full-stack development. ChillyMusic allows users to search, stream, and download music content for personal and educational use.

> **⚠️ Educational Project Notice**  
> This is a personal learning project created to explore full-stack development, API integration, and cross-platform app development. Not intended for commercial use.

## ✨ Features

### 🔍 **Music Discovery**
- Fast, intelligent music search powered by YouTube Data API
- Search by song title, artist name, or album
- Trending music recommendations
- Search history and suggestions

### 🎧 **Streaming & Playback**
- High-quality audio/video streaming
- Background audio playback
- Intuitive player controls with seek functionality
- Queue management and continuous playback

### 📱 **Cross-Platform**
- Native mobile apps for iOS and Android
- Responsive web application
- Consistent experience across all platforms
- Offline functionality for downloaded content

### 💾 **Download Management**
- Download MP3 (audio) in multiple qualities: 128kbps, 192kbps, 320kbps
- Download MP4 (video) in various resolutions: 360p, 720p, 1080p
- Smart download queue with progress tracking
- Organized media library with sorting and filtering

### 🎨 **Modern UI/UX**
- Clean, minimalist design
- Dark and light theme support
- Responsive design for all screen sizes
- Accessibility-compliant interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **React Native CLI** (for mobile development)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Python 3.8+** (for yt-dlp integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chillymusic.git
   cd chillymusic
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install mobile app dependencies
   cd mobile
   npm install
   cd ios && pod install && cd .. # iOS only
   cd ..
   
   # Install web app dependencies
   cd web
   npm install
   cd ..
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in respective directories:
   
   **Backend (.env)**
   ```env
   PORT=3001
   NODE_ENV=development
   YOUTUBE_API_KEY=your_youtube_api_key_here
   DATABASE_URL=sqlite:./dev.db
   REDIS_URL=redis://localhost:6379
   ```
   
   **Mobile (.env)**
   ```env
   API_BASE_URL=http://localhost:3001
   ```
   
   **Web (.env)**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Servers**
   
   **Backend API:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Web Application:**
   ```bash
   cd web
   npm run dev
   ```
   
   **Mobile Application:**
   ```bash
   cd mobile
   
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## 🏗️ Project Structure

```
chillymusic/
├── 📱 mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/          # App screens/pages
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API services and utilities
│   │   ├── store/           # Redux store and slices
│   │   └── utils/           # Helper functions
│   ├── android/             # Android-specific files
│   ├── ios/                 # iOS-specific files
│   └── package.json
│
├── 🌐 web/                   # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Web pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── ⚙️ backend/               # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── models/         # Database models (Prisma)
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── package.json
│
├── 📚 docs/                  # Project documentation
│   ├── API.md             # API documentation
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── CONTRIBUTING.md    # Contribution guidelines
│
├── 🧪 tests/                 # Shared test utilities
└── 📄 package.json          # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **Mobile**: React Native 0.72+ with TypeScript
- **Web**: React 18 + Vite + TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: React Native StyleSheet, Tailwind CSS (web)
- **Navigation**: React Navigation (mobile), React Router (web)

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Language**: TypeScript
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Caching**: Redis
- **Media Processing**: yt-dlp

### Development Tools
- **Build Tools**: Metro (mobile), Vite (web)
- **Testing**: Jest, React Testing Library, Supertest
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

## 📱 Platform Support

### Mobile Applications
- **iOS**: 12.0+ (iPhone 6s and newer)
- **Android**: API 24+ (Android 7.0 and newer)

### Web Application
- **Chrome**: 90+
- **Safari**: 14+
- **Firefox**: 88+
- **Edge**: 90+

## 📖 API Documentation

### Core Endpoints

#### Search Music
```http
GET /api/search?q={query}&limit={number}
```

**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "title": "string",
      "channel": "string",
      "duration": 0,
      "thumbnail": "string",
      "videoId": "string"
    }
  ],
  "total": 0
}
```

#### Get Media Info
```http
GET /api/media/{videoId}/info
```

#### Request Download
```http
POST /api/download
Content-Type: application/json

{
  "videoId": "string",
  "format": "mp3|mp4",
  "quality": "string"
}
```

**Full API documentation**: [API.md](docs/API.md)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Coverage Targets
- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Primary user journeys

## 🚀 Deployment

### Development
- **Backend**: Local Node.js server
- **Mobile**: Expo Go or device/simulator
- **Web**: Vite dev server

### Production
- **Backend**: Railway/Render
- **Web**: Vercel/Netlify
- **Mobile**: App Store/Google Play (manual submission)

**Detailed deployment guide**: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🎯 Performance Targets

- **App Launch**: < 2 seconds
- **Search Response**: < 3 seconds
- **Playback Start**: < 5 seconds
- **Memory Usage**: < 200MB during normal operation
- **Bundle Size**: < 10MB (mobile), < 2MB (web)

## 🔒 Privacy & Legal

### Data Handling
- **No User Accounts**: Completely anonymous usage
- **Local Storage Only**: All user data stored locally on device
- **Minimal Analytics**: Only essential performance metrics
- **No Personal Data**: Zero collection of personal information

### Content & Copyright
- **Educational Use**: Project created for learning purposes only
- **Fair Use Compliance**: All usage falls under educational fair use
- **No Commercial Distribution**: Not intended for commercial use
- **API Compliance**: Strict adherence to YouTube API terms of service

### Legal Disclaimer
This application is provided "as is" for educational purposes. Users are responsible for ensuring their use complies with local laws and regulations. The developers assume no liability for misuse of the application.

## 🤝 Contributing

We welcome contributions from the community! This project is designed to be a learning resource for developers interested in full-stack development.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Keep commits atomic and write descriptive commit messages

**Full contributing guide**: [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 🎓 Learning Objectives

This project demonstrates proficiency in:

- **Cross-Platform Development**: React Native and React web development
- **Backend API Development**: RESTful API design with Node.js
- **Database Design**: Data modeling and optimization
- **State Management**: Complex app state with Redux
- **API Integration**: Third-party service integration
- **Testing**: Comprehensive testing strategies
- **DevOps**: CI/CD pipelines and deployment
- **UI/UX Design**: Modern interface design principles

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Basic search functionality
- [x] Music playback
- [x] Download management
- [x] Cross-platform deployment

### Phase 2: Enhancement 🚧
- [ ] Playlist management
- [ ] Advanced search filters
- [ ] Offline mode improvements
- [ ] Performance optimizations

### Phase 3: Advanced Features 📋
- [ ] Social sharing capabilities
- [ ] Audio effects and equalizer
- [ ] Smart recommendations
- [ ] Cloud synchronization

### Phase 4: Platform Expansion 🔮
- [ ] Desktop application (Electron)
- [ ] Browser extension
- [ ] Smart TV support
- [ ] Voice control integration

## 📊 Project Stats

- **Lines of Code**: ~15,000+ (TypeScript/JavaScript)
- **Components**: 50+ reusable UI components  
- **API Endpoints**: 12 RESTful endpoints
- **Test Coverage**: 80%+ across all modules
- **Supported Platforms**: iOS, Android, Web
- **Development Time**: 16 weeks (planned)

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Metro cache (React Native)
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install
```

**iOS Build Issues**
```bash
cd ios && pod install
npx react-native run-ios --simulator="iPhone 14"
```

**Android Build Issues**
```bash
cd android && ./gradlew clean
npx react-native run-android
```

**API Connection Issues**
- Ensure backend server is running on correct port
- Check environment variables are properly set
- Verify YouTube API key is valid and has proper quotas

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/chillymusic/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/chillymusic/discussions)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 ChillyMusic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **YouTube Data API** for providing music search capabilities
- **yt-dlp** community for excellent media extraction tools
- **React Native** and **React** teams for amazing frameworks
- **Open Source Community** for countless libraries and tools
- **Stack Overflow** and developer communities for guidance and support

---

**⭐ If this project helped you learn something new, please consider giving it a star!**

---

*Built with ❤️ for the developer community*
