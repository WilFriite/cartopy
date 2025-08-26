# Temporary Lists Feature

## Overview

The temporary lists feature allows users to create special grocery lists for punctual events (barbecues, parties, etc.) that require all items to be purchased before the grocery session can end.

## Features

### 1. Temporary List Creation
- **Toggle Switch**: A new Switch component that adapts to the app's theme
- **Visual Indicator**: Clear labeling that the list is for temporary/one-time events
- **Helpful Text**: Explanation that all items must be taken for temporary lists

### 2. List Display Differentiation
- **Visual Badge**: Temporary lists show a "Temporaire" badge with a clock icon
- **Left Border**: Blue left border to distinguish temporary lists from regular ones
- **Additional Info**: Shows requirement that all items must be taken

### 3. Grocery Session Behavior
- **Regular Lists**: Can end session with any number of items completed
- **Temporary Lists**: Must complete ALL items before session can end
- **Progress Tracking**: Visual feedback showing completion requirement
- **Swipe Button**: Different text and behavior for temporary lists

### 4. List Management
- **Edit Capability**: Users can toggle between temporary and regular list types
- **Persistent State**: Temporary status is saved and maintained
- **Migration Support**: Existing lists default to non-temporary

## Technical Implementation

### Database Schema
```sql
ALTER TABLE `lists` ADD `is_temporary` integer DEFAULT false NOT NULL;
```

### New Components
- `Switch`: Theme-adaptive toggle component
- Updated `EditBottomSheet`: Handles temporary list logic
- Enhanced list display components

### Key Files Modified
- `db/schema.ts`: Added isTemporary field
- `components/ui/switch.tsx`: New Switch component
- `app/lists/(tabs)/create.tsx`: Added temporary toggle
- `app/lists/(tabs)/index.tsx`: Visual differentiation
- `app/lists/[id]/index.tsx`: Temporary list indicators
- `app/lists/[id]/edit.tsx`: Edit temporary status
- `components/ui/edit-bottom-sheet.tsx`: Session completion logic

## User Experience

### Creating a Temporary List
1. Navigate to "Ajouter" (Create) tab
2. Fill in list name and items
3. Toggle "Liste temporaire (événement ponctuel)" switch
4. See helpful explanation text
5. Create the list

### Using a Temporary List
1. Open the temporary list
2. See clear "Liste temporaire" notice at the top
3. Start grocery session
4. Must check off ALL items before completing
5. Visual feedback shows completion requirement

### Managing Temporary Lists
1. Edit list to change temporary status
2. Visual indicators throughout the app
3. Consistent behavior across all views

## Migration

The feature includes a database migration that:
- Adds the `is_temporary` field to existing lists
- Defaults all existing lists to `false` (non-temporary)
- Maintains backward compatibility

## Testing

To test the feature:
1. Create a new temporary list
2. Verify visual indicators appear
3. Test grocery session completion requirements
4. Edit list to change temporary status
5. Verify all views update correctly

## Future Enhancements

Potential improvements could include:
- Temporary list expiration dates
- Event-specific metadata
- Sharing temporary lists
- Analytics on temporary vs. regular list usage
