# Implementation Plan: Table Talk MVP

Based on the Product Requirements Document (v1.0), this plan outlines the step-by-step implementation of the Table Talk application. We will use a modern cross-platform stack (Expo/React Native) and Supabase for real-time features.

## Tech Stack Decisions
*   **Frontend**: Expo (React Native) with Web Support. This satisfies the "Cross-Platform UI" requirement (iOS, Android, Web) from a single codebase.
*   **Backend & Database**: Supabase. Satisfies the "Real-time Database" requirement for instant poll and chat updates.
*   **Calendar API**: MVP will start with `.ics` generation for write-back and basic browser APIs for local viewing, scaling to Nylas/Cronofy for full aggregation later.

---

## Phase 1: Project Initialization & Core Setup
**Goal**: Establish the repository, UI framework, and database connection.

1.  **Initialize Expo App**:
    *   **Action**: Create a new Expo project with TypeScript and routing (`expo-router`).
    *   **Path**: `/app` (Expo structure)
    *   **Verification**: App runs successfully on web (`npx expo start -w`).
2.  **Configure Supabase**:
    *   **Action**: Set up Supabase project, initialize SQL schema (Users, Campaigns, Sessions). Create local `.env` variables.
    *   **Path**: `/lib/supabase.ts`
    *   **Verification**: Can successfully connect to the Supabase instance from the app.
3.  **Setup UI System**:
    *   **Action**: Implement a minimalist design system (Tailwind or NativeWind) focusing on high-contrast, clean UI.
    *   **Path**: `/constants/Colors.ts`, `/components/ui/`
    *   **Verification**: Render a basic dashboard screen adhering to the "Clarity" guidelines.

## Phase 2: Identity & Guest Mode ("Magic Link" System)
**Goal**: Allow organizers to log in, and guests to participate frictionlessly.

1.  **Organizer Authentication**:
    *   **Action**: Implement standard Email/Password or OAuth login for Organizers.
    *   **Path**: `/app/login.tsx`, `/lib/auth.ts`
2.  **Guest Cookie-Based Identity**:
    *   **Action**: Implement a flow where accessing a campaign link without an account prompts for a "Display Name" and stores a UUID in LocalStorage/Cookies.
    *   **Path**: `/app/invite/[campaignId].tsx`, `/hooks/useGuestIdentity.ts`
3.  **Campaign Sharing**:
    *   **Action**: Create the UI for Organizers to generate a shareable URL.
    *   **Verification**: A user can click a link, enter "Grog", and be recognized as "Grog" upon refreshing the page without creating an account.

## Phase 3: The Scheduling Engine & Polling
**Goal**: Core MVP feature—proposing dates and voting.

1.  **Session Creation**:
    *   **Action**: Organizers can create a "Session" with multiple proposed dates/times.
    *   **Path**: `/app/campaign/[id]/new-session.tsx`
2.  **Timezone Normalization**:
    *   **Action**: All dates saved in UTC. The UI strictly renders times converted to the viewer's local device timezone.
    *   **Path**: `/utils/dateFormatting.ts`
3.  **Ranked Choice Polling**:
    *   **Action**: Build the UI for users (Organizers and Guests) to vote on proposed dates. Use Supabase real-time subscriptions to update the vote count instantly.
    *   **Path**: `/components/Poll.tsx`, `/app/campaign/[id]/session/[sessionId].tsx`
    *   **Verification**: Two different browsers open; voting in one updates the other instantly.

## Phase 4: Calendar Integration & Heatmap
**Goal**: Visualizing conflicts and adding confirmed sessions to calendars.

1.  **Local Calendar Overlay (Web/Mobile)**:
    *   **Action**: Request permission to read the device calendar. Overlay busy blocks on the voting screen. Note: Browser API limitations might require manual input for guests if strict APIs fail.
    *   **Path**: `/hooks/useLocalCalendar.ts`, `/components/AvailabilityHeatmap.tsx`
2.  **Conflict Highlighting**:
    *   **Action**: If a proposed time overlaps with a local calendar event, flag it as "Conflict: [Event Name]".
3.  **Calendar Write-Back (.ics)**:
    *   **Action**: When a session is "Confirmed" by the Organizer, generate an `.ics` file download for web, or use native calendar APIs for mobile to save the event.
    *   **Path**: `/utils/calendarExport.ts`

## Phase 5: Logistics-Focused Chat
**Goal**: Session-threaded communication.

1.  **Session Threads**:
    *   **Action**: Implement a chat interface scoped exclusively to a specific `sessionId`.
    *   **Path**: `/components/ChatThread.tsx`
2.  **Real-time Messaging**:
    *   **Action**: Wire up Supabase real-time inserts for instant message delivery.
3.  **Urgent Notifications**:
    *   **Action**: Add a toggle for "Urgent". If checked, visually highlight the message and trigger a push notification (if mobile/Push API enabled).
    *   **Path**: `/components/ChatMessage.tsx`

## Phase 6: Polish & The "Clarity" Dashboard
**Goal**: Finalizing the UX and ensuring it meets KPIs.

1.  **The "Clarity" Dashboard**:
    *   **Action**: Build the home screen for Organizers showing upcoming confirmed sessions and pending polls requiring attention.
    *   **Path**: `/app/(tabs)/dashboard.tsx`
2.  **Mobile-First Web Optimization**:
    *   **Action**: Audit all views in mobile browsers (Safari/Chrome) to ensure padding, scrolling, and tap targets feel native.
3.  **E2E Testing**:
    *   **Action**: Walk through the "Organizer creates campaign -> Guest joins -> Guest votes -> Organizer confirms" flow.

---
**Next Steps**: 
If you approve this plan, we can begin executing **Phase 1: Project Initialization & Core Setup**.
