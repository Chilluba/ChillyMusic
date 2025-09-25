# ChillyMusic - Complete UI/UX Design Document

## Overview
ChillyMusic is a cross-platform music streaming and download app that provides YouTube-based music discovery with seamless playback and download capabilities. This document provides comprehensive design specifications for mobile-first implementation with web responsiveness.

## Design System

### Color Palette

#### Dark Theme (Primary)
- **Background Primary**: `#0D1117` (Deep dark)
- **Background Secondary**: `#161B22` (Card backgrounds)
- **Background Tertiary**: `#21262D` (Input fields, elevated surfaces)
- **Text Primary**: `#F0F6FC` (Main text)
- **Text Secondary**: `#8B949E` (Subtitles, descriptions)
- **Text Muted**: `#6E7681` (Placeholders, inactive)
- **Accent Primary**: `#2DA44E` (Primary actions, play buttons)
- **Accent Secondary**: `#1F6FEB` (Download buttons, links)
- **Border**: `#30363D` (Dividers, card borders)
- **Error**: `#F85149` (Error states)
- **Warning**: `#D29922` (Warnings)

#### Light Theme
- **Background Primary**: `#FFFFFF`
- **Background Secondary**: `#F6F8FA`
- **Background Tertiary**: `#EAEEF2`
- **Text Primary**: `#24292F`
- **Text Secondary**: `#656D76`
- **Text Muted**: `#8C959F`
- **Accent Primary**: `#2DA44E`
- **Accent Secondary**: `#0969DA`
- **Border**: `#D0D7DE`
- **Error**: `#CF222E`
- **Warning**: `#BF8700`

### Typography

#### Font Stack
```css
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace
```

#### Scale
- **Display**: 32px / 2rem (Screen titles)
- **Heading 1**: 24px / 1.5rem (Section headers)
- **Heading 2**: 20px / 1.25rem (Card titles)
- **Body Large**: 16px / 1rem (Primary text)
- **Body**: 14px / 0.875rem (Secondary text)
- **Caption**: 12px / 0.75rem (Metadata, timestamps)
- **Small**: 10px / 0.625rem (Fine print)

### Spacing Scale
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

### Border Radius
```css
--radius-sm: 6px (buttons, small elements)
--radius-md: 12px (cards, inputs)
--radius-lg: 16px (modals, large surfaces)
--radius-xl: 24px (sheet corners)
```

## Component Library

### Buttons

#### Primary Button
```css
padding: 12px 24px
border-radius: var(--radius-sm)
background: var(--accent-primary)
color: white
font-weight: 500
min-height: 44px (touch target)
```

#### Secondary Button
```css
padding: 12px 24px
border-radius: var(--radius-sm)
background: transparent
border: 1px solid var(--border)
color: var(--text-primary)
min-height: 44px
```

#### Icon Button
```css
width: 44px
height: 44px
border-radius: 50%
background: var(--background-tertiary)
display: flex
align-items: center
justify-content: center
```

### Input Fields

#### Search Input
```css
padding: 16px 20px
border-radius: var(--radius-md)
background: var(--background-tertiary)
border: 1px solid transparent
font-size: 16px
min-height: 52px
```

#### Focus State
```css
border-color: var(--accent-primary)
box-shadow: 0 0 0 3px rgba(45, 164, 78, 0.1)
```

### Cards

#### Music Card
```css
padding: var(--space-md)
border-radius: var(--radius-md)
background: var(--background-secondary)
border: 1px solid var(--border)
```

#### Hover/Press States
```css
/* Hover (web) */
background: var(--background-tertiary)
transform: translateY(-2px)
box-shadow: 0 8px 24px rgba(0,0,0,0.1)

/* Press (mobile) */
opacity: 0.8
transform: scale(0.98)
```

## Screen Specifications

### 1. Home/Search Screen

#### Layout Structure
```
┌─────────────────────────────┐
│ [≡] ChillyMusic    [🌙][⚙️] │ ← Header (60px)
├─────────────────────────────┤
│                             │
│     🔍 Search for music     │ ← Search Input (52px + margins)
│                             │
├─────────────────────────────┤
│ Recent Searches        [↻]  │ ← Section Header (40px)
│ ┌─ [🎵] Afrobeats 2024      │
│ ├─ [🎵] Chill Vibes         │ ← Recent Items (48px each)
│ └─ [🎵] Workout Mix         │
├─────────────────────────────┤
│ Trending Now          [🔥]  │ ← Section Header (40px)
│ ┌─────────────────────────┐ │
│ │ [🖼️] Song Title        │ │ ← Trending Cards (120px)
│ │ Artist Name • 3:45     │ │
│ │ [▶️] [⬇️MP3] [⬇️MP4]      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Component Breakdown

**Header Component**
- Height: 60px
- Contains: Menu icon, app logo, theme toggle, settings
- Background: var(--background-primary) with bottom border
- Padding: 0 var(--space-md)

**Search Component**
- Margin: var(--space-lg) var(--space-md)
- Icon: Magnifying glass (24px) with var(--text-muted)
- Placeholder: "Search for music, artists, or albums"
- Clear button appears when typing

**Recent Searches Section**
- Each item: 48px height with 16px padding
- Icon: Clock (16px) + Search term + Clear (X) button
- Max 5 items, scrollable horizontally on overflow
- "Clear All" button in section header

**Trending Section**
- Horizontal scroll cards: 280px width × 120px height
- Card spacing: var(--space-md)
- Contains: Thumbnail (80×80), title, artist, duration, action buttons

#### UX Reasoning
- **Large search bar**: Primary action is prominently featured
- **Recent searches**: Reduces friction for repeat queries
- **Trending section**: Discovery mechanism to engage users
- **Quick actions**: Play and download buttons accessible without navigation

### 2. Search Results Screen

#### Layout Structure
```
┌─────────────────────────────┐
│ [←] 🔍 "afrobeats"     [🔍] │ ← Header with search
├─────────────────────────────┤
│ 🔥 Found 247 results • 0.3s │ ← Results meta
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [🖼️80×80] Song Title    │ │ ← Result Card (100px)
│ │              Artist • 3:45│ │
│ │              [▶️][⬇️][⬇️] │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [🖼️80×80] Another Song │ │ ← Scrollable list
│ │              Artist • 4:12│ │
│ │              [▶️][⬇️][⬇️] │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Component Specifications

**Search Header**
- Height: 60px
- Back button (44×44px touch target)
- Search input with current query
- Filter/Search button

**Results Meta**
- Height: 40px
- Shows: Result count, search time, filter chips
- Background: var(--background-secondary)

**Result Card**
- Height: 100px
- Layout: Thumbnail (80×80) + Content + Actions
- Thumbnail: Rounded corners (var(--radius-sm))
- Title: Body Large, var(--text-primary), max 2 lines
- Artist/Duration: Body, var(--text-secondary)
- Actions: Play (green), Download MP3 (blue), Download MP4 (blue)

**Action Buttons in Cards**
```css
Play Button: 36×36px, background: var(--accent-primary)
Download Buttons: 32×32px, background: var(--accent-secondary)
All buttons: border-radius: var(--radius-sm)
```

#### UX Reasoning
- **Persistent search**: Users can refine search without losing context
- **Result metadata**: Shows search effectiveness and loading speed
- **Card-based layout**: Scannable format with clear visual hierarchy
- **Inline actions**: Immediate access to primary functions

### 3. Player Screen

#### Layout Structure
```
┌─────────────────────────────┐
│ [←] Now Playing        [⋮] │ ← Header (60px)
├─────────────────────────────┤
│                             │
│    ┌─────────────────────┐  │ ← Album Art (300×300)
│    │                     │  │
│    │     [🖼️300×300]     │  │
│    │                     │  │
│    └─────────────────────┘  │
│                             │
│     Song Title Here         │ ← Title (Heading 2)
│     Artist Name             │ ← Artist (Body)
│                             │
│ ●────────────○──────────●   │ ← Progress Bar
│ 1:23              4:45      │ ← Time stamps
│                             │
│     [⏮️] [⏯️] [⏭️]          │ ← Control Buttons
│                             │
│  [🔄] [⬇️MP3] [⬇️MP4] [❤️] │ ← Action Buttons
└─────────────────────────────┘
```

#### Component Specifications

**Album Art Container**
- Size: 300×300px (scales down on smaller screens)
- Border radius: var(--radius-lg)
- Box shadow: 0 8px 32px rgba(0,0,0,0.3)
- Fallback: Gradient background with music note icon

**Progress Bar**
- Height: 4px active area, 24px touch target
- Thumb: 16×16px circle
- Track: var(--background-tertiary)
- Progress: var(--accent-primary)
- Interactive scrubbing with haptic feedback

**Control Buttons**
- Play/Pause: 64×64px, prominent styling
- Skip buttons: 48×48px
- All controls: Minimum 44px touch targets
- Spacing: var(--space-lg) between buttons

**Action Row**
- Button size: 44×44px each
- Icons: 24×24px
- Equal spacing across full width
- Repeat, Download MP3, Download MP4, Favorite

#### UX Reasoning
- **Visual hierarchy**: Album art is the focal point, creating emotional connection
- **Large controls**: Easy thumb access for primary playback functions
- **Progress indication**: Clear feedback on playback status
- **Secondary actions**: Download and social features readily accessible

### 4. Settings Screen

#### Layout Structure
```
┌─────────────────────────────┐
│ [←] Settings                │ ← Header
├─────────────────────────────┤
│ Playback                    │ ← Section Header
│ ┌─ Audio Quality      [HD▼] │ ← Setting Item
│ ├─ Auto-play         [●  ] │ ← Toggle
│ └─ Background Play   [ ●] │
├─────────────────────────────┤
│ Downloads                   │
│ ┌─ Default Format    [MP3▼] │
│ ├─ Download Quality  [320▼] │
│ └─ Storage Location [Int▼]  │
├─────────────────────────────┤
│ Language & Region           │
│ ┌─ App Language    [EN ▼]   │
│ └─ Content Region [US ▼]    │
├─────────────────────────────┤
│ Appearance                  │
│ ┌─ Theme          [Dark▼]   │
│ └─ Accent Color  [Green▼]   │
└─────────────────────────────┘
```

#### Component Specifications

**Section Headers**
- Height: 48px
- Font: Heading 2, var(--text-primary)
- Background: var(--background-secondary)
- Padding: var(--space-md)

**Setting Items**
- Height: 56px minimum
- Layout: Label + Description (if any) + Control
- Padding: var(--space-md)
- Border bottom: 1px solid var(--border)

**Controls**
- **Toggles**: 50×30px track, 26×26px thumb
- **Dropdowns**: 120px min width, down chevron
- **Buttons**: Secondary button styling

#### Available Settings

**Playback Section**
- Audio Quality: Auto, Standard (128kbps), High (320kbps), Lossless
- Auto-play: On/Off toggle
- Background Play: On/Off toggle
- Crossfade: 0-12 seconds slider

**Downloads Section**
- Default Format: MP3, MP4, Audio Only
- Download Quality: 128kbps, 192kbps, 320kbps, Original
- Storage Location: Internal, SD Card, Custom Path
- Auto-download over WiFi: On/Off

**Language & Region**
- App Language: English, Swahili, Spanish, French, German, Portuguese
- Content Region: US, UK, Kenya, Nigeria, South Africa, Global

**Appearance**
- Theme: Auto, Light, Dark
- Accent Color: Green, Blue, Purple, Orange, Red
- Compact View: On/Off (denser layouts)

## Responsive Design

### Breakpoints
```css
/* Mobile First */
mobile: 320px - 767px
tablet: 768px - 1023px
desktop: 1024px+
```

### Mobile Adaptations
- Touch targets: Minimum 44×44px
- Thumb-friendly navigation
- Swipe gestures for cards and player
- Pull-to-refresh on search results
- Bottom sheet modals instead of dropdowns

### Tablet Adaptations
- Two-column layout for search results
- Expanded player with lyrics panel
- Side navigation drawer
- Larger album art (400×400px)

### Desktop Adaptations
- Three-column layout: Sidebar + Main + Details
- Keyboard shortcuts (Space for play/pause, Arrow keys for seeking)
- Hover states for all interactive elements
- Context menus for advanced actions

## Animations & Interactions

### Micro-interactions
```css
/* Button Press */
transform: scale(0.96)
transition: transform 0.1s ease

/* Card Hover */
transform: translateY(-4px)
box-shadow: 0 12px 40px rgba(0,0,0,0.15)
transition: all 0.2s ease

/* Loading States */
opacity: 0.6
background: shimmer gradient animation
```

### Page Transitions
- **Stack Navigation**: Slide from right (iOS), Fade + Scale (Android)
- **Modal Sheets**: Slide up from bottom with backdrop
- **Tab Switches**: Crossfade with 200ms duration

### Audio Feedback
- **Button Taps**: Light haptic feedback
- **Downloads**: Success chime
- **Errors**: Error tone with haptic

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px solid outline with 2px offset
- Touch targets: Minimum 44×44px
- Screen reader support: Semantic HTML/components
- Keyboard navigation: Tab order, arrow key support

### Inclusive Design
- High contrast mode support
- Reduced motion preferences
- Voice control compatibility
- Large text scaling (up to 200%)

## Technical Implementation Notes

### State Management
```javascript
// Global State Structure
{
  user: { theme, language, settings },
  player: { currentSong, isPlaying, progress, queue },
  search: { query, results, loading, history },
  downloads: { queue, completed, progress }
}
```

### Component Architecture
```
src/
├── components/
│   ├── ui/ (Button, Input, Card, etc.)
│   ├── layout/ (Header, Navigation, etc.)
│   └── feature/ (Player, SearchResults, etc.)
├── screens/
│   ├── HomeScreen.tsx
│   ├── SearchResultsScreen.tsx
│   ├── PlayerScreen.tsx
│   └── SettingsScreen.tsx
├── hooks/
│   ├── usePlayer.ts
│   ├── useSearch.ts
│   └── useTheme.ts
└── utils/
    ├── api.ts
    ├── storage.ts
    └── constants.ts
```

### Performance Optimizations
- **Image Loading**: Progressive JPEG with blur placeholders
- **List Virtualization**: For large search results
- **Audio Streaming**: Adaptive bitrate based on connection
- **Caching**: Search results, thumbnails, user preferences

### Platform-Specific Considerations

#### iOS
- Safe area handling for notched devices
- Native iOS navigation patterns
- Haptic feedback integration
- App Store guidelines compliance

#### Android
- Material Design 3 components where applicable
- Edge-to-edge display support
- Android Audio Focus management
- Google Play policy compliance

#### Web
- Service Worker for offline functionality
- Web Audio API for advanced playback
- Progressive Web App features
- Responsive design patterns

## Export Specifications

### Figma Export
- Components as Figma components
- Design tokens as Figma variables
- Auto-layout for responsive behavior
- Component variants for states

### Developer Handoff
- Exact CSS specifications provided
- Component props documented
- Interactive prototypes for complex flows
- Asset export in multiple formats (SVG, PNG @1x, @2x, @3x)

This design document provides complete specifications for implementing ChillyMusic across all platforms while maintaining consistency and usability standards.
