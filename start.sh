#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="/home/user85/Projects/KEDevs"
BACKEND_DIR="$ROOT_DIR/KEDevs-api"
FRONTEND_DIR="$ROOT_DIR/KEDevs-client"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  KEDevs Development Environment        ${NC}"
echo -e "${YELLOW}========================================${NC}"

# ──────────────────────────────────────
# Step 0: Kill existing processes
# ──────────────────────────────────────
echo -e "\n${CYAN}[SETUP] Freeing ports...${NC}"
if lsof -ti:8080 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:8080) 2>/dev/null && sleep 1
fi
if lsof -ti:3000 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:3000) 2>/dev/null && sleep 1
fi
if pgrep -x ngrok > /dev/null; then
    pkill -9 ngrok 2>/dev/null && sleep 1
fi
echo -e "${GREEN}[SETUP] Ports free.${NC}"

# ──────────────────────────────────────
# Step 1: Start ngrok on port 3000 (frontend)
# ──────────────────────────────────────
echo -e "\n${CYAN}[NGROK] Starting tunnel on port 3000...${NC}"
ngrok http 3000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"\K[^"]+' | head -1)
if [ -z "$NGROK_URL" ]; then
    NGROK_URL=$(grep -oP 'url=https://\K[^ ]+' /tmp/ngrok.log | head -1)
fi
if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}[NGROK] Failed. Is ngrok installed?${NC}"
    exit 1
fi

CALLBACK_URL="${NGROK_URL}/api/v1/payments/callback"
SITE_URL="${NGROK_URL}"

echo -e "${CYAN}────────────────────────────────────────${NC}"
echo -e "${CYAN}  🌐 Site URL:    ${SITE_URL}${NC}"
echo -e "${CYAN}  💰 Callback:    ${CALLBACK_URL}${NC}"
echo -e "${CYAN}────────────────────────────────────────${NC}"

# ──────────────────────────────────────
# Step 2: Inject callback URL into configs
# ──────────────────────────────────────
sed -i "s|DARAJA_CALLBACK_URL=.*|DARAJA_CALLBACK_URL=$CALLBACK_URL|" "$BACKEND_DIR/.env" 2>/dev/null || echo "DARAJA_CALLBACK_URL=$CALLBACK_URL" >> "$BACKEND_DIR/.env"
sed -i "s|DARAJA_CALLBACK_URL=.*|DARAJA_CALLBACK_URL=$CALLBACK_URL|" "$ROOT_DIR/.env" 2>/dev/null || echo "DARAJA_CALLBACK_URL=$CALLBACK_URL" >> "$ROOT_DIR/.env"
sed -i "s|daraja.callback.url=.*|daraja.callback.url=$CALLBACK_URL|" "$BACKEND_DIR/src/main/resources/application.properties"
echo -e "${CYAN}[CONFIG] Callback URL injected.${NC}"

# Also add ngrok URL to frontend's allowedDevOrigins
NEXT_CONFIG="$FRONTEND_DIR/next.config.ts"
NGROK_HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||')
sed -i "s|allowedDevOrigins: \[|allowedDevOrigins: \[\n    '${NGROK_HOSTNAME}',|" "$NEXT_CONFIG" 2>/dev/null

# ──────────────────────────────────────
# Step 3: Start backend (no tunnel needed — Next.js proxies /api/*)
# ──────────────────────────────────────
echo -e "\n${YELLOW}[BACKEND] Starting Spring Boot...${NC}"
cd "$BACKEND_DIR"
mvn spring-boot:run 2>&1 | while read line; do
    echo -e "${GREEN}[BACKEND]${NC} $line"
done &
BACKEND_PID=$!

# ──────────────────────────────────────
# Step 4: Start frontend
# ──────────────────────────────────────
echo -e "\n${YELLOW}[FRONTEND] Starting Next.js...${NC}"
cd "$FRONTEND_DIR"
npm run dev 2>&1 | while read line; do
    echo -e "${BLUE}[FRONTEND]${NC} $line"
done &
FRONTEND_PID=$!

# ──────────────────────────────────────
# Step 5: Clean shutdown
# ──────────────────────────────────────
trap "echo -e '\n${YELLOW}Shutting down...${NC}'; kill $NGROK_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait