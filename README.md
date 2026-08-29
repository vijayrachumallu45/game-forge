# ⚡ GameForge Arcade - Cyberpunk HTML5 Gaming Hub

GameForge Arcade is a self-contained, high-performance HTML5 2D/3D arcade gaming platform built with React, HTML5 Canvas, and Web Audio API synthesizer technology. It includes 4 feature-rich arcade titles, local high-score tracking, achievement badge milestones, and mobile touch controls.

---

## 🎮 Included Arcade Games

1. 🚀 **Cosmic Defender** (`src/components/games/CosmicDefender.jsx`)
   - 60 FPS Space Shooter with enemy waves, Dreadnoughts, Mothership Boss encounters, triple lasers, energy shields, and screen-shake particle explosions.
2. 🧱 **Neon Breaker** (`src/components/games/NeonBreaker.jsx`)
   - Cyberpunk Brick Demolition with dynamic paddle curve bouncing, TNT explosive bricks, multi-ball drops, and paddle lasers.
3. 🏃 **Cyber Runner** (`src/components/games/CyberRunner.jsx`)
   - Dystopian Endless Platform Sprint featuring double jumps, slide dashing under security lasers, energy orbs, and scaling difficulty speed ramps.
4. 🐍 **Retro Snake 2099** (`src/components/games/RetroSnake.jsx`)
   - Cyber Grid Snake featuring SHIFT turbo boost, golden energy food, freeze-time food, and wrap/solid grid collision modes.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation
Clone or extract the repository and install all dependencies:
```bash
npm install
```

### Development Server
Run the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Run / Local Production Preview
To preview the production build locally:
```bash
npm run preview
```

### Build Production Bundle
To compile and bundle the application for production deployment:
```bash
npm run build
```
The output files will be generated inside the `dist/` directory.

### Run Unit Tests & Coverage
To execute the Vitest unit test suite and generate test coverage reports:
```bash
npm run test
npm run test:coverage
```

### Code Quality & Linting
To check code quality and enforce syntax rules:
```bash
npm run lint
```

---

## 🏗️ Architecture & Engine Core

```
gameforge/
├── src/
│   ├── engine/          # Custom 2D/3D Game Engine Core
│   │   ├── math/        # Vector2D, Vector3D, Matrix3x3, Raycasting, Easing
│   │   ├── ecs/         # Entity-Component-System Framework & Query Matchers
│   │   ├── physics/     # RigidBody2D, SAT Polygon Colliders, QuadTree Spatial Hashing
│   │   ├── graphics/    # Canvas 2D Pipeline, Particle Systems, Lighting, CRT Filters
│   │   ├── audio/       # Web Audio API Sound Synthesizer & Chiptune Music Tracker
│   │   ├── input/       # Unified Action Mapper (Keyboard, Mouse, Touch, Gamepad)
│   │   └── systems/     # SaveSystem, ScoreManager, AchievementSystem, LevelGenerators
│   ├── games/           # Game State Logic & Entities for Arcade Titles
│   ├── components/      # React UI Components (Header, Catalog, Modals, Touch Overlay)
│   ├── utils/           # Web Audio Sound Synthesizer & LocalStorage Manager
│   ├── App.jsx          # Main Arcade Portal Container
│   └── App.css          # Cyberpunk Glassmorphic Theme & Animations
├── tests/               # Vitest Unit Test Suite (Math, Physics, Audio, Storage)
├── package.json         # Build Scripts & Project Manifest
└── vite.config.js       # Vite Bundler Configuration
```

---

## ⌨️ Controls & Usage

| Action | Desktop Controls | Mobile / Touch Controls |
| :--- | :--- | :--- |
| **Move / Turn** | `WASD` or `Arrow Keys` | On-Screen Touch D-Pad |
| **Action / Fire / Jump** | `SPACE` | On-Screen `A` Button |
| **Slide / Secondary** | `DOWN` or `S` | On-Screen `B` Button |
| **Turbo Boost (Snake)** | `SHIFT` | Hold Action `A` Button |
| **Pause / Resume** | `P` Key | HUD Pause Button |
| **Audio Toggle** | Header Audio Buttons | Header Audio Buttons |

---

## 🔒 Security & Ownership

- **Proprietary Software**: No open source licenses (MIT, Apache, GPL).
- **100% Offline Client-Side**: No API keys, external databases, or network dependencies.
- **Zero Sensitive Data**: All user progress saved in local browser `localStorage`.
