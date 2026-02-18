# ACT SAMS PLATEC UI Style Guide

A minimal, functional design system for the ACT SAMS PLATEC attendance management system.

---

## Design Principles

1. **Simple** - No unnecessary decoration
2. **Functional** - Every element serves a purpose
3. **Consistent** - Same patterns across web and mobile
4. **Accessible** - Clear contrast and readable text

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Black | `#111111` | Primary text, primary buttons |
| White | `#FFFFFF` | Backgrounds, button text |
| Gray 50 | `#F9FAFB` | Page background |
| Gray 100 | `#F3F4F6` | Hover states, badges |
| Gray 200 | `#E5E7EB` | Borders, dividers |
| Gray 300 | `#D1D5DB` | Input borders |
| Gray 400 | `#9CA3AF` | Placeholder text |
| Gray 500 | `#6B7280` | Secondary text |
| Gray 600 | `#4B5563` | Labels |
| Gray 700 | `#374151` | Body text |
| Gray 900 | `#111827` | Headings, primary text |

### Status Colors

| Status | Background | Text | Border | Usage |
|--------|------------|------|--------|-------|
| Success | `#DCFCE7` | `#166534` | `#BBF7D0` | Present, active, success |
| Warning | `#FEF9C3` | `#854D0E` | `#FEF08A` | Late, pending |
| Danger | `#FEE2E2` | `#991B1B` | `#FECACA` | Absent, error, delete |
| Info | `#DBEAFE` | `#1E40AF` | `#BFDBFE` | Information, notices |

### Solid Status Colors (for buttons/indicators)

| Status | Color |
|--------|-------|
| Present/Success | `#16A34A` (green-600) |
| Late/Warning | `#EAB308` (yellow-500) |
| Absent/Danger | `#DC2626` (red-600) |

---

## Typography

### Font Family

```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 16px | Captions, labels |
| sm | 14px | 20px | Secondary text, table cells |
| base | 16px | 24px | Body text |
| lg | 18px | 28px | Card titles |
| xl | 20px | 28px | Section headers |
| 2xl | 24px | 32px | Page titles |
| 3xl | 30px | 36px | Large numbers/stats |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, buttons |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings, emphasis |

---

## Spacing

Use a 4px base unit. Common spacing values:

| Name | Size | Usage |
|------|------|-------|
| 1 | 4px | Tight spacing |
| 2 | 8px | Between related elements |
| 3 | 12px | Input padding (vertical) |
| 4 | 16px | Standard gap |
| 6 | 24px | Section padding |
| 8 | 32px | Large gaps |

---

## Components

### Buttons

**No rounded corners.** All buttons have sharp edges.

#### Primary Button
```css
background: #111827;
color: #FFFFFF;
border: 1px solid #111827;
padding: 8px 16px;
font-weight: 500;
font-size: 14px;
```
Hover: `background: #1F2937`

#### Secondary Button
```css
background: #FFFFFF;
color: #374151;
border: 1px solid #D1D5DB;
padding: 8px 16px;
font-weight: 500;
font-size: 14px;
```
Hover: `background: #F9FAFB`

#### Danger Button
```css
background: #DC2626;
color: #FFFFFF;
border: 1px solid #DC2626;
padding: 8px 16px;
font-weight: 500;
font-size: 14px;
```
Hover: `background: #B91C1C`

#### Ghost Button
```css
background: transparent;
color: #4B5563;
border: 1px solid transparent;
padding: 8px 16px;
font-weight: 500;
font-size: 14px;
```
Hover: `background: #F3F4F6`

#### Button Sizes
| Size | Padding | Font Size |
|------|---------|-----------|
| sm | 6px 10px | 14px |
| md | 8px 16px | 14px |
| lg | 12px 24px | 16px |

---

### Inputs

**No rounded corners.**

```css
background: #FFFFFF;
border: 1px solid #D1D5DB;
padding: 8px 12px;
font-size: 16px;
color: #111827;
```

Focus state:
```css
border-color: transparent;
outline: 2px solid #111827;
outline-offset: 0;
```

Error state:
```css
border-color: #DC2626;
```

#### Input with Label
```
Label text: font-size: 14px, font-weight: 500, color: #374151
Spacing between label and input: 4px
```

---

### Cards

**No rounded corners. No shadows.**

```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
padding: 24px;
```

#### Card Header
```css
margin-bottom: 16px;
```

#### Card Title
```css
font-size: 18px;
font-weight: 600;
color: #111827;
```

---

### Badges

**No rounded corners.**

```css
display: inline-flex;
padding: 2px 8px;
font-size: 14px;
font-weight: 500;
border: 1px solid;
```

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Success | #DCFCE7 | #166534 | #BBF7D0 |
| Warning | #FEF9C3 | #854D0E | #FEF08A |
| Danger | #FEE2E2 | #991B1B | #FECACA |
| Info | #DBEAFE | #1E40AF | #BFDBFE |
| Default | #F3F4F6 | #1F2937 | #E5E7EB |

---

### Tables

**No rounded corners.**

```css
border: 1px solid #E5E7EB;
```

#### Table Header
```css
background: #F9FAFB;
border-bottom: 1px solid #E5E7EB;
padding: 12px 16px;
font-size: 12px;
font-weight: 600;
color: #4B5563;
text-transform: uppercase;
letter-spacing: 0.05em;
```

#### Table Cell
```css
padding: 12px 16px;
font-size: 14px;
color: #374151;
border-bottom: 1px solid #E5E7EB;
```

#### Table Row Hover
```css
background: #F9FAFB;
```

---

### Modal / Dialog

**No rounded corners.**

```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
max-width: 512px; /* md size */
width: 100%;
```

#### Modal Header
```css
padding: 16px 24px;
border-bottom: 1px solid #E5E7EB;
```

#### Modal Title
```css
font-size: 18px;
font-weight: 600;
color: #111827;
```

#### Modal Body
```css
padding: 24px;
```

#### Modal Backdrop
```css
background: rgba(0, 0, 0, 0.5);
```

---

### Navigation (Navbar)

```css
background: #FFFFFF;
border-bottom: 1px solid #E5E7EB;
height: 56px;
padding: 0 16px;
```

#### Nav Logo
```css
font-weight: 700;
color: #111827;
```

#### Nav Link
```css
padding: 8px 12px;
font-size: 14px;
font-weight: 500;
color: #4B5563;
```

#### Nav Link Active
```css
background: #F3F4F6;
color: #111827;
```

#### Nav Link Hover
```css
background: #F9FAFB;
color: #111827;
```

---

### Alerts / Messages

**No rounded corners.**

#### Success Alert
```css
background: #DCFCE7;
border: 1px solid #BBF7D0;
color: #166534;
padding: 12px;
font-size: 14px;
```

#### Error Alert
```css
background: #FEE2E2;
border: 1px solid #FECACA;
color: #991B1B;
padding: 12px;
font-size: 14px;
```

---

### Attendance Status Buttons (Mobile)

For marking attendance on mobile, use toggle buttons:

#### Unselected
```css
background: #FFFFFF;
border: 1px solid #D1D5DB;
color: #4B5563;
padding: 6px 12px;
font-size: 14px;
font-weight: 500;
```

#### Selected - Present
```css
background: #16A34A;
border: 1px solid #16A34A;
color: #FFFFFF;
```

#### Selected - Late
```css
background: #EAB308;
border: 1px solid #EAB308;
color: #FFFFFF;
```

#### Selected - Absent
```css
background: #DC2626;
border: 1px solid #DC2626;
color: #FFFFFF;
```

---

## Layout

### Page Container
```css
max-width: 1280px;
margin: 0 auto;
padding: 0 16px;
```

### Page Header
```css
margin-bottom: 24px;
```

### Page Title
```css
font-size: 24px;
font-weight: 700;
color: #111827;
```

### Page Subtitle
```css
font-size: 14px;
color: #6B7280;
margin-top: 4px;
```

### Grid Gaps
- Cards grid: 16px gap
- Form fields: 16px gap
- Stats grid: 16px gap

---

## Mobile Considerations

### Touch Targets
- Minimum touch target: 44px × 44px
- Buttons: minimum height 44px on mobile

### Bottom Navigation (if used)
```css
background: #FFFFFF;
border-top: 1px solid #E5E7EB;
height: 56px;
position: fixed;
bottom: 0;
left: 0;
right: 0;
```

### Mobile Card
Same as desktop, but:
```css
padding: 16px;
```

### Mobile Input
Same styling, but ensure:
```css
font-size: 16px; /* Prevents iOS zoom on focus */
```

---

## Do's and Don'ts

### Do
- Use sharp corners (no border-radius)
- Use solid borders for definition
- Keep color palette minimal
- Use consistent spacing (multiples of 4px)
- Maintain clear visual hierarchy

### Don't
- Use rounded corners
- Use gradients
- Use shadows (except modals)
- Use fancy animations
- Use decorative elements

---

## Quick Reference

```
Corners:        0 (none)
Border:         1px solid #E5E7EB
Background:     #FFFFFF (cards) / #F9FAFB (page)
Primary:        #111827
Text:           #111827 (heading) / #374151 (body) / #6B7280 (secondary)
Success:        #16A34A
Warning:        #EAB308
Danger:         #DC2626
Font:           Inter, system-ui
```
