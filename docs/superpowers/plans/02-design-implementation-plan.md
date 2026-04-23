# Plan 02: Implement Design Guidelines (Claymorphism UI)

Reference: `docs/design-guidelines.md`

---

## Overview

This plan applies the Claymorphism design system to the existing Table Talk codebase. Since the app runs on Expo (React Native + Web), all implementations use `StyleSheet` with `Platform.select` to apply proper CSS `box-shadow` on web and native shadow props on iOS/Android.

---

## Phase 1: Design Token Foundation

**Goal**: Centralize all design values so every component draws from one source of truth.

### Step 1.1 — Create `constants/DesignTokens.ts`
- **Path**: `constants/DesignTokens.ts`
- **Contents**:
  ```ts
  export const Colors = {
    sage: '#9DB089',
    sageLight: '#C5D4BC',
    sageGradientTop: '#A8C09A',
    mauve: '#B09289',
    mauveLight: '#D4C0BA',
    mauveGradientTop: '#BF9E98',
    periwinkle: '#8992B0',
    periwinkleLight: '#B8BED4',
    periwinkleGradientTop: '#959FB9',
    cream: '#F5F0EA',
    ink: '#2D2D2E',
    mist: '#E8E3DC',
    whiteClay: '#FDFAF7',
  };

  export const Radius = {
    card: 28,
    button: 20,
    pill: 100,
    avatar: 9999,
  };

  export const Spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  export const FontSize = {
    display: 32,
    heading: 22,
    subheading: 16,
    body: 14,
    label: 12,
  };

  export const FontWeight = {
    regular: '400',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  };
  ```
- **Verification**: Import `Colors` from `DesignTokens` in one file without error.

### Step 1.2 — Create `constants/ClayStyles.ts`
- **Path**: `constants/ClayStyles.ts`
- **Contents**: A `StyleSheet`-compatible `getClayStyle(variant)` helper returning the correct shadow stack for each variant (`'base'`, `'sage'`, `'mauve'`, `'periwinkle'`), using `Platform.select` to apply web CSS `box-shadow` vs native `shadow*` props.
- **Verification**: A card using `getClayStyle('sage')` renders with visible depth on web.

### Step 1.3 — Load Plus Jakarta Sans font
- **Path**: `app/_layout.tsx`
- **Action**: Use `expo-google-fonts` (`npx expo install @expo-google-fonts/plus-jakarta-sans expo-font`) to load the font and apply it globally via a `<Text>` style wrapper or via a global style reset.
- **Verification**: All text in the app renders in Plus Jakarta Sans.

---

## Phase 2: Core Clay Components

**Goal**: Build the reusable primitive components that all screens will use.

### Step 2.1 — Create `components/ui/ClayCard.tsx`
- **Props**: `variant?: 'base' | 'sage' | 'mauve' | 'periwinkle'`, `style?`, `children`, `onPress?`
- **Behavior**: Wraps children in a `Pressable` (if `onPress`) or `View`. Applies the clay shadow stack from `ClayStyles`. Animates `scale` on press using `react-native-reanimated` (`scale(0.99)` on press, `scale(1.01)` lift on hover on web).
- **Path**: `components/ui/ClayCard.tsx`

### Step 2.2 — Create `components/ui/ClayButton.tsx`
- **Props**: `variant?: 'primary' | 'secondary'`, `label`, `onPress`, `disabled?`, `icon?`
- **Behavior**: Uses the gradient and shadow from the design guidelines. Primary = Sage gradient. Secondary = White Clay ghost.
- **Path**: `components/ui/ClayButton.tsx`

### Step 2.3 — Create `components/ui/PlayerDot.tsx`
- **Props**: `name: string`, `size?: 'sm' | 'md'`, `color?: string`
- **Behavior**: Renders a circle with a derived color from the player's name (deterministic hash → palette color). Shows initials inside. Supports stacked display with negative margin.
- **Path**: `components/ui/PlayerDot.tsx`

### Step 2.4 — Create `components/ui/ClayTag.tsx`
- **Props**: `label: string`, `color?: string`
- **Behavior**: A small pill-shaped badge using `border-radius: 100px`, 12px font, 600 weight.
- **Path**: `components/ui/ClayTag.tsx`

---

## Phase 3: Redesign the Clarity Dashboard (Bento Grid)

**Goal**: Replace the plain list dashboard with the asymmetric Bento Grid layout.

### Step 3.1 — Implement the Bento Grid layout shell
- **Path**: `app/(tabs)/index.tsx`
- **Action**: Replace `FlatList` with a CSS Grid (web) or nested `View` rows (native) using the 12-column template:
  ```
  Row 1: [NextSession 6col] [WhoIsIn 3col] [QuickActions 3col]
  Row 2:                                    [Stats 3col]
  Row 3: [PollCard 4col] [ChatSnippet 8col]
  ```
- **Note**: On mobile, cards stack vertically (single column). Use `Platform.OS === 'web'` to gate the grid layout.

### Step 3.2 — Build `components/dashboard/NextSessionCard.tsx`
- **Variant**: Sage
- **Contents**: Session title (Display font), formatted date/time, PlayerDot stack, and a "View Session" ClayButton.

### Step 3.3 — Build `components/dashboard/WhoIsInCard.tsx`
- **Variant**: Periwinkle
- **Contents**: "Who's In?" heading, list of player names with ✅/⏳ status and PlayerDots.

### Step 3.4 — Build `components/dashboard/PollSummaryCard.tsx`
- **Variant**: White Clay
- **Contents**: Title "Awaiting Vote", list of 2-3 date options as mini vote bars, link to full session.

### Step 3.5 — Build `components/dashboard/ChatSnippetCard.tsx`
- **Variant**: White Clay
- **Contents**: Last 2 chat messages with sender name, timestamp, and urgent badge if applicable.

### Step 3.6 — Build `components/dashboard/QuickActionsCard.tsx` + `StatsCard.tsx`
- **Quick Actions Variant**: White Clay — "New Session" and "Share Invite" ClayButtons.
- **Stats Variant**: Mauve — shows "# Sessions Played", "# Members".

---

## Phase 4: Redesign Individual Screens

**Goal**: Apply the clay system to all existing screens.

### Step 4.1 — Redesign `app/login.tsx`
- Center a single `ClayCard` (White Clay) on the Cream background.
- Replace `TextInput` with styled clay inputs (border-radius: 16px, inset shadow on focus).
- Replace `Button` with `ClayButton` (Primary for Sign In, Secondary for Sign Up).

### Step 4.2 — Redesign `app/invite/[campaignId].tsx`
- Large hero text on Cream background.
- Name input wrapped in a `ClayCard`.
- `ClayButton` for "Join Campaign".

### Step 4.3 — Redesign `components/Poll.tsx`
- Each poll option becomes a `ClayCard` (base variant).
- Selected option: border upgrades to Periwinkle with a heavier shadow.
- Conflict option: border becomes Mauve-red with urgent badge.
- Vote bar: an animated `Animated.View` width % showing vote share.

### Step 4.4 — Redesign `components/ChatThread.tsx` + `ChatMessage.tsx`
- Thread container: `ClayCard` (base, no padding override).
- Own messages: Sage-tinted bubble. Other messages: White Clay bubble.
- Urgent messages: Mauve bubble with `⚠️ URGENT` ClayTag.
- Input area: clay-inset style text field.

---

## Phase 5: Polish & Stagger Animation

**Goal**: Add entry animations and confirm mobile-first responsiveness.

### Step 5.1 — Card stagger on Dashboard load
- Use `react-native-reanimated` `FadeInDown` with a 40ms stagger delay per card.

### Step 5.2 — Mobile responsive audit
- Test Dashboard at 375px width (iPhone SE). Confirm cards stack correctly.
- Confirm all tap targets are ≥ 44px tall.
- Confirm `prefers-reduced-motion` disables all transform animations.

### Step 5.3 — Commit the UI redesign
- `git add .` and `git commit -m "feat(ui): Claymorphism Bento Grid design system"`

---

## Verification Checklist

- [ ] `ClayCard` renders with correct shadow depth on web and native
- [ ] Plus Jakarta Sans font loads before app renders (no FOUT)
- [ ] Dashboard Bento Grid renders correctly on desktop web
- [ ] Dashboard stacks to single column on mobile web (< 768px)
- [ ] Poll conflict highlighting (Mauve border) works correctly
- [ ] Urgent chat messages show URGENT badge and Mauve tint
- [ ] All buttons use `ClayButton` — no native `Button` components remain
- [ ] All `border-radius` values are ≥ 20px throughout the app
