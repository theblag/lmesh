# LMESH ASCII Art & Terminal Text Formatting Guide

This document records the exact configuration required to render multi-line ASCII art banners and terminal text cleanly in the LMESH web frontend without line shifting, font distortion, or vertical gaps.

---

## 1. Why ASCII Art Misaligns in Web Apps

1. **Google Font Unicode Fallback Mismatch**:
   Web fonts loaded via Next.js (like `Geist Mono` or `JetBrains Mono`) use `subsets: ["latin"]`. Unicode Block Elements (`█`, `▒`, `▄`, `▀`) live in Unicode range `U+2580`–`U+259F`, which is omitted from Latin font subsets. When rendered:
   - Spaces (` `) use Google Web Fonts (e.g., 7.8px width).
   - Block elements (`█`/`▒`) fall back to system fonts (e.g., 9.2px width).
   - This width mismatch causes lines with varying space-to-block ratios to shift sideways.

2. **Template Literal Indentation**:
   Multi-line backtick strings inside JS/TS files inherit source code indentation spaces, corrupting line alignment.

3. **Line Height Vertical Gaps**:
   Standard HTML line heights (`1.4` or `1.8`) insert vertical pixel gaps between rows, splitting top/bottom block characters (`▄`/`▀`) apart.

4. **Letter Spacing Distortion**:
   CSS properties like `tracking-wider` add variable spacing to spaces vs unicode characters, distorting column alignment.

---

## 2. The Solution & Code Pattern

### A. JavaScript Array Declaration Pattern
Declare each line as an explicit fixed-length string in an array joined by `\n`:

```typescript
const ASCII_LOGO = [
  " ████                                   █████     ",
  "▒▒███                                  ▒▒███      ",
  " ▒███  █████████████    ██████   █████  ▒███████  ",
  " ▒███ ▒▒███▒▒███▒▒███  ███▒▒███ ███▒▒   ▒███▒▒███ ",
  " ▒███  ▒███ ▒███ ▒███ ▒███████ ▒▒█████  ▒███ ▒███ ",
  " ▒███  ▒███ ▒███ ▒███ ▒███▒▒▒   ▒▒▒▒███ ▒███ ▒███ ",
  " █████ █████▒███ █████▒▒██████  ██████  ████ █████",
  "▒▒▒▒▒ ▒▒▒▒▒ ▒▒▒ ▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒ ▒▒▒▒▒ "
].join("\n");
```

### B. JSX Container CSS Styling
Apply these exact CSS attributes to the container `<div>`:

```tsx
<div
  style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
  className="bg-linear-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent whitespace-pre leading-none text-[11px] sm:text-[12.5px] font-bold my-2.5 overflow-x-auto"
>
  {line.text}
</div>
```

---

## 3. Checklist of Required Attributes

| Attribute | Value / Utility | Purpose |
|---|---|---|
| `fontFamily` | `'Consolas, "Courier New", monospace'` | Forces 1:1 identical pixel width for spaces & block elements. |
| `white-space` | `whitespace-pre` | Preserves all leading, trailing, and internal spaces. |
| `line-height` | `leading-none` | Removes vertical gaps between rows of block characters. |
| `letter-spacing` | `tracking-normal` | Prevents horizontal column shifting. |
| `margin` | `my-2.5` | Compact vertical spacing around the header. |
