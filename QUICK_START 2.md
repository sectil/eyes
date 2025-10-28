# VisionCare - Quick Start Guide

## 🚀 Simplified Single-Terminal Startup

Instead of running 5 separate terminals, you can now start everything with one command!

### Prerequisites (First Time Only)

1. **Python Environment Setup:**
```bash
cd ai-service
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

2. **Install Node Dependencies:**
```bash
cd backend && npm install --legacy-peer-deps && cd ..
cd mobile && npm install --legacy-peer-deps && cd ..
```

### Start All Services

**From project root:**
```bash
./start-all.sh
```

That's it! This single command will:
- ✅ Start AI Service (port 5001)
- ✅ Start Backend (port 3000)
- ✅ Start Mobile App (port 8081)
- ✅ Show status and logs
- ✅ Clean up everything when you press Ctrl+C

### Stop All Services

If services are running in background:
```bash
./stop-all.sh
```

Or if started with `./start-all.sh`, just press **Ctrl+C**.

---

## 📱 Using the App

### 1. Open Expo Go on Your iPhone

### 2. Scan QR Code
The QR code will appear in the terminal after running `./start-all.sh`

### 3. Grant Camera Permission
When prompted, allow camera access

### 4. Start Eye Tracking
Tap "Start Tracking" button

---

## 📊 Monitoring

### View All Logs:
```bash
tail -f logs/*.log
```

### View Specific Service:
```bash
tail -f logs/ai-service.log
tail -f logs/backend.log
tail -f logs/mobile.log
```

### Check Service Health:
```bash
# AI Service
curl http://localhost:5001/health

# Backend (if health endpoint exists)
curl http://localhost:3000/health
```

---

## 🔧 Troubleshooting

### Port Already in Use

**AI Service (port 5001):**
```bash
lsof -ti:5001 | xargs kill -9
```

**Backend (port 3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

**Mobile (port 8081):**
```bash
lsof -ti:8081 | xargs kill -9
```

**Or use the stop script:**
```bash
./stop-all.sh
```

### Services Won't Start

1. Check if Python venv exists:
```bash
ls -la ai-service/venv
```

2. Check if node_modules exist:
```bash
ls -la backend/node_modules
ls -la mobile/node_modules
```

3. Re-run prerequisites if needed

### Mobile Can't Connect to Backend

1. **Check backend is accessible:**
```bash
curl http://192.168.1.12:3000/health
```

2. **Verify mobile .env file:**
```bash
cat mobile/.env
# Should show: API_URL=http://192.168.1.12:3000
```

3. **Check firewall settings:**
   - Ensure Mac firewall allows connections on ports 3000 and 5001
   - Both devices must be on same WiFi network

### Camera Errors in Mobile App

1. **Grant camera permissions** in iPhone Settings → Expo Go
2. **Restart app** if permissions just granted
3. **Check logs** for specific error messages

---

## 📁 Project Structure

```
eyes/
├── start-all.sh          # 🚀 Start everything (NEW)
├── stop-all.sh           # 🛑 Stop everything (NEW)
├── QUICK_START.md        # This file
├── ROADMAP.md            # Complete project history
├── logs/                 # Service logs (auto-created)
│   ├── ai-service.log
│   ├── backend.log
│   └── mobile.log
├── ai-service/           # Python AI microservice
│   ├── app.py
│   ├── requirements.txt
│   ├── test_service.py
│   └── venv/
├── backend/              # Node.js/TRPC API
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── eyeTracking.ts
│   │   │   └── index.ts
│   │   └── services/
│   │       └── aiService.ts
│   └── .env
└── mobile/               # React Native/Expo app
    ├── src/
    │   └── screens/
    │       └── EyeTrackingScreen.tsx
    └── .env
```

---

## ⚡ Quick Commands Reference

| Task | Command |
|------|---------|
| **Start everything** | `./start-all.sh` |
| **Stop everything** | `./stop-all.sh` or Ctrl+C |
| **View all logs** | `tail -f logs/*.log` |
| **Test AI service** | `cd ai-service && source venv/bin/activate && python test_service.py` |
| **Clear logs** | `rm -f logs/*.log` |
| **Restart services** | `./stop-all.sh && ./start-all.sh` |

---

## 🎯 What Each Service Does

### AI Service (Python, Port 5001)
- MediaPipe face detection
- Eye blink detection (EAR algorithm)
- Pupil tracking with iris landmarks
- Gaze direction detection
- Glasses detection

### Backend (Node.js, Port 3000)
- TRPC API endpoints
- Image forwarding to AI service
- Type-safe client-server communication
- Request validation

### Mobile App (React Native, Port 8081)
- Camera access and photo capture
- Real-time eye tracking UI
- Display of AI analysis results
- Works in Expo Go (no dev build needed)

---

## 🌐 Network Configuration

### For Local Testing (Mac Only):
- Backend: `http://localhost:3000`
- AI Service: `http://localhost:5001`

### For iPhone Testing (Same WiFi):
- Backend: `http://192.168.1.12:3000`
- AI Service: `http://192.168.1.12:5001`

Make sure `mobile/.env` has:
```
API_URL=http://192.168.1.12:3000
```

---

## 📖 Additional Documentation

- **Full Project History**: See `ROADMAP.md`
- **AI Service Details**: See `ai-service/README.md`
- **Integration Examples**: See `ai-service/integration-example-nodejs.js`

---

## 🆘 Getting Help

### Check Logs First:
```bash
# See what's failing
tail -f logs/*.log
```

### Common Issues:

1. **"Port already in use"** → Run `./stop-all.sh`
2. **"Cannot connect to backend"** → Check `mobile/.env` has correct IP
3. **"MediaPipe not found"** → Check Python 3.11 venv setup
4. **"Camera not working"** → Check permissions in iPhone Settings

### Still Stuck?

1. Stop all services: `./stop-all.sh`
2. Clear logs: `rm -f logs/*.log`
3. Start fresh: `./start-all.sh`
4. Check logs: `tail -f logs/*.log`

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
