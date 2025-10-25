# VisionCare - Göz Sağlığı Asistanı

AI-powered eye health tracking and testing platform for iOS and Android.

## 🎯 Project Overview

VisionCare helps users monitor their eye health using AI-powered eye tracking, calibration, and various eye tests.

## 📦 Project Structure

```
visioncare/
├── backend/          # Node.js + Express + TRPC backend
├── mobile/           # React Native + Expo mobile app
├── docs/             # Project documentation
└── package.json      # Root package.json (monorepo)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup backend
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate

# Setup mobile
cd ../mobile
cp .env.example .env
# Edit .env with your backend URL
```

### Development

```bash
# Run both backend and mobile in development mode
npm run dev

# Run backend only
npm run dev:backend

# Run mobile only
npm run dev:mobile
```

## 📋 Development Roadmap

- [x] Phase 1: Authentication System (Current)
- [ ] Phase 2: Eye Detection & Calibration
- [ ] Phase 3: Eye Tests
- [ ] Phase 4: Dashboard & Profile
- [ ] Phase 5: Health Tracking & AI
- [ ] Phase 6: App Store Deployment

## 📚 Documentation

- [Project Architecture](./docs/PROJECT_ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [TODO List](./docs/TODO.md)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TRPC
- PostgreSQL + Drizzle ORM
- JWT Authentication
- OAuth (Apple, Google)

### Mobile
- React Native + Expo
- TensorFlow.js + FaceMesh
- Redux Toolkit / Zustand
- React Query

## 📄 License

MIT

## 👥 Team

VisionCare Team
