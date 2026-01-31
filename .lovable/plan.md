

# Language Translator App - Implementation Plan

## Overview
A modern, mobile-first language translator with auto-translation, dark mode, and speech capabilities using the MyMemory API.

---

## 1. Core Layout & Structure

### Mobile View (Stacked)
- **Header** with app title and dark mode toggle
- **Input Section**: Language dropdown + expandable textarea
- **Swap Button**: Centered, prominent icon button
- **Output Section**: Language dropdown + read-only textarea with utility icons
- **Translate Button**: Full-width, primary call-to-action

### Desktop View (Side-by-Side)
- Two-column layout with input on left, output on right
- Swap button centered between columns
- More compact utility buttons

---

## 2. Features & Components

### Language Selection
- Two dropdowns with 50+ languages (English, Spanish, French, German, etc.)
- Human-readable names with ISO 639-1 codes under the hood
- Last selected languages saved to localStorage

### Translation Controls
- **Auto-translate toggle**: On by default, translates as you type (500ms debounce)
- **Manual translate button**: Always available for explicit translation
- Loading spinner during API requests

### Output Utilities
- **Copy button**: Copies translation to clipboard with success feedback
- **Listen button**: Reads translation aloud using Web Speech API
- Visual feedback (toast notifications) for actions

### Error Handling
- Friendly error messages for network issues
- API rate limit warnings
- Empty state handling

---

## 3. Design & UX

### Visual Style
- Clean, minimalist design with subtle shadows and rounded corners
- Consistent color palette with primary accent color
- Dark mode toggle with smooth transitions

### Accessibility
- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management (auto-focus input on load)

### Responsiveness
- Mobile-first Tailwind classes
- Fluid typography and spacing
- Touch-friendly tap targets (min 44px)

---

## 4. Performance Optimizations

- **Debounced input**: 500ms delay before auto-translation
- **AbortController**: Cancels stale API requests
- **localStorage**: Persists language preferences
- Efficient re-renders with proper React state management

---

## Tech Stack
- React with TypeScript
- Tailwind CSS for styling
- MyMemory Translation API (free, no key required)
- Web Speech API for text-to-speech
- Sonner for toast notifications (already installed)

