# VisionCare Mobile

React Native mobile app for VisionCare eye health platform.

## Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **State:** Zustand
- **API:** TRPC + React Query
- **UI:** React Native Paper
- **AI/ML:** TensorFlow.js + FaceMesh

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your backend URL
```

3. Start development:
```bash
npm start
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Features

### Phase 1: Authentication ✅
- Email/Password registration
- Email/Password login
- Secure token storage
- Profile management
- OAuth (Apple, Google) - Coming soon

### Phase 2: Eye Detection (Coming Soon)
- Camera integration
- FaceMesh eye tracking
- Calibration system
- Blink detection

### Phase 3: Eye Tests (Coming Soon)
- Snellen test
- Color blindness test
- Contrast sensitivity
- Astigmatism test
- Convergence test

### Phase 4: Dashboard (Coming Soon)
- Test history
- Health metrics
- Trend analysis

### Phase 5: Health Tracking (Coming Soon)
- Daily health logs
- AI recommendations
- Notifications

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # App screens
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── services/       # API and services
│   ├── store/          # State management
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── assets/             # Images, fonts, etc.
├── App.tsx             # Main app component
└── app.json            # Expo configuration
```

## Authentication Flow

1. User registers or logs in
2. Tokens (access + refresh) stored in SecureStore
3. Access token sent with each API request
4. Refresh token used to get new access token when expired
5. User redirected to auth screens when tokens invalid

## Development

### Running on Device

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

### Testing OAuth

For OAuth development, you'll need:
1. Google OAuth credentials (iOS + Android)
2. Apple Sign In credentials (iOS only)
3. Configure in `.env` file

## Building for Production

### iOS

1. Configure in `app.json`
2. Build:
```bash
eas build --platform ios
```

### Android

1. Configure in `app.json`
2. Build:
```bash
eas build --platform android
```

## Troubleshooting

### Camera not working
- Check permissions in `app.json`
- Ensure device has camera access enabled

### TRPC connection issues
- Verify `API_URL` in `.env`
- Check backend is running
- Ensure network connectivity

### Token expiration
- Access tokens expire after 15 minutes
- Refresh token automatically used to get new access token
- If refresh token expired, user must log in again

## License

MIT
