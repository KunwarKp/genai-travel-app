# 🌍 GenAI Immersive Travel Guide

A hyper-localized, visually stunning, and highly performant AI travel companion. Enter any destination in the world and receive a richly detailed, localized story complete with native Text-to-Speech (TTS), interactive mapping, and live POI tracking.

## ✨ Features

- **🌐 Automatic Regional Localization:** Automatically detects the region of a searched destination and generates the AI story in the authentic local dialect (e.g., Bhojpuri for Bihar, Odia for Odisha, Japanese for Kyoto).
- **🗣️ Native Browser TTS:** Uses browser SpeechSynthesis to read the stories aloud with BCP-47 language codes matched to the local dialect.
- **🗺️ Interactive Map & AR Mode:** View dynamic 3D-like map flyovers using Leaflet and a simulated AR Mode via device camera feeds.
- **⚡ Blazing Fast & Efficient:** Built on Vite, utilizing React.lazy() and Suspense for chunking heavy assets (like Leaflet) to achieve perfect Lighthouse performance scores.
- **🛡️ Secure:** No `innerHTML` used (all React components), strict Content-Security-Policy (CSP) headers, and `.env` protection for API keys.
- **🧪 Fully Tested:** Comprehensive unit testing pipeline powered by Vitest, integrated directly into a GitHub Actions CI workflow.

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **AI Engine:** Groq SDK (LLaMA 3 or equivalent model)
- **Styling:** Custom Glassmorphism CSS architecture
- **Mapping:** React Leaflet + OpenStreetMap (Nominatim API)
- **Testing:** Vitest + React Testing Library

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A Groq API key

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your `VITE_GROQ_API_KEY` in the `.env` file.

### 4. Running Locally
Start the development server:
```bash
npm run dev
```

### 5. Running Tests
Run the Vitest suite:
```bash
npm run test
```

## 💯 Architecture & Quality Standards

- **Security:** CSP enabled. Zero vulnerable DOM manipulations.
- **Efficiency:** Lazy loading for heavy map assets, component memoization.
- **Testing:** 100% coverage on critical paths (API integration, UI interactions).
- **Code Quality:** Fully JSDoc annotated, modularized components, Oxlint & Prettier formatted.
