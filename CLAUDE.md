# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "猫日記" (Cat Diary) - a React TypeScript application for cat owners to track their pets' daily activities, health, behavior, and memories. The app uses IndexedDB for offline-first data storage and features a comprehensive categorized entry system.

## Development Commands

- `npm start` - Start development server (http://localhost:3000)
- `npm run build` - Build for production 
- `npm test` - Run tests in interactive watch mode
- `npm run test -- --coverage` - Run tests with coverage report
- `npm run test -- --watchAll=false` - Run tests once (CI mode)

## Application Architecture

### Core Data Flow
The application follows a unidirectional data flow pattern:
1. **Storage Layer**: IndexedDB via `src/utils/storage.ts` (StorageManager class)
2. **State Management**: React hooks in main `CatDiary` component
3. **Entry Types**: Four specialized form types (food, health, behavior, free)
4. **Display Layer**: Categorized entry cards with search/filter capabilities

### Key Data Structures
- **DiaryEntry**: Main entry interface with type-specific data union
- **EntryType**: 'food' | 'health' | 'behavior' | 'free'
- **Storage**: IndexedDB with two object stores (entries, profiles)

### Component Hierarchy
```
App
└── CatDiary (main container)
    ├── NewEntryForm (entry creation)
    │   ├── EntryTypeSelector
    │   └── [FoodForm|HealthForm|BehaviorForm|FreeForm]
    └── EntryList (display & filtering)
        └── EntryCard (individual entry display)
```

### Storage Implementation
- **Database**: CatDiaryDB (IndexedDB)
- **Stores**: entries (diary entries), profiles (cat profiles)
- **Offline-first**: All data persisted locally
- **Data Types**: Automatic date serialization/deserialization

### Entry Form System
Each entry type has specialized validation and UI:
- **Food**: Time, type, amount, appetite level, completion status
- **Health**: Weight, temperature, symptoms (multi-select), medications, vet visits
- **Behavior**: Activity level, sleep/play time, special behaviors, locations
- **Free**: Title, content, tags (flexible diary format)

### Search & Filtering
- **Type filtering**: By entry category
- **Text search**: Across entry content, symptoms, behaviors, tags
- **Sorting**: By date or category
- **Grouping**: Date-based or type-based display modes

## Development Notes

### Adding New Entry Types
1. Update `EntryType` union in `src/types/index.ts`
2. Create new data interface extending `BaseEntryData`
3. Add form component in `src/components/EntryForm/`
4. Update `NewEntryForm` switch statement and validation
5. Update `EntryCard` preview rendering

### Storage Schema Changes
- Increment `DB_VERSION` in `storage.ts`
- Add migration logic in `onupgradeneeded` handler
- Test with existing data to ensure compatibility

### Styling Architecture
- Component-specific CSS files co-located with components
- Global styles in `App.css` and `index.css` 
- Responsive design with mobile-first approach
- CSS Grid and Flexbox for layouts