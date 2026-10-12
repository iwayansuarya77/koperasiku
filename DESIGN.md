# Design Brief

## Direction

Ledger Teal — a calm, precise back-office financial system for an Indonesian cooperative, where every figure reads like printed accounting.

## Tone

Restrained editorial productivity — data-dense but breathable, with a deep teal identity surface and warm paper-white content that signals trust and bookkeeping calm.

## Differentiation

A deep-teal sidebar holding a warm gold cooperative accent, paired with tabular monospaced figures so every rupiah amount aligns like a real ledger.

## Color Palette

| Token      | OKLCH       | Role                                          |
| ---------- | ----------- | --------------------------------------------- |
| background | 0.985 0.004 185 | warm paper-white app canvas                |
| foreground | 0.19 0.02 200  | near-black ink for text and figures        |
| card       | 1.0 0.002 185  | white surfaces for cards, tables, forms    |
| primary    | 0.34 0.09 172  | deep teal — primary actions, active nav    |
| accent     | 0.76 0.14 78   | warm gold — cooperative brand highlights   |
| muted      | 0.955 0.008 185 | subdued rows, table stripes, disabled bg  |
| success    | 0.55 0.15 152  | posted, paid, balanced states             |
| warning    | 0.72 0.15 78   | due soon, pending interest, over-limit    |
| destructive | 0.55 0.21 25  | arrears, denda, unpost, delete            |
| chart-1..5 | teal/gold/indigo/green/rose | cash, savings, loans, SHU, expense charts |

## Typography

- Display: Space Grotesk — page titles, section headings, KPI labels
- Body: DM Sans — table cells, labels, paragraphs, form text
- Mono: JetBrains Mono — account codes, transaction numbers, all currency figures (`tabular-nums`)
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-sm`, figure `font-mono text-lg tabular-nums`

## Elevation & Depth

Flat layered surfaces: sidebar is a solid deep-teal slab, content is paper-white, cards lift with a 1px border plus `shadow-subtle`; modals use `shadow-elevated`. No gradients on surfaces except the primary button.

## Structural Zones

| Zone    | Background        | Border               | Notes                                        |
| ------- | ----------------- | -------------------- | -------------------------------------------- |
| Sidebar | `bg-sidebar` teal | `border-sidebar-border` | fixed, collapses to icon rail/drawer on mobile, logo + role badge at foot |
| Header  | `bg-card`         | `border-b border-border` | page title, search, month picker, avatar  |
| Content | `bg-background`   | —                    | KPI grid + chart cards; alternate `bg-muted/30` sections |
| Footer  | `bg-muted/40`     | `border-t border-border` | backup/version info, muted text          |

## Spacing & Rhythm

Page gutter `p-4 md:p-6 lg:p-8`, card padding `p-4 md:p-6`, KPI grid `gap-4`, table rows `py-2.5 px-3`, micro-spacing `gap-1.5` for label/value pairs.

## Component Patterns

- Buttons: `rounded-md`, primary = solid teal, accent = gold for brand actions, destructive = red; hover darkens 1 step with `transition-smooth`
- Cards: `rounded-lg`, `bg-card`, 1px border, `shadow-subtle`; KPI cards show uppercase label + large mono figure
- Tables: white card, `bg-muted/40` header row, `border-b` row dividers, right-aligned mono figures, hover `bg-muted/30`
- Badges: pill `rounded-full text-xs font-semibold`, success/warning/destructive tints for accounting states
- Inputs: `rounded-md`, `border-input`, focus `ring-2 ring-ring`

## Motion

- Entrance: content `fade-in 0.4s ease-out` staggered per card
- Hover: `transition-smooth` on buttons, rows, nav items
- Decorative: none — motion is functional only

## Constraints

- Raw OKLCH tokens only; no hex, `rgb()`, or arbitrary Tailwind colors in components
- Light mode primary; dark mode defined and intentionally tuned
- Sidebar-based admin shell that collapses to a drawer on mobile
- All currency/codes rendered with `font-mono tabular-nums`
- No decorative gradients or glow shadows

## Signature Detail

The ledger signature — every monetary value in JetBrains Mono with `tabular-nums`, right-aligned, so columns of rupiah read as a true printed ledger. (typographic treatment)
