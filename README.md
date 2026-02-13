# Envoy Translate

A real-time translation web app that bridges language gaps with precision and clarity. Envoy supports 69+ languages with voice input/output, auto-translate, and a clean two-panel interface.

## Features

- **Real-Time Translation** — Auto-translate as you type or translate on demand, powered by the MyMemory Translation API
- **Voice Input & Output** — Speech-to-text for dictating input and text-to-speech for hearing translations
- **69+ Languages** — Swap between source and target languages with a single click
- **Dark / Light Theme** — Toggle between themes with preference saved across sessions
- **Persistent Preferences** — Selected languages, auto-translate state, and theme are saved in localStorage

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- React Query
- Vitest

## Getting Started

Requires [Node.js](https://nodejs.org/) (v18+).

```sh
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── translator/    # Translator, TranslatorPanel, LanguageSelector
│   └── ui/            # shadcn/ui components
├── data/              # Language list
├── hooks/             # Custom React hooks
├── pages/             # Route pages
└── main.tsx           # Entry point
```
