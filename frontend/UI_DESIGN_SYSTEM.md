# MyBoss UI design system

## Brand

MyBoss uses a restrained enterprise palette with a single primary action color:

- **Primary:** `#2563EB`
- **Primary hover:** `#1D4ED8`
- **Success:** `#16A34A` (dark) / `#15803D` (light)
- **Warning:** `#D69E36` (dark) / `#B7791F` (light)
- **Error:** `#DC5555`

Do not introduce additional brand colors. Keep the product logo assets unchanged.

## Theme tokens

### Dark (primary reference)

- App background: `#101010`
- Sidebar: `#0C0C0E`
- Header: `#101010`
- Main surface: `#111113`
- Secondary surface: `#151517`
- Elevated surface: `#19191C`
- Input background: `#141416`
- Primary border: `#29292D`
- Secondary border: `#222226`
- Primary text: `#F4F4F5`
- Secondary text: `#B0B0B5`
- Muted text: `#85858D`
- Disabled text: `#626269`

### Light

- App background: `#F7F7F8`
- Sidebar / header / main surface: `#FFFFFF`
- Secondary surface: `#F5F5F6`
- Input background: `#FAFAFA`
- Primary border: `#E2E2E5`
- Secondary border: `#EBEBED`
- Primary text: `#18181B`
- Secondary text: `#52525B`
- Muted text: `#85858D`
- Disabled text: `#A1A1AA`

Use borders, not background contrast, to separate adjacent regions. Avoid gradients and heavy shadows.

## Typography

Inter is the product font.

- Page title: `21–24px`, semibold
- Section title: `16–18px`, semibold
- Card title: `14–16px`, medium/semibold
- Body / navigation: `13–14px`
- Supporting text: `12–13px`
- Labels / table / buttons: `11–13px`

Weights: 400 regular, 500 medium, 600 semibold. Use tabular numerals for metrics.

## Shape and spacing

- Inputs, buttons, nav items: `5px`
- Small cards: `7px`
- Standard cards and dialogs: `8px`
- Large panels: `9px`
- Status chips: `4–5px`
- Avatars and unread dots may be fully round
- Spacing uses a 4px base: 4, 8, 12, 16, 20, 24
- Dashboard content max width: `1440px`

## Components

- Primary buttons: blue fill, white text, compact height (`32–36px`)
- Secondary buttons: surface + 1px border
- Inputs: input background, 1px border, 5px radius, 36px height
- Cards: same family of surfaces as the app, 1px border, no drop shadow
- Tables: compact rows, horizontal separators, muted header labels
- Active navigation: elevated/secondary surface, primary text, muted icon on idle
- Dialogs and dropdowns: popover surface, 8px radius, 1px border, light shadow only

## Interaction

Hover, focus-visible, active, and disabled states are required. Focus uses a 2px primary ring with a 2px offset. Empty, loading, and error states stay compact and explanatory.

## Responsive

- Mobile: stacked content, bottom navigation, horizontally scrollable dense tables
- Tablet: two-column cards where content permits
- Desktop: 220px sidebar, 52px header, dense dashboard layouts
