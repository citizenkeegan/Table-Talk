# Table Talk

A scheduling utility app for tabletop RPG groups. Solves the perennial "when can everyone play?" problem by combining availability polling, calendar conflict detection, real-time voting, and session-specific logistics chat.

## Features
- 📅 **Session Polling** — Propose multiple dates, players vote in real-time
- 🗓️ **Calendar Conflict Detection** — Overlays local device calendar to warn of scheduling conflicts
- 🔗 **Guest Mode (Magic Link)** — Players join via a URL, no account or app download required
- 💬 **Logistics Chat** — Session-threaded chat with urgent message support
- ✅ **Calendar Write-Back** — Confirmed sessions export as `.ics` files

## Tech Stack
- **Frontend**: Expo (React Native) with Web support via `expo-router`
- **Backend**: Supabase (Postgres + Realtime + Auth)
- **Platforms**: iOS, Android, and Web from a single codebase

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/citizenkeegan/Table-Talk.git
cd Table-Talk
npm install
```

### 2. Set up environment variables
Create a `.env` file in the root of the project:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database
- Go to your Supabase Dashboard → SQL Editor
- Run the contents of `docs/supabase_schema.sql`

### 4. Start the app
```bash
npx expo start
```
Press `w` to open in the browser, or use the Expo Go app on your phone.

## Project Structure
```
app/              # Expo Router screens
  (tabs)/         # Main tab navigation (Clarity Dashboard)
  campaign/       # Campaign & session views
  invite/         # Guest magic-link invite flow
  login.tsx       # Organizer auth screen
components/       # Shared React Native components
  Poll.tsx        # Real-time voting component
  ChatThread.tsx  # Session-scoped logistics chat
  ChatMessage.tsx # Individual chat message bubble
hooks/            # Custom hooks
  useGuestIdentity.ts  # Cookie-based guest identity
  useLocalCalendar.ts  # Device calendar access & conflict detection
lib/              # Utility clients
  supabase.ts     # Supabase client initialization
  auth.ts         # Auth helpers
utils/
  dateFormatting.ts  # UTC timezone helpers
  calendarExport.ts  # .ics file generation
docs/
  supabase_schema.sql  # Full database schema
```
