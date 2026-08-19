# Green Room Data Sync Improvements

## Overview
Enhanced the green-room.html page to better sync and manage student data from saved competitions, with improved tracking and verification features.

## Key Improvements

### 1. **Data Synchronization**
- **New Function**: `syncCompetitionsData()`
  - Loads competitions data from localStorage
  - Displays sync status with competition count
  - Provides visual feedback on sync success/failure
  - Automatically called on page load

- **Manual Sync Button**: 🔄 Sync Data
  - Allows refreshing competitions data without page reload
  - Updates all UI elements with latest data
  - Shows confirmation with loaded competition count

### 2. **Enhanced Program Information Display**
- **Data Status Badge**: Shows real-time sync status
  - Displays number of competitions loaded
  - Color-coded status indicators (green for success, red for error)

- **Improved Metrics**:
  - Registered Students (from Competitions)
  - Checked In Count
  - Verified Count (new)
  - Verification Rate with progress bar

- **Verification Progress Bar**:
  - Visual representation of verification progress
  - Shows percentage of students verified
  - Green gradient background for better visibility

### 3. **Better Program List Display**
Program cards now show:
- Program Name
- Category
- **Registered**: Students from competitions for that program
- **Verified**: Students with verification timestamp
- **Checked**: Students who have been checked in

### 4. **Improved Student List Modal**
- **More Accurate Count**: Students pulled directly from competition data
- **Modal Title Enhancement**: Shows student count in title
- **Better Student Data**: Pulls complete participant info including team and category
- **Fallback Data**: Uses competition data if participant not in participant map

### 5. **Enhanced Verification Tracking**
- **Separated Metrics**:
  - Checked In: Student interacted with system
  - Verified: Student has verification timestamp
  - This distinguishes between manual verification and QR verification

- **Updated Print Report**:
  - Shows verified count separately
  - Pulls students from competition data (more accurate)
  - Better formatted output

### 6. **Functions Updated**
- `getStudentsForProgram()`: Now returns complete student objects with all data
- `updateProgramUI()`: Now calculates verification rate and updates progress bar
- `loadProgramsList()`: Shows registered, verified, and checked counts
- `syncCompetitionsData()`: New function for data synchronization

## Data Flow

```
Competitions Page (competitions.html)
    ↓ (saves data)
localStorage['eventalk_competitions']
    ↓ (loads data)
Green Room (green-room.html)
    ├─ syncCompetitionsData()
    ├─ getStudentsForProgram()
    ├─ getProgramCheckInRecords()
    └─ Updates UI with accurate counts
```

## localStorage Keys Used
- `eventalk_competitions`: Competition registrations (chest, programs, category, team)
- `eventalk_participants`: Participant info (name, chest, team, category)
- `eventalk_programs`: Program list (name, category)
- `eventalk_green_room_checkins`: Check-in records (chest, name, verifiedAt, codeLetter)

## UI Elements
- **Sync Status Badge**: Shows loading status and competition count
- **Sync Button**: Manual refresh button (🔄)
- **Progress Bar**: Visual verification rate indicator
- **Updated Buttons**: Print Report, View Students, Clear Check-ins, Sync Data

## How to Use

1. **Add Competitions**: Go to competitions.html to register students in programs
2. **Open Green Room**: Navigate to green-room.html
3. **Sync Data**: Click 🔄 Sync Data button or refresh page
4. **Select Program**: Click any program card to view details
5. **Verify Students**: 
   - Click "View All Students" to see student list
   - Click "Verify" button for manual verification
   - Use "Scan QR" for QR code verification
6. **Track Progress**: Monitor verification rate with progress bar
7. **Print Report**: Generate PDF report of verification status

## Technical Details

### Verification States
- **Not Checked**: Student not in green room system
- **Checked In**: Student interacted with system
- **Verified**: Student has timestamp (manual or QR verified)
- **Verified with QR**: Extra confirmation from QR code scan

### Data Integrity
- Normalizes records to prevent duplicates
- Maintains backward compatibility with existing data
- Automatic cleanup of malformed records
- Syncs across multiple instances via localStorage

## Future Enhancements
- Real-time sync with backend
- Export verification data to CSV
- Bulk actions (bulk verify, bulk clear)
- Student filtering by verification status
- Time-based verification analytics
