#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}JUIT Robotics Hub - Development Startup${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed${NC}"
    echo -e "${YELLOW}Please install Go 1.21+ from https://golang.org/dl/${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Create temp directory for logs
LOGS_DIR=".dev-logs"
mkdir -p $LOGS_DIR

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}Services stopped${NC}"
}

trap cleanup EXIT

# Check if .env files exist
if [ ! -f "server/mail_service/.env" ]; then
    echo -e "${YELLOW}⚠ Warning: server/mail_service/.env not found${NC}"
    echo -e "${YELLOW}Please create it with: EMAIL, PASSWORD, PORT=3001${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ Warning: .env.local not found${NC}"
    echo -e "${YELLOW}Please create it from .env.example${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Backend
echo -e "${BLUE}Starting Backend (Go Mail Service)...${NC}"
cd server/mail_service

# Download dependencies if not present
if [ ! -d "vendor" ] && [ ! -f "go.sum" ]; then
    echo -e "${YELLOW}Downloading Go dependencies...${NC}"
    go mod download
fi

go run main.go > "../../$LOGS_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend PID: $BACKEND_PID${NC}"
echo -e "${GREEN}  Logs: $LOGS_DIR/backend.log${NC}"
echo -e "${GREEN}  URL: http://localhost:3001${NC}"

# Wait a bit for backend to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo -e "${YELLOW}Check logs: cat $LOGS_DIR/backend.log${NC}"
    exit 1
fi

# Go back to root
cd ../..

echo ""

# Start Frontend
echo -e "${BLUE}Starting Frontend (React + Vite)...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend PID: $FRONTEND_PID${NC}"
echo -e "${GREEN}  Logs: $LOGS_DIR/frontend.log${NC}"
echo -e "${GREEN}  URL: http://localhost:5173${NC}"

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Both services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Services running:${NC}"
echo -e "  ${GREEN}Frontend:${NC}  http://localhost:5173"
echo -e "  ${GREEN}Backend:${NC}   http://localhost:3001"
echo -e "  ${GREEN}Admin:${NC}     http://localhost:5173/admin"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Frontend: tail -f $LOGS_DIR/frontend.log"
echo -e "  Backend:  tail -f $LOGS_DIR/backend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Wait for both processes
wait
