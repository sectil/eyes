#!/bin/bash

# VisionCare - Kalibrasyon Uygulaması Başlatma Script'i
# AI Service + Web Server

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# PIDs
AI_SERVICE_PID=""
WEB_SERVER_PID=""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"

    if [ ! -z "$WEB_SERVER_PID" ]; then
        echo -e "${BLUE}Stopping Web Server (PID: $WEB_SERVER_PID)${NC}"
        kill -TERM $WEB_SERVER_PID 2>/dev/null || true
    fi

    if [ ! -z "$AI_SERVICE_PID" ]; then
        echo -e "${BLUE}Stopping AI Service (PID: $AI_SERVICE_PID)${NC}"
        kill -TERM $AI_SERVICE_PID 2>/dev/null || true
    fi

    sleep 2

    kill -9 $AI_SERVICE_PID 2>/dev/null || true
    kill -9 $WEB_SERVER_PID 2>/dev/null || true

    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "=========================================="
echo "  VisionCare - Kalibrasyon Uygulaması"
echo "=========================================="
echo ""

# Check directory
if [ ! -d "ai-service" ] || [ ! -d "calibration-app" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    echo "Please run: cd /home/user/eyes && ./start-calibration.sh"
    exit 1
fi

# Create logs directory
mkdir -p logs

# 1. Start AI Service
echo -e "${BLUE}[1/2] Starting AI Service (Python/MediaPipe)...${NC}"
cd ai-service

if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Virtual environment not found${NC}"
    echo "Please run:"
    echo "  cd ai-service"
    echo "  python3.11 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate
PORT=5001 python app.py > ../logs/ai-service.log 2>&1 &
AI_SERVICE_PID=$!
deactivate

echo -e "${GREEN}✓ AI Service started (PID: $AI_SERVICE_PID, Port: 5001)${NC}"
echo "  Log: logs/ai-service.log"
echo ""

# Wait for AI service
echo -e "${YELLOW}Waiting for AI Service to be ready...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ AI Service is ready!${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}Error: AI Service failed to start${NC}"
        echo -e "${YELLOW}Check logs: tail -f logs/ai-service.log${NC}"
        cleanup
    fi
    sleep 1
done
echo ""

# 2. Start Web Server for Calibration App
echo -e "${BLUE}[2/2] Starting Web Server (Calibration App)...${NC}"
cd ../calibration-app

# Check if Python is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 > ../logs/web-server.log 2>&1 &
    WEB_SERVER_PID=$!
    echo -e "${GREEN}✓ Web Server started (PID: $WEB_SERVER_PID, Port: 8080)${NC}"
    echo "  Log: logs/web-server.log"
else
    echo -e "${RED}Error: Python3 not found${NC}"
    cleanup
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  Kalibrasyon Uygulaması Hazır!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Servisler:${NC}"
echo -e "  AI Service:  ${GREEN}http://localhost:5001${NC} (PID: $AI_SERVICE_PID)"
echo -e "  Web App:     ${GREEN}http://localhost:8080${NC} (PID: $WEB_SERVER_PID)"
echo ""
echo -e "${BLUE}Kullanım:${NC}"
echo -e "  1. Tarayıcıda aç: ${GREEN}http://localhost:8080${NC}"
echo -e "  2. Kamera izni ver"
echo -e "  3. ${YELLOW}\"Kalibrasyon Yap\"${NC} butonuna tıkla"
echo -e "  4. 9 noktaya sırayla bak"
echo -e "  5. ${YELLOW}\"Kalibrasyonu Kaydet\"${NC} butonuna tıkla"
echo -e "  6. ${YELLOW}\"Göz Egzersizi\"${NC} veya ${YELLOW}\"Göz Takibi\"${NC} başlat"
echo ""
echo -e "${BLUE}Özellikler:${NC}"
echo -e "  ✅ 9 noktalı kalibrasyon"
echo -e "  ✅ Gerçek zamanlı göz takibi"
echo -e "  ✅ Göz egzersizleri"
echo -e "  ✅ Göz kırpma tespiti"
echo -e "  ✅ Bakış noktası gösterimi"
echo -e "  ✅ Göz bebeği hareketi kaydı"
echo ""
echo -e "${BLUE}Loglar:${NC}"
echo -e "  AI Service:  ${YELLOW}tail -f logs/ai-service.log${NC}"
echo -e "  Web Server:  ${YELLOW}tail -f logs/web-server.log${NC}"
echo ""
echo "=========================================="
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Follow web server logs
tail -f logs/web-server.log

cleanup
