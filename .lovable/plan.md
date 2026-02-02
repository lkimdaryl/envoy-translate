
# UI Layout Rearrangement Plan

## Target Layout (from mockup)

```text
+----------------------------------+
|  Translator              [☀️]    |  <- Header with theme toggle
|                  [Auto-translate]|  <- Toggle below header
|                                  |
| [English]  ⟷  [Spanish]         |  <- Language selectors in row
|                                  |
| +------------------------------+ |
| |                              | |  <- Input textarea
| |                        [🎤] | |  <- Mic icon inside
| +------------------------------+ |
|                                  |
|      [ Translate ]               |  <- Translate button
|                                  |
| +------------------------------+ |
| |                              | |  <- Output textarea
| |                              | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

## Changes Required

### 1. Translator.tsx - Main Layout Changes
- Move auto-translate toggle directly below the header (right-aligned)
- Create a new row for language selectors with swap button between them
- Stack input panel, translate button, and output panel vertically
- Remove the side-by-side desktop layout for language panels

### 2. TranslatorPanel.tsx - Simplify Component
- Remove the language selector from this component (moved to parent)
- Position microphone button inside/overlaid on the input textarea
- Keep copy/speak buttons for output panel

### 3. LanguageSelector.tsx - No changes needed
- Component already works standalone

## Technical Details

**File: `src/components/translator/Translator.tsx`**
- Restructure JSX to match mockup layout
- Create language selector row with: `[FromLang] [SwapBtn] [ToLang]`
- Auto-translate toggle moved to top-right under header
- Translate button between input and output sections

**File: `src/components/translator/TranslatorPanel.tsx`**
- Add new prop to hide language selector (or create separate textarea component)
- Position mic button as an overlay inside the textarea (bottom-right)
- Adjust padding/positioning for the overlay button
