#!/bin/bash

# VisionCare - Stop All Services Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping VisionCare services...${NC}"
echo ""

# Stop Python AI Service (port 5001)
AI_PID=$(lsof -ti:5001)
if [ ! -z "$AI_PID" ]; then
    echo -e "${YELLOW}Stopping AI Service (PID: $AI_PID)${NC}"
    kill -TERM $AI_PID 2>/dev/null || kill -9 $AI_PID 2>/dev/null
    echo -e "${GREEN}✓ AI Service stopped${NC}"
else
    echo "  AI Service not running"
fi

# Stop Backend (port 3000)
BACKEND_PID=$(lsof -ti:3000)
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping Backend (PID: $BACKEND_PID)${NC}"
    kill -TERM $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo "  Backend not running"
fi

# Stop Mobile (port 8081)
MOBILE_PID=$(lsof -ti:8081)
if [ ! -z "$MOBILE_PID" ]; then
    echo -e "${YELLOW}Stopping Mobile App (PID: $MOBILE_PID)${NC}"
    kill -TERM $MOBILE_PID 2>/dev/null || kill -9 $MOBILE_PID 2>/dev/null
    echo -e "${GREEN}✓ Mobile App stopped${NC}"
else
    echo "  Mobile App not running"
fi

# Stop Metro bundler
METRO_PID=$(ps aux | grep "node.*metro" | grep -v grep | awk '{print $2}')
if [ ! -z "$METRO_PID" ]; then
    echo -e "${YELLOW}Stopping Metro Bundler (PID: $METRO_PID)${NC}"
    kill -TERM $METRO_PID 2>/dev/null || kill -9 $METRO_PID 2>/dev/null
    echo -e "${GREEN}✓ Metro Bundler stopped${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped.${NC}"
