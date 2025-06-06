# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server on localhost:3000
- `npm run build` - Create production build
- `npm test` - Run tests in interactive watch mode

### No Linting/Type Checking
This project uses Create React App defaults without additional linting or type checking scripts configured.

## Architecture Overview

### Core Concept
"猫日記" (Cat Diary) is an offline-first React TypeScript application for tracking cat health, behavior, meals, and memories using IndexedDB for local storage.

### Data Architecture
```
IndexedDB (CatDiaryDB) ↔ StorageManager ↔ React Components
```

**Database Schema:**
- `entries` object store: All diary entries with date/type indexes
- `profiles` object store: Cat profile information

**Key Data Types:**
- `DiaryEntry`: Main entry with discriminated union for type-specific data
- `EntryType`: 'food' | 'health' | 'behavior' | 'free'
- Each type has specific data interfaces (FoodData, HealthData, etc.)

### Component Structure
- `CatDiary`: Main container managing all state and operations
- `NewEntryForm/EditEntryForm`: Comprehensive forms with auto-save and media upload
- `EntryCard`: Display component with media preview
- Specialized forms: `FoodForm`, `HealthForm`, `BehaviorForm`, `FreeForm`

### Advanced Features
- **Draft System**: Auto-save every 2 seconds + manual draft management (max 10 drafts)
- **Media Upload**: Image/video with compression, thumbnail generation, drag-and-drop
- **Theme Context**: Dark/light mode with localStorage persistence
- **Search/Filter**: Multi-field search across content, symptoms, behaviors, tags

## Storage Patterns

### StorageManager Usage
```typescript
await storageManager.saveEntry(entry);    // Create
await storageManager.updateEntry(entry);  // Update
await storageManager.deleteEntry(id);     // Delete
await storageManager.getEntries();        // Read all (auto-sorted)
```

### Date Handling
- Automatic Date ↔ ISO string conversion in storage
- Always use `new Date()` for timestamps
- Entry dates stored as Date objects in memory

### Media Management
- Use `createMediaAttachment()` for file processing
- Files compressed automatically (images >1MB, videos for thumbnails)
- Always call `revokeMediaUrl()` for cleanup
- Supported: JPEG, PNG, WebP, GIF / MP4, WebM, MOV, AVI

## Development Patterns

### Adding New Entry Types
1. Update `EntryType` union in `types/index.ts`
2. Create data interface extending `BaseEntryData`
3. Add form component following existing pattern
4. Update validation in `NewEntryForm`
5. Update display logic in `EntryCard`

### Form Validation
Each entry type requires specific fields:
- Food: `foodType` + `appetite`
- Health: `weight` OR `temperature` OR `symptoms`
- Behavior: `activityLevel`
- Free: `title` + `content`

### Error Handling
- Storage operations wrapped in try/catch with user feedback
- Media processing has fallback for compression failures
- Form validation shows real-time error messages

### Schema Migrations
- Increment `DB_VERSION` in `storage.ts`
- Add migration logic in `onupgradeneeded` event handler
- Test compatibility with existing data

## Component Patterns

### State Management
- Local React state for UI interactions
- IndexedDB via StorageManager for persistence
- ThemeContext for global theme state
- Draft storage uses localStorage

### CSS Organization
- Component-scoped CSS files co-located with components
- CSS custom properties for theming
- Mobile-first responsive design

### Testing
- React Testing Library + Jest configured
- Basic smoke test exists, expand as needed
- Test files use `.test.tsx` extension