Product Requirements Document: Table Talk (MVP)
Status: Draft | Version: 1.0

Focus: Scheduling, Calendar Integration, and Frictionless Logistics

1. Executive Summary
Table Talk is a utility app designed to solve scheduling issues in tabletop gaming. Unlike generic messaging apps, it prioritizes calendar synchronization and availability tracking. It allows "Power Users" (DMs/GMs) to manage campaigns while allowing "Casual Players" to interact via a web-based guest mode, reducing the barrier to entry.

2. Target Audience
The Organizer (DM/GM): Heavily invested, needs a single source of truth for who is coming and when.

The Casual Player: Loves the game but finds "admin" work tedious; prefers not to download new apps or manage new accounts.

3. User Stories
As an Organizer, I want to see everyone's availability at a glance so I can propose a date that actually works.

As a Player, I want to see my own work/life conflicts when I'm voting on a game night so I don't double-book myself.

As a Guest, I want to respond to a scheduling poll without creating an account or downloading an app.

As a User, I want the confirmed session to automatically appear on my phone’s calendar.

4. Functional Requirements
4.1 Scheduling & Calendar Integration
Availability Heatmap: Organizers can view "suggested windows" based on player-connected calendars.

Conflict Detection: When a session is proposed, the UI must highlight conflicts (e.g., "Conflict: Work Meeting") for the individual player.

Calendar Write-Back: Confirmed sessions must trigger an .ics file or a direct API push to Google/Apple/Outlook calendars for registered users.

Timezone Conversion: Automatically adjust all session times to the viewer's local system time.

4.2 Guest Mode (The "Magic Link" System)
URL Invitation: Organizers generate a unique campaign link to share in existing group texts.

Cookie-Based Identity: If a guest enters a name (e.g., "Grog"), this identity is stored via browser cookies to allow persistent participation without an account.

Web Overlay: The web view allows guests to see their local device calendar overlaid on the proposed session dates (subject to browser permissions).

4.3 Logistics-Focused Chat
Session Threading: Chat is organized by "Session Event." All talk regarding snacks, late arrivals, or prep for a specific date stays within that event thread.

Urgent Notifications: A specific "Urgent" tag for messages that bypasses standard notification silencers (e.g., "Car broke down, running 30 mins late").

Polls & RSVPs: Native polling for multiple dates with "Ranked Choice" support.

5. Technical Requirements
Cross-Platform UI: Built with a framework (e.g., Flutter or React Native) to ensure identical logic on iOS, Android, and Web.

Real-time Database: Use of a real-time engine (e.g., Supabase) to ensure votes and chat messages update instantly across all devices.

Calendar API: Integration with a third-party aggregator (e.g., Cronofy or Nylas) to handle diverse calendar providers.

Local Storage: Robust use of browser cookies/LocalStorage for the Guest Mode experience.

6. User Experience (UX) & Design
The "Clarity" Dashboard: A single-screen view showing the "Next Session" status, including who has confirmed and who is pending.

Mobile-First Web View: The guest experience must be optimized for mobile browsers (Chrome/Safari) to feel like a native app.

Minimalist Aesthetic: High-contrast, clean UI that avoids "gamified" clutter, focusing instead on utility and readability.

7. Success Metrics (KPIs)
Conversion Rate: Percentage of "Guests" who eventually create an account/download the app.

Session Success: Number of sessions successfully scheduled and confirmed via the app.

Response Time: Average time between a DM proposing a date and the "Quorum" being met.

8. Future Scope (V2)
Auto-Nudge: AI-driven reminders for players who haven't checked their calendars.

Venue Mapping: Integration with Maps for "Host" addresses or local game shop locations.

Sub-Groups: Managing multiple campaigns or "West Marches" style groups with shifting rosters.