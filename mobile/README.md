# Eyes - Vision Care Mobile App

A React Native mobile application built with Expo SDK 54 for vision care, eye tracking, and eye health exercises.

## SDK Version

- Expo SDK: 54.0.20
- React Native: 0.81.5
- React: 19.1.0

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo Go app (SDK 54+) installed on your device
- iOS Simulator (macOS only) or Android Emulator

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Running the App

### Using Expo Go

1. Install Expo Go from the App Store (iOS) or Play Store (Android)
2. Make sure you have Expo Go SDK 54+ installed
3. Run `npm start` to start the development server
4. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Using iOS Simulator (macOS only)

```bash
npm run ios
```

### Using Android Emulator

```bash
npm run android
```

### Web Browser

```bash
npm run web
```

## Features

This project is configured with:

- Expo Camera for eye tracking and vision exercises
- Expo AV for audio/video functionality
- React Navigation for screen navigation
- TypeScript for type safety
- Camera permissions pre-configured for iOS and Android

## Project Structure

```
mobile/
├── App.tsx              # Main application component
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── assets/              # Images, fonts, and other static assets
```

## Expo SDK Version Compatibility

This project uses Expo SDK 54. If you encounter version mismatch errors:

1. Make sure your Expo Go app is updated to SDK 54+
2. Check the installed SDK version in `package.json`:
   ```json
   "expo": "~54.0.20"
   ```

### Upgrading from SDK 51

If you were previously using SDK 51 and encountered compatibility issues, this project has been upgraded to SDK 54. The main changes include:

1. Updated all Expo packages to SDK 54 compatible versions
2. Updated React Native to 0.81.5
3. Updated React to 19.1.0
4. Configured camera permissions and plugins in `app.json`

## Troubleshooting

### "Project is incompatible with this version of Expo Go"

This error occurs when your Expo Go app version doesn't match the project's SDK version. Solutions:

1. **Update Expo Go**: Install the latest version from the App Store or Play Store
2. **Use a Simulator**: Run `npm run ios` or `npm run android` to use a simulator/emulator
3. **Verify SDK Version**: Check that `package.json` has `"expo": "~54.0.20"`

### Port Already in Use

If port 8081 is already in use:

```bash
# The development server will automatically offer to use a different port
# Or manually kill the process:
lsof -ti:8081 | xargs kill
```

### Metro Bundler Cache Issues

If you experience bundling issues:

```bash
# Clear the Metro bundler cache
npm start -- --clear

# Or manually clear it
rm -rf node_modules/.cache
```

## Development

This is a foundation for a vision care application. You can extend it with:

- Eye tracking features using the camera
- Vision exercises and tests
- User authentication and profiles
- Progress tracking and analytics
- Notifications and reminders

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
