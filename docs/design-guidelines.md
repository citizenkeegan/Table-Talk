# Table Talk — Frontend Design Guidelines

## Design Philosophy
**Squishy UI / Claymorphism** — The interface should feel tactile, warm, and approachable. Think of holding a smooth clay object, not tapping a cold glass screen. Every component should feel like it has real-world weight and softness. This is *not* flat design. This is *not* harsh glassmorphism. This is gentle, playful, and deeply human.

---

## Color Palette

| Name | Hex | Usage |
|---|---|---|
| **Sage** | `#9DB089` | Primary hero cards, CTAs, success states |
| **Mauve** | `#B09289` | Secondary cards, "Pending" states, warm accents |
| **Periwinkle** | `#8992B0` | Tertiary cards, info states, calendar elements |
| **Cream** | `#F5F0EA` | Page background, neutral card base |
| **Ink** | `#2D2D2E` | All body text |
| **Mist** | `#E8E3DC` | Card borders, dividers, subtle outlines |
| **White Clay** | `#FDFAF7` | Card backgrounds (slightly warmer than pure white) |

### Derived Tints (for inner shadows & highlights)
- Sage Light: `#C5D4BC`
- Mauve Light: `#D4C0BA`
- Periwinkle Light: `#B8BED4`

---

## Typography

**Font Family**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (rounded, modern, human)
**Fallback**: `system-ui, -apple-system, sans-serif`

| Scale | Size | Weight | Usage |
|---|---|---|---|
| Display | 32px | 800 ExtraBold | Hero card headlines |
| Heading | 22px | 700 Bold | Card titles |
| Subheading | 16px | 600 SemiBold | Section labels, player names |
| Body | 14px | 400 Regular | Descriptions, chat messages |
| Label | 12px | 600 SemiBold | Tags, badges, timestamps |

---

## The Claymorphism Card System

### Core Card Rules
Every card in the system must follow these rules:

```css
/* Base Clay Card */
.clay-card {
  border-radius: 28px;
  background: #FDFAF7;
  padding: 24px;

  /* The clay shadow stack — this creates the 3D tactile feel */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.10),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 2px 4px rgba(255, 255, 255, 0.80),
    inset 0 -2px 4px rgba(0, 0, 0, 0.06);

  border: 1.5px solid #E8E3DC;
}
```

### Colored Clay Variants

```css
.clay-card--sage {
  background: linear-gradient(145deg, #A8C09A, #9DB089);
  border-color: #8AA876;
  box-shadow:
    0 8px 32px rgba(157, 176, 137, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.40),
    inset 0 -2px 6px rgba(0, 0, 0, 0.10);
}

.clay-card--mauve {
  background: linear-gradient(145deg, #BF9E98, #B09289);
  border-color: #9C7F78;
  box-shadow:
    0 8px 32px rgba(176, 146, 137, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.40),
    inset 0 -2px 6px rgba(0, 0, 0, 0.10);
}

.clay-card--periwinkle {
  background: linear-gradient(145deg, #959FB9, #8992B0);
  border-color: #757FA0;
  box-shadow:
    0 8px 32px rgba(137, 146, 176, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.40),
    inset 0 -2px 6px rgba(0, 0, 0, 0.10);
}
```

---

## Bento Grid Layout

The Bento Grid uses an **asymmetrical 12-column grid** with a `16px` gap.

### Dashboard Grid Template

```
[ Hero: Next Session (6 col, 2 row) ] [ Who's In? (3 col, 2 row) ] [ Quick Action (3 col, 1 row) ]
                                                                     [ Stats (3 col, 1 row)        ]
[ Poll / Vote (4 col, 2 row)         ] [ Chat (8 col, 2 row)                                      ]
```

### Card Size Reference

| Card Type | Cols | Rows | Color Variant |
|---|---|---|---|
| **Next Session** (hero) | 6 | 2 | Sage |
| **Who's In? (RSVP)** | 3 | 2 | Periwinkle |
| **Quick Actions** | 3 | 1 | White Clay |
| **Session Stats** | 3 | 1 | Mauve |
| **Poll / Vote** | 4 | 2 | White Clay |
| **Chat Thread** | 8 | 2 | White Clay |

---

## Interactive States

### Hover (Desktop)
```css
.clay-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.80),
    inset 0 -2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Press / Active
```css
.clay-card:active {
  transform: translateY(1px) scale(0.99);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.06),
    inset 0 3px 6px rgba(0, 0, 0, 0.08),
    inset 0 -1px 2px rgba(255, 255, 255, 0.50);
  transition: all 0.1s ease-out;
}
```

---

## Button System

### Primary Button (Sage)
```css
.btn-primary {
  background: linear-gradient(180deg, #A8C09A, #8FA87E);
  color: #2D2D2E;
  font-weight: 700;
  border-radius: 20px;
  padding: 12px 24px;
  border: 1.5px solid #8AA876;
  box-shadow:
    0 6px 16px rgba(157, 176, 137, 0.40),
    inset 0 1px 2px rgba(255, 255, 255, 0.60),
    inset 0 -2px 4px rgba(0, 0, 0, 0.12);
}
```

### Secondary Button (Ghost)
```css
.btn-secondary {
  background: #FDFAF7;
  color: #2D2D2E;
  border-radius: 20px;
  padding: 12px 24px;
  border: 1.5px solid #E8E3DC;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(255, 255, 255, 0.90);
}
```

---

## Avatar & Player Dot System

- **Full avatar dot**: `36px` diameter, `border-radius: 50%`
- **Mini stacked**: `20px`, `-8px` negative margin, white clay border
- Each player is assigned a unique color from the palette hues

---

## Animation Principles

| Principle | Value |
|---|---|
| **Easing** | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) for enter, `ease-out` for exit |
| **Duration** | 250ms hover/active, 350ms page transitions |
| **Stagger** | Cards animate in with 40ms stagger on page load |
| **Wiggle** | Urgent items use `@keyframes wiggle` (±3deg) |

---

## Rules to Never Break

> [!IMPORTANT]
> 1. **Never use `border-radius` below 20px** on any interactive element
> 2. **Never use pure black or pure white** — always use Ink and White Clay
> 3. **Always include the inner shadow stack** on colored cards
> 4. **Avoid icon-only buttons** — always pair icons with a label
> 5. **Never use weights above 800 ExtraBold** for typography
> 6. **All motion must respect `prefers-reduced-motion`**
