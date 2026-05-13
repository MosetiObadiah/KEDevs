#!/bin/bash

# Colors for log distinction
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

ROOT_DIR="/home/user85/Projects/KEDevs"
BACKEND_DIR="$ROOT_DIR/KEDevs-api"
FRONTEND_DIR="$ROOT_DIR/KEDevs-client"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  KEDevs Development Environment        ${NC}"
echo -e "${YELLOW}========================================${NC}"

# ──────────────────────────────────────
# Step 0: Ensure Docker & PostgreSQL are running
# ──────────────────────────────────────
echo -e "\n${CYAN}[SETUP] Checking Docker...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}[SETUP] Docker is not running. Starting Docker...${NC}"
    
    # Try systemd first (Linux)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null
    # Fallback to service command
    elif command -v service &> /dev/null; then
        sudo service docker start 2>/dev/null
    # macOS
    elif command -v open &> /dev/null && [ -d "/Applications/Docker.app" ]; then
        open -a Docker
        echo -e "${YELLOW}[SETUP] Waiting for Docker to start (this may take a moment)...${NC}"
    fi
    
    # Wait for Docker to be ready
    DOCKER_WAIT=0
    while ! docker info > /dev/null 2>&1 && [ $DOCKER_WAIT -lt 30 ]; do
        sleep 2
        DOCKER_WAIT=$((DOCKER_WAIT + 2))
        echo -ne "${GRAY}[SETUP] Waiting for Docker... (${DOCKER_WAIT}s)${NC}\r"
    done
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "\n${RED}[SETUP] Docker failed to start. Please start it manually.${NC}"
        exit 1
    fi
    echo -e "\n${GREEN}[SETUP] Docker is now running.${NC}"
else
    echo -e "${GREEN}[SETUP] Docker is running.${NC}"
fi

# Check if PostgreSQL container is running
if ! docker ps --format '{{.Names}}' | grep -q 'postgres'; then
    echo -e "${YELLOW}[SETUP] PostgreSQL container not running. Starting...${NC}"
    
    # Check if container exists but is stopped
    if docker ps -a --format '{{.Names}}' | grep -q 'postgres'; then
        docker start postgres 2>/dev/null || docker start $(docker ps -a --format '{{.Names}} {{.Image}}' | grep postgres | awk '{print $1}')
    else
        echo -e "${RED}[SETUP] No PostgreSQL container found. Starting with docker-compose or run container manually.${NC}"
        # Try docker-compose if it exists
        if [ -f "$ROOT_DIR/docker-compose.yml" ] || [ -f "$ROOT_DIR/docker-compose.yaml" ]; then
            cd "$ROOT_DIR" && docker-compose up -d postgres 2>/dev/null || docker compose up -d postgres 2>/dev/null
        fi
    fi
    
    sleep 3
fi

# Verify PostgreSQL is accepting connections
if docker ps --format '{{.Names}}' | grep -q 'postgres'; then
    echo -e "${GREEN}[SETUP] PostgreSQL container is running.${NC}"
else
    echo -e "${YELLOW}[SETUP] Warning: PostgreSQL may not be running. Backend might fail to start.${NC}"
fi

# Now free ports
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
# Step 1: Start ngrok on port 3000
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
echo -e "${CYAN}  🌐 Site:  ${WHITE}${SITE_URL}${NC}"
echo -e "${CYAN}  💰 M-Pesa: ${WHITE}${CALLBACK_URL}${NC}"
echo -e "${CYAN}────────────────────────────────────────${NC}"

# ──────────────────────────────────────
# Step 2: Inject callback URL into configs
# ──────────────────────────────────────
sed -i "s|DARAJA_CALLBACK_URL=.*|DARAJA_CALLBACK_URL=$CALLBACK_URL|" "$BACKEND_DIR/.env" 2>/dev/null || echo "DARAJA_CALLBACK_URL=$CALLBACK_URL" >> "$BACKEND_DIR/.env"
sed -i "s|DARAJA_CALLBACK_URL=.*|DARAJA_CALLBACK_URL=$CALLBACK_URL|" "$ROOT_DIR/.env" 2>/dev/null || echo "DARAJA_CALLBACK_URL=$CALLBACK_URL" >> "$ROOT_DIR/.env"
sed -i "s|daraja.callback.url=.*|daraja.callback.url=$CALLBACK_URL|" "$BACKEND_DIR/src/main/resources/application.properties"

NGROK_HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||')
NEXT_CONFIG="$FRONTEND_DIR/next.config.ts"
if ! grep -q "$NGROK_HOSTNAME" "$NEXT_CONFIG" 2>/dev/null; then
    sed -i "s|allowedDevOrigins: \[|allowedDevOrigins: \[\n    '${NGROK_HOSTNAME}',|" "$NEXT_CONFIG"
fi

echo -e "${GREEN}[CONFIG] Callback URL injected.${NC}"

# ──────────────────────────────────────
# Step 3: Backend with colored log levels
# ──────────────────────────────────────
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  Starting services...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR"
mvn spring-boot:run 2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -qE '\bERROR\b'; then
        echo -e "${RED}[BACKEND] $line${NC}"
    elif echo "$line" | grep -qE '\bWARN\b'; then
        echo -e "${YELLOW}[BACKEND] $line${NC}"
    elif echo "$line" | grep -qE '\bINFO\b'; then
        echo -e "${GREEN}[BACKEND] $line${NC}"
    elif echo "$line" | grep -qE '\bDEBUG\b'; then
        echo -e "${GRAY}[BACKEND] $line${NC}"
    elif echo "$line" | grep -qi 'started\|tomcat\|listening'; then
        echo -e "${CYAN}[BACKEND] $line${NC}"
    elif echo "$line" | grep -qi 'hibernate:\|select\|insert\|update\|delete'; then
        echo -e "${MAGENTA}[BACKEND] $line${NC}"
    else
        echo -e "${GRAY}[BACKEND] $line${NC}"
    fi
done &
BACKEND_PID=$!

# ──────────────────────────────────────
# Step 4: Wait for backend, then start frontend with colored logs
# ─────────────────────────────────────
echo -e "\n${YELLOW}[FRONTEND] Waiting for backend to be ready...${NC}"
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}[FRONTEND] Backend is ready. Starting Next.js...${NC}"
        break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo -ne "${GRAY}[FRONTEND] Waiting for backend... (${WAITED}s)${NC}\r"
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "\n${YELLOW}[FRONTEND] Backend not responding after ${MAX_WAIT}s. Starting anyway...${NC}"
fi

cd "$FRONTEND_DIR"
npm run dev 2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -qE 'GET|POST|PUT|PATCH|DELETE|OPTIONS'; then
        METHOD=$(echo "$line" | grep -oE 'GET|POST|PUT|PATCH|DELETE|OPTIONS' | head -1)
        STATUS=$(echo "$line" | grep -oE ' [0-9]{3} ' | tr -d ' ')
        URL=$(echo "$line" | grep -oE '/[^ ]*' | head -1)
        
        case "$METHOD" in
            GET)    METHOD_COLOR="${BLUE}" ;;
            POST)   METHOD_COLOR="${GREEN}" ;;
            PUT)    METHOD_COLOR="${YELLOW}" ;;
            PATCH)  METHOD_COLOR="${YELLOW}" ;;
            DELETE) METHOD_COLOR="${RED}" ;;
            *)      METHOD_COLOR="${WHITE}" ;;
        esac
        
        if [ -n "$STATUS" ]; then
            if [[ "$STATUS" =~ ^2 ]]; then
                STATUS_COLOR="${GREEN}"
            elif [[ "$STATUS" =~ ^3 ]]; then
                STATUS_COLOR="${CYAN}"
            elif [[ "$STATUS" =~ ^4 ]]; then
                STATUS_COLOR="${YELLOW}"
            elif [[ "$STATUS" =~ ^5 ]]; then
                STATUS_COLOR="${RED}"
            fi
            MS_TIME=$(echo "$line" | grep -oP 'in \d+ms' || echo '')
            echo -e "${METHOD_COLOR}[${METHOD}]${NC} ${WHITE}${URL}${NC} ${STATUS_COLOR}${STATUS}${NC} ${GRAY}${MS_TIME}${NC}"
        else
            echo -e "${METHOD_COLOR}[${METHOD}]${NC} ${WHITE}${URL}${NC}"
        fi
    elif echo "$line" | grep -qi '\[browser\]'; then
        if echo "$line" | grep -qi 'error\|failed\|uncaught'; then
            echo -e "${RED}[BROWSER] $line${NC}"
        elif echo "$line" | grep -qi 'warn\|warning'; then
            echo -e "${YELLOW}[BROWSER] $line${NC}"
        else
            echo -e "${GRAY}[BROWSER] $line${NC}"
        fi
    elif echo "$line" | grep -qi 'compiled\|ready\|started\|✓\|▲'; then
        echo -e "${CYAN}[FRONTEND] $line${NC}"
    elif echo "$line" | grep -qi 'error\|fail'; then
        echo -e "${RED}[FRONTEND] $line${NC}"
    elif echo "$line" | grep -qi 'warn'; then
        echo -e "${YELLOW}[FRONTEND] $line${NC}"
    elif echo "$line" | grep -q 'node:'; then
        echo -e "${MAGENTA}[FRONTEND] $line${NC}"
    else
        echo -e "${GRAY}[FRONTEND] $line${NC}"
    fi
done &
FRONTEND_PID=$!

# ──────────────────────────────────────
# Clean shutdown
# ──────────────────────────────────────
trap "echo -e '\n${YELLOW}Shutting down...${NC}'; kill $NGROK_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait