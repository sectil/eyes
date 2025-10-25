# VisionCare - Proje Mimarisi

## 📋 Proje Özeti

**VisionCare**, yapay zeka destekli göz sağlığı takip ve test platformudur. Kullanıcılar kameralarını kullanarak göz sağlığını izleyebilir, kalibrasyon yapabilir ve çeşitli göz testlerine katılabilir.

**Platform:** iOS + Android (React Native / Expo)
**Backend:** Node.js + Express + TRPC
**Database:** PostgreSQL + Drizzle ORM
**AI/ML:** TensorFlow.js (FaceMesh), MediaPipe

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    VisionCare Mobile App                     │
│  (React Native / Expo - iOS & Android)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Module  │  │ Eye Tracking │  │ Test Engine  │      │
│  │ (Email/OAuth)│  │ (FaceMesh)   │  │ (Tests)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Calibration  │  │ Dashboard    │  │ Health Data  │      │
│  │ System       │  │ & Profile    │  │ Tracking     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API (TRPC)                      │
│  Node.js + Express + TypeScript                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Router  │  │ Profile      │  │ Test Results │      │
│  │              │  │ Router       │  │ Router       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Eye Data     │  │ Health       │  │ Analytics    │      │
│  │ Router       │  │ Router       │  │ Router       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  (Drizzle ORM)                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Users        │  │ Eye Profiles │  │ Test Results │      │
│  │ (Auth Data)  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Calibration  │  │ Health Logs  │  │ Sessions     │      │
│  │ Data         │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Veri Modeli

### **Users Table**
```typescript
{
  id: UUID (PK)
  email: string (unique)
  passwordHash: string (nullable)
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  loginMethod: 'email' | 'apple' | 'google'
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

### **EyeProfiles Table**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  age: number
  gender: string
  occupation: string
  dailyScreenTime: number
  dailyOutdoorTime: number
  sleepHours: number
  usesGlasses: boolean
  rightEyeDiopter: string
  leftEyeDiopter: string
  hasAstigmatism: boolean
  astigmatismDegree: string
  familyHistory: string
  lastEyeExam: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### **CalibrationData Table**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  calibrationPoints: JSON // 5-9 points
  calibrationMatrix: JSON // Transformation matrix
  accuracy: number // 0-100%
  timestamp: timestamp
  isValid: boolean
}
```

### **EyeTestResults Table**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  testType: 'snellen' | 'contrast' | 'color' | 'astigmatism' | 'convergence' | 'symptom'
  rightEyeScore: string
  leftEyeScore: string
  binocularScore: string
  rawData: JSON
  notes: string
  timestamp: timestamp
}
```

### **HealthLogs Table**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  date: date
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  fatigueScore: number // 0-10
  screenTime: number
  symptoms: string
  notes: string
  timestamp: timestamp
}
```

### **Sessions Table**
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  refreshToken: string (unique)
  expiresAt: timestamp
  createdAt: timestamp
  userAgent: string
  ipAddress: string
}
```

---

## 🔐 Güvenlik

### Authentication
- JWT access tokens (15 min expiry)
- Refresh tokens (7 days expiry)
- Password hashing with bcrypt (10 rounds)
- OAuth 2.0 for Apple/Google Sign-In

### API Security
- HTTPS only (TLS 1.3+)
- CORS configuration for mobile apps
- Rate limiting (100 req/min per user)
- Input validation with Zod schemas
- SQL injection prevention (Drizzle ORM)

### Data Protection
- Encrypted database connections
- Environment variables for secrets
- No sensitive data in logs
- GDPR compliance

---

## 📱 Mobile App Stack

### Core
- **Framework:** React Native + Expo SDK 50+
- **Language:** TypeScript
- **State Management:** Zustand
- **API Client:** TRPC + React Query

### UI/UX
- **UI Library:** React Native Paper
- **Navigation:** React Navigation 6
- **Forms:** React Hook Form + Zod
- **Animations:** React Native Reanimated

### Camera & AI
- **Camera:** Expo Camera
- **ML:** TensorFlow.js + FaceMesh
- **Eye Tracking:** Custom algorithms

### Storage
- **Local:** AsyncStorage
- **Secure:** Expo SecureStore
- **Cache:** React Query cache

---

## 🔧 Backend Stack

### Core
- **Runtime:** Node.js 18+
- **Framework:** Express
- **API:** TRPC
- **Language:** TypeScript

### Database
- **DB:** PostgreSQL 14+
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit

### Authentication
- **JWT:** jsonwebtoken
- **Password:** bcrypt
- **OAuth:** passport.js

### Utilities
- **Validation:** Zod
- **Email:** nodemailer
- **Logging:** winston
- **Testing:** Jest + Supertest

---

## 🚀 Deployment

### Backend
- **Hosting:** Railway / Render
- **Database:** PostgreSQL (managed)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry

### Mobile
- **iOS:** TestFlight → App Store
- **Android:** Google Play Beta → Play Store
- **OTA Updates:** Expo Updates
- **Analytics:** Expo Analytics

---

## 📈 Success Metrics

### User Metrics
- Monthly Active Users (MAU) > 1000
- 30-day retention > 40%
- Daily Active Users (DAU) / MAU > 0.25

### Technical Metrics
- API response time < 200ms (p95)
- Crash-free rate > 99.9%
- Calibration accuracy > 95%

### Business Metrics
- App Store rating > 4.5/5
- User satisfaction > 80%
- Test completion rate > 70%

---

## 🗓️ Development Phases

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Authentication | 2 weeks | 🚀 In Progress |
| 2. Eye Detection | 3 weeks | ⏳ Planned |
| 3. Eye Tests | 3 weeks | ⏳ Planned |
| 4. Dashboard | 2 weeks | ⏳ Planned |
| 5. Health Tracking | 2 weeks | ⏳ Planned |
| 6. Deployment | 2 weeks | ⏳ Planned |

**Total:** 14 weeks

---

## 🔗 API Endpoints (TRPC)

### Auth Router
- `auth.register` - Register new user
- `auth.login` - Login user
- `auth.logout` - Logout user
- `auth.refresh` - Refresh access token
- `auth.resetPassword` - Reset password
- `auth.verifyEmail` - Verify email

### Profile Router
- `profile.get` - Get user profile
- `profile.update` - Update profile
- `profile.getEyeProfile` - Get eye profile
- `profile.updateEyeProfile` - Update eye profile

### Test Router
- `test.getAll` - Get all tests
- `test.getById` - Get test by ID
- `test.create` - Create test result
- `test.getHistory` - Get test history

### Calibration Router
- `calibration.save` - Save calibration data
- `calibration.get` - Get latest calibration
- `calibration.validate` - Validate calibration

### Health Router
- `health.logEntry` - Create health log
- `health.getHistory` - Get health history
- `health.getTrends` - Get health trends
- `health.getRecommendations` - Get AI recommendations

---

## 📚 Further Reading

- [ROADMAP.md](./ROADMAP.md) - Project roadmap
- [TODO.md](./TODO.md) - Task list
- Backend API documentation (coming soon)
- Mobile app documentation (coming soon)
