# List Details Page - Cartopy

## Overview
The list details page has been implemented for the Cartopy mobile grocery list app, featuring a Material Top Tabs Navigator with two modes: view and edit.

## Features

### View Tab
- **List Name Display**: Shows the list name prominently at the top
- **Last Performed Time**: Displays when the list was last used, or shows "Jamais utilisée" if never used
- **Mark as Performed Button**: Allows users to mark the list as used, updating the timestamp
- **Items Display**: Shows all items in the list with:
  - Item name
  - Quantity (if specified)
  - Notes (if specified)
  - Completion status (checkbox with visual feedback)
- **Progress Indicator**: Visual progress bar showing completed vs total items
- **Created Date**: Shows when the list was created

### Edit Tab
- **List Name Editing**: Input field to modify the list name
- **Add New Items**: Form to add new items with:
  - Item name (required)
  - Quantity (optional)
  - Notes (optional)
- **Item Management**: 
  - Toggle completion status with checkboxes
  - Remove items
  - Visual feedback for completed items (strikethrough, opacity)
- **Save Changes**: Button to persist all modifications

## Technical Implementation

### Dependencies Added
- `@react-navigation/material-top-tabs`: For tab navigation
- `react-native-tab-view`: Required by material top tabs
- `react-native-pager-view`: Required by material top tabs
- `date-fns`: For date formatting with French locale

### File Structure
```
app/lists/[id]/
├── _layout.tsx          # Main layout with Material Top Tabs
├── view.tsx             # View tab component
└── edit.tsx             # Edit tab component
```

### Database Integration
- Uses existing Drizzle ORM setup
- Integrates with the `lists` table schema
- Handles JSON parsing for items array
- Updates `lastPerformedAt` timestamp

### Design System Compliance
- Follows the established theme colors (astral, muted, etc.)
- Uses consistent spacing and typography
- Implements proper shadows and borders
- Responsive design with proper touch targets

## Usage

### Navigation
Users can navigate to the list details page by:
1. Going to the Lists tab
2. Tapping on any list card
3. The app will navigate to `/lists/[id]` with the appropriate list ID

### Tab Switching
- **View Tab**: Default tab for viewing list details
- **Edit Tab**: For modifying list content and structure

### Data Persistence
- All changes are automatically saved to the database
- Real-time updates across the app using React Query
- Error handling for database operations

## Error Handling
- JSON parsing errors for malformed item data
- Database connection errors
- Network request failures
- User input validation

## Future Enhancements
- Drag and drop for item reordering
- Bulk item operations
- List sharing functionality
- Item categories and filtering
- Shopping history analytics