# VisionCare - AI-Powered Eye Tracking

Professional eye tracking application with real AI face detection, pupil tracking, and gaze analysis.

## 🚀 Quick Start (Recommended)

**Start everything with one command:**

```bash
./start-all.sh
```

**Stop everything:**

```bash
./stop-all.sh
```

Or press **Ctrl+C** when running `start-all.sh`.

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[ROADMAP.md](ROADMAP.md)** - Complete project history and architecture
- **[ai-service/README.md](ai-service/README.md)** - AI service API documentation

---

## ✨ Features

- ✅ **Real AI Face Detection** - MediaPipe with 478 facial landmarks
- ✅ **Eye Blink Detection** - EAR (Eye Aspect Ratio) algorithm
- ✅ **Pupil Tracking** - Precise iris landmark detection
- ✅ **Gaze Direction** - Real-time eye movement tracking
- ✅ **Glasses Detection** - Facial geometry analysis
- ✅ **Works in Expo Go** - No development build needed!

---

## 🏗️ Architecture

```
Mobile App (Expo Go)
        ↓
Backend (Node.js/TRPC, Port 3000)
        ↓
AI Service (Python/MediaPipe, Port 5001)
```

---

## 📋 Prerequisites (First Time Setup)

### 1. Python Environment
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

### 2. Node.js Dependencies
```bash
cd backend && npm install --legacy-peer-deps && cd ..
cd mobile && npm install --legacy-peer-deps && cd ..
```

### 3. Configuration

**Backend (.env):**
```
AI_SERVICE_URL=http://localhost:5001
```

**Mobile (.env):**
```
API_URL=http://192.168.1.12:3000
```
_(Replace with your Mac's local IP)_

---

## 🎯 Manual Startup (Alternative)

If you prefer to run each service separately:

### Terminal 1 - AI Service:
```bash
cd ai-service
source venv/bin/activate
PORT=5001 python app.py
```

### Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 3 - Mobile:
```bash
cd mobile
npm start
```

### Terminal 4 - Test AI Service:
```bash
cd ai-service
source venv/bin/activate
PORT=5001 python test_service.py
```

---

## 📱 Using the App

1. **Start services** with `./start-all.sh`
2. **Open Expo Go** on your iPhone
3. **Scan QR code** shown in terminal
4. **Grant camera permission** when prompted
5. **Tap "Start Tracking"** to begin

---

## 🔧 Troubleshooting

### Services won't start:
```bash
./stop-all.sh  # Stop everything
./start-all.sh # Start fresh
```

### Port conflicts:
```bash
# Kill specific port
lsof -ti:5001 | xargs kill -9  # AI Service
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:8081 | xargs kill -9  # Mobile
```

### View logs:
```bash
tail -f logs/*.log
```

### Check service health:
```bash
curl http://localhost:5001/health  # AI Service
curl http://localhost:3000/health  # Backend
```

---

## 📊 Performance

- **Detection Time**: ~50-200ms per frame
- **Capture Rate**: 1 FPS (adjustable)
- **Facial Landmarks**: 478 total (468 face + 10 iris)
- **Image Size**: ~230KB base64 per request

---

## 🛠️ Technology Stack

### AI Service (Python):
- Flask 3.1.2
- MediaPipe 0.10.14
- OpenCV 4.12.0
- NumPy 2.2.6

### Backend (Node.js):
- Express
- TRPC
- Axios
- Zod

### Mobile (React Native):
- Expo
- Expo Camera
- TRPC Client

---

## 📁 Project Structure

```
eyes/
├── start-all.sh          # 🚀 Start everything
├── stop-all.sh           # 🛑 Stop everything
├── QUICK_START.md        # Quick setup guide
├── ROADMAP.md            # Complete project history
├── logs/                 # Service logs
├── ai-service/           # Python AI microservice
├── backend/              # Node.js API
└── mobile/               # React Native app
```

---

## 🌐 Network Access

### Local (Mac):
- AI Service: http://localhost:5001
- Backend: http://localhost:3000
- Mobile: http://localhost:8081

### Network (iPhone):
- AI Service: http://192.168.1.12:5001
- Backend: http://192.168.1.12:3000

---

## 📖 API Endpoints

### AI Service:

**GET /health** - Check service status
```bash
curl http://localhost:5001/health
```

**POST /api/detect-face** - Analyze face from image
```bash
curl -X POST http://localhost:5001/api/detect-face \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,...", "timestamp": "..."}'
```

---

## 🔐 Environment Variables

### Backend (.env):
```
PORT=3000
AI_SERVICE_URL=http://localhost:5001
```

### Mobile (.env):
```
API_URL=http://192.168.1.12:3000
```

---

## 🧪 Testing

### Test AI Service:
```bash
cd ai-service
source venv/bin/activate
PORT=5001 python test_service.py
```

### Test Backend Connection:
```bash
curl http://localhost:3000/health
```

### View Real-Time Logs:
```bash
tail -f logs/ai-service.log
tail -f logs/backend.log
tail -f logs/mobile.log
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `./stop-all.sh` |
| Mobile can't connect | Check `mobile/.env` has correct IP |
| MediaPipe not found | Use Python 3.11, not 3.14 |
| Camera not working | Check permissions in iPhone Settings |
| Request entity too large | Already fixed (10MB body limit) |

---

## 📝 Git Branch

Current working branch: `claude/fix-metro-package-export-011CUVwPfC86uR2miwR2Nnws`

---

## 👥 Contributing

This is a professional AI eye tracking implementation using:
- Google MediaPipe for production-quality face detection
- Eye Aspect Ratio (EAR) algorithm for blink detection
- Iris landmarks for precise pupil tracking
- Real-time gaze direction analysis

---

## 📄 License

Professional AI solution for VisionCare application.

---

## 🎓 Learn More

- **MediaPipe**: https://mediapipe.dev/
- **Eye Aspect Ratio**: Standard computer vision algorithm for blink detection
- **TRPC**: Type-safe RPC framework for TypeScript
- **Expo**: React Native development platform

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
**Status**: ✅ Production Ready
