#!/bin/bash

# VisionCare - Simplified Startup Script
# Starts all services from a single terminal

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Store process IDs for cleanup
AI_SERVICE_PID=""
BACKEND_PID=""
MOBILE_PID=""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"

    if [ ! -z "$MOBILE_PID" ]; then
        echo -e "${BLUE}Stopping Mobile App (PID: $MOBILE_PID)${NC}"
        kill -TERM $MOBILE_PID 2>/dev/null || true
    fi

    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}Stopping Backend (PID: $BACKEND_PID)${NC}"
        kill -TERM $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$AI_SERVICE_PID" ]; then
        echo -e "${BLUE}Stopping AI Service (PID: $AI_SERVICE_PID)${NC}"
        kill -TERM $AI_SERVICE_PID 2>/dev/null || true
    fi

    # Wait a moment for graceful shutdown
    sleep 2

    # Force kill if still running
    kill -9 $AI_SERVICE_PID 2>/dev/null || true
    kill -9 $BACKEND_PID 2>/dev/null || true
    kill -9 $MOBILE_PID 2>/dev/null || true

    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "========================================"
echo "  VisionCare - Starting All Services"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "ai-service" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    echo "Please run: cd /path/to/eyes && ./start-all.sh"
    exit 1
fi

# Check if backend and mobile exist
if [ ! -d "backend" ] || [ ! -d "mobile" ]; then
    echo -e "${YELLOW}Warning: backend or mobile directory not found${NC}"
    echo -e "${YELLOW}Only AI service will be started${NC}"
    echo ""
fi

# 1. Start AI Service
echo -e "${BLUE}[1/3] Starting AI Service (Python/MediaPipe)...${NC}"
cd ai-service

if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Virtual environment not found${NC}"
    echo "Please run: cd ai-service && python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate
PORT=5001 python app.py > ../logs/ai-service.log 2>&1 &
AI_SERVICE_PID=$!
deactivate

echo -e "${GREEN}✓ AI Service started (PID: $AI_SERVICE_PID, Port: 5001)${NC}"
echo "  Log: logs/ai-service.log"
echo ""

# Wait for AI service to be ready
echo -e "${YELLOW}Waiting for AI Service to be ready...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ AI Service is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}Error: AI Service failed to start${NC}"
        cleanup
    fi
    sleep 1
done
echo ""

# 2. Start Backend
echo -e "${BLUE}[2/3] Starting Backend (Node.js/TRPC)...${NC}"
cd ../backend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install --legacy-peer-deps
fi

npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID, Port: 3000)${NC}"
echo "  Log: logs/backend.log"
echo ""

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}Warning: Backend may not be fully ready${NC}"
    fi
    sleep 1
done
echo ""

# 3. Start Mobile App
echo -e "${BLUE}[3/3] Starting Mobile App (Expo)...${NC}"
cd ../mobile

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing mobile dependencies...${NC}"
    npm install --legacy-peer-deps
fi

echo -e "${GREEN}✓ Mobile App starting (Port: 8081)${NC}"
echo "  Log: logs/mobile.log"
echo ""

# Create logs directory
mkdir -p ../logs

# Start mobile in foreground with output
npm start > ../logs/mobile.log 2>&1 &
MOBILE_PID=$!

echo ""
echo "========================================"
echo -e "${GREEN}  All Services Running!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo -e "  AI Service:  ${GREEN}http://localhost:5001${NC} (PID: $AI_SERVICE_PID)"
echo -e "  Backend:     ${GREEN}http://localhost:3000${NC} (PID: $BACKEND_PID)"
echo -e "  Mobile:      ${GREEN}http://localhost:8081${NC} (PID: $MOBILE_PID)"
echo ""
echo -e "${BLUE}Network Access (from iPhone):${NC}"
echo -e "  Backend:     ${GREEN}http://192.168.1.12:3000${NC}"
echo -e "  AI Service:  ${GREEN}http://192.168.1.12:5001${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  AI Service:  ${YELLOW}tail -f logs/ai-service.log${NC}"
echo -e "  Backend:     ${YELLOW}tail -f logs/backend.log${NC}"
echo -e "  Mobile:      ${YELLOW}tail -f logs/mobile.log${NC}"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo -e "  View logs:   ${YELLOW}tail -f logs/*.log${NC}"
echo -e "  Stop all:    ${YELLOW}Press Ctrl+C${NC}"
echo ""
echo "========================================"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Follow mobile app logs
tail -f logs/mobile.log

# This will run when tail exits (shouldn't happen unless killed)
cleanup
