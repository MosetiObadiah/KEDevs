#!/bin/bash
# KEDevs Development Environment Startup Script

# ──────────────────────────────────────
# Terminal-safe color setup (no raw escape leaks)
# ──────────────────────────────────────
if [ -t 1 ]; then
    # General
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    RED=$(tput setaf 1)
    WHITE=$(tput bold)
    GRAY=$(tput setaf 8 2>/dev/null || tput setaf 7)
    NC=$(tput sgr0)
    BOLD=$(tput bold)
    DIM=$(tput dim 2>/dev/null || tput setaf 8)

    # Backend label  — bright magenta (distinct, warm)
    BE_LABEL=$(tput setaf 5)$(tput bold)
    BE_INFO=$(tput setaf 5)
    BE_ERROR=$(tput setaf 1)$(tput bold)
    BE_WARN=$(tput setaf 3)
    BE_DEBUG=$(tput setaf 8 2>/dev/null || tput setaf 7)
    BE_SQL=$(tput setaf 6)        # cyan for SQL/Hibernate
    BE_START=$(tput setaf 2)$(tput bold)  # bold green for startup messages

    # Frontend label — bright blue (distinct, cool)
    FE_LABEL=$(tput setaf 4)$(tput bold)
    FE_ERROR=$(tput setaf 1)$(tput bold)
    FE_WARN=$(tput setaf 3)
    FE_READY=$(tput setaf 2)$(tput bold)
    FE_BROWSER=$(tput setaf 8 2>/dev/null || tput setaf 7)

    # HTTP method colors (used in frontend request logs)
    M_GET=$(tput setaf 4)$(tput bold)      # bold blue
    M_POST=$(tput setaf 2)$(tput bold)     # bold green
    M_PUT=$(tput setaf 3)$(tput bold)      # bold yellow
    M_DELETE=$(tput setaf 1)$(tput bold)   # bold red
    M_OTHER=$(tput setaf 7)$(tput bold)    # bold white

    # HTTP status colors
    S_2XX=$(tput setaf 2)
    S_3XX=$(tput setaf 6)
    S_4XX=$(tput setaf 3)
    S_5XX=$(tput setaf 1)$(tput bold)

    # Setup/system messages
    CYAN=$(tput setaf 6)
    BLUE=$(tput setaf 4)
    MAGENTA=$(tput setaf 5)
else
    GREEN='' YELLOW='' RED='' WHITE='' GRAY='' NC='' BOLD='' DIM=''
    BE_LABEL='' BE_INFO='' BE_ERROR='' BE_WARN='' BE_DEBUG='' BE_SQL='' BE_START=''
    FE_LABEL='' FE_ERROR='' FE_WARN='' FE_READY='' FE_BROWSER=''
    M_GET='' M_POST='' M_PUT='' M_DELETE='' M_OTHER=''
    S_2XX='' S_3XX='' S_4XX='' S_5XX=''
    CYAN='' BLUE='' MAGENTA=''
fi

ROOT_DIR="/home/user85/Projects/KEDevs"
BACKEND_DIR="$ROOT_DIR/KEDevs-api"
FRONTEND_DIR="$ROOT_DIR/KEDevs-client"

BACKEND_LOG="/tmp/kedevs_backend.log"
FRONTEND_LOG="/tmp/kedevs_frontend.log"
NGROK_LOG="/tmp/kedevs_ngrok.log"

BACKEND_PID=""
FRONTEND_PID=""
NGROK_PID=""

# ──────────────────────────────────────
# Helpers
# ──────────────────────────────────────
log()    { echo "${NC}$*${NC}"; }
info()   { echo "${CYAN}$*${NC}"; }
ok()     { echo "${GREEN}✔  $*${NC}"; }
warn()   { echo "${YELLOW}⚠  $*${NC}"; }
err()    { echo "${RED}✖  $*${NC}"; }
header() { echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo "${YELLOW}  $*${NC}"; echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

free_port() {
    local port=$1
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        kill -9 $pids 2>/dev/null
        sleep 0.5
    fi
}

# Color-filter log lines without using a subshell pipe (writes directly to terminal)
color_backend_line() {
    local line="$1"
    local prefix="${BE_LABEL}[Backend]${NC}"
    if echo "$line" | grep -qE '\bERROR\b'; then
        echo "${prefix} ${BE_ERROR}$line${NC}"
    elif echo "$line" | grep -qE '\bWARN\b'; then
        echo "${prefix} ${BE_WARN}$line${NC}"
    elif echo "$line" | grep -qiE 'started|tomcat|listening|running on|application.*started'; then
        echo "${prefix} ${BE_START}$line${NC}"
    elif echo "$line" | grep -qiE 'hibernate:|select |insert |update |delete '; then
        echo "${prefix} ${BE_SQL}$line${NC}"
    elif echo "$line" | grep -qE '\bINFO\b'; then
        echo "${prefix} ${BE_INFO}$line${NC}"
    elif echo "$line" | grep -qE '\bDEBUG\b'; then
        echo "${prefix} ${BE_DEBUG}$line${NC}"
    else
        echo "${prefix} ${BE_DEBUG}$line${NC}"
    fi
}

color_frontend_line() {
    local line="$1"
    local prefix="${FE_LABEL}[Frontend]${NC}"
    if echo "$line" | grep -qE '\b(GET|POST|PUT|PATCH|DELETE|OPTIONS)\b'; then
        local METHOD STATUS URL METHOD_COLOR STATUS_COLOR MS_TIME
        METHOD=$(echo "$line" | grep -oE 'GET|POST|PUT|PATCH|DELETE|OPTIONS' | head -1)
        STATUS=$(echo "$line" | grep -oE ' [0-9]{3} ' | tr -d ' ')
        URL=$(echo "$line" | grep -oE '/[^ ]*' | head -1)
        case "$METHOD" in
            GET)         METHOD_COLOR="$M_GET"    ;;
            POST)        METHOD_COLOR="$M_POST"   ;;
            PUT|PATCH)   METHOD_COLOR="$M_PUT"    ;;
            DELETE)      METHOD_COLOR="$M_DELETE" ;;
            *)           METHOD_COLOR="$M_OTHER"  ;;
        esac
        if [ -n "$STATUS" ]; then
            if   [[ "$STATUS" =~ ^2 ]]; then STATUS_COLOR="$S_2XX"
            elif [[ "$STATUS" =~ ^3 ]]; then STATUS_COLOR="$S_3XX"
            elif [[ "$STATUS" =~ ^4 ]]; then STATUS_COLOR="$S_4XX"
            elif [[ "$STATUS" =~ ^5 ]]; then STATUS_COLOR="$S_5XX"
            fi
            MS_TIME=$(echo "$line" | grep -oP 'in \d+ms' || true)
            echo "${prefix} ${METHOD_COLOR}${METHOD}${NC}  ${WHITE}${URL}${NC}  ${STATUS_COLOR}${STATUS}${NC}  ${GRAY}${MS_TIME}${NC}"
        else
            echo "${prefix} ${METHOD_COLOR}${METHOD}${NC}  ${WHITE}${URL}${NC}"
        fi
    elif echo "$line" | grep -qiE '\[browser\]'; then
        if echo "$line" | grep -qiE 'error|failed|uncaught'; then
            echo "${prefix} ${FE_ERROR}$line${NC}"
        elif echo "$line" | grep -qiE 'warn|warning'; then
            echo "${prefix} ${FE_WARN}$line${NC}"
        else
            echo "${prefix} ${FE_BROWSER}$line${NC}"
        fi
    elif echo "$line" | grep -qiE 'compiled|ready|started|✓|▲|local:.*http'; then
        echo "${prefix} ${FE_READY}$line${NC}"
    elif echo "$line" | grep -qiE 'error|fail'; then
        echo "${prefix} ${FE_ERROR}$line${NC}"
    elif echo "$line" | grep -qiE 'warn'; then
        echo "${prefix} ${FE_WARN}$line${NC}"
    else
        echo "${prefix} ${GRAY}$line${NC}"
    fi
}

# Tail a log file with color-filtering (runs in background, safe subshell)
tail_log() {
    local logfile="$1"
    local filter_fn="$2"          # "backend" or "frontend"
    tail -F "$logfile" 2>/dev/null | while IFS= read -r line; do
        if [ "$filter_fn" = "backend" ]; then
            color_backend_line "$line"
        else
            color_frontend_line "$line"
        fi
    done &
}

# ──────────────────────────────────────
# Clean shutdown — restores terminal
# ──────────────────────────────────────
shutdown() {
    echo ""
    warn "Shutting down all services..."
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null
    [ -n "$NGROK_PID"    ] && kill "$NGROK_PID"    2>/dev/null
    pkill -f "tail -F $BACKEND_LOG"  2>/dev/null
    pkill -f "tail -F $FRONTEND_LOG" 2>/dev/null
    # Restore terminal to a clean state
    tput cnorm 2>/dev/null   # show cursor
    tput rmcup 2>/dev/null   # exit alternate screen if entered
    stty sane 2>/dev/null    # restore stty settings (fixes arrow keys / random chars)
    echo ""
    ok "All services stopped. Terminal restored."
    exit 0
}
trap shutdown INT TERM EXIT

# ──────────────────────────────────────
# Step 1: Docker + PostgreSQL
# ──────────────────────────────────────
header "Checking Docker & PostgreSQL"

if ! docker info > /dev/null 2>&1; then
    warn "Docker is not running. Starting..."
    if command -v systemctl &>/dev/null; then
        sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null
    elif command -v service &>/dev/null; then
        sudo service docker start 2>/dev/null
    elif [ -d "/Applications/Docker.app" ]; then
        open -a Docker
    fi
    DOCKER_WAIT=0
    while ! docker info > /dev/null 2>&1 && [ $DOCKER_WAIT -lt 30 ]; do
        sleep 2; DOCKER_WAIT=$((DOCKER_WAIT + 2))
        echo -n "."
    done
    echo ""
    if ! docker info > /dev/null 2>&1; then
        err "Docker failed to start. Please start it manually."; exit 1
    fi
    ok "Docker started."
else
    ok "Docker is running."
fi

if ! docker ps --format '{{.Names}}' | grep -q 'postgres'; then
    warn "PostgreSQL not running. Starting..."
    if docker ps -a --format '{{.Names}}' | grep -q 'postgres'; then
        docker start postgres 2>/dev/null || \
        docker start "$(docker ps -a --format '{{.Names}} {{.Image}}' | grep postgres | awk '{print $1}' | head -1)" 2>/dev/null
    else
        if [ -f "$ROOT_DIR/docker-compose.yml" ] || [ -f "$ROOT_DIR/docker-compose.yaml" ]; then
            cd "$ROOT_DIR" && (docker compose up -d postgres 2>/dev/null || docker-compose up -d postgres 2>/dev/null)
        else
            err "No postgres container or docker-compose found. Backend may fail."
        fi
    fi
    sleep 2
fi

if docker ps --format '{{.Names}}' | grep -q 'postgres'; then
    ok "PostgreSQL is running."
else
    warn "PostgreSQL may not be running — backend might fail to connect."
fi

# ──────────────────────────────────────
# Step 2: Free ports (once)
# ──────────────────────────────────────
info "\n[SETUP] Freeing ports 8080 & 3000..."
free_port 8080 & free_port 3000 & wait
pkill -9 ngrok 2>/dev/null; sleep 0.5
ok "Ports free."

# ──────────────────────────────────────
# Step 3: Ngrok — install if missing, then start
# ──────────────────────────────────────
header "Starting ngrok"

if ! command -v ngrok &>/dev/null; then
    warn "ngrok not found. Attempting install..."
    if command -v snap &>/dev/null; then
        sudo snap install ngrok && ok "ngrok installed via snap."
    elif command -v apt-get &>/dev/null; then
        curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
        sudo apt-get update -qq && sudo apt-get install -y ngrok && ok "ngrok installed via apt."
    else
        err "Cannot install ngrok automatically. Please install it: https://ngrok.com/download"; exit 1
    fi
fi

> "$NGROK_LOG"
ngrok http 3000 --log=stdout > "$NGROK_LOG" 2>&1 &
NGROK_PID=$!

# Wait up to 10s for a tunnel URL
NGROK_URL=""
for i in $(seq 1 10); do
    sleep 1
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"\K[^"]+' | grep https | head -1)
    [ -n "$NGROK_URL" ] && break
    # Fallback: parse log
    NGROK_URL=$(grep -oP 'url=https://\K[^ ]+' "$NGROK_LOG" 2>/dev/null | head -1)
    [ -n "$NGROK_URL" ] && NGROK_URL="https://$NGROK_URL" && break
done

if [ -z "$NGROK_URL" ]; then
    err "ngrok failed to start. Check $NGROK_LOG for details."
    cat "$NGROK_LOG"
    exit 1
fi

CALLBACK_URL="${NGROK_URL}/api/v1/payments/callback"
SITE_URL="$NGROK_URL"

echo ""
echo "${CYAN}────────────────────────────────────────${NC}"
echo "${CYAN}  🌐  Site:   ${WHITE}${SITE_URL}${NC}"
echo "${CYAN}  💰  M-Pesa: ${WHITE}${CALLBACK_URL}${NC}"
echo "${CYAN}────────────────────────────────────────${NC}"
echo ""

# ──────────────────────────────────────
# Step 4: Inject URLs into configs
# ──────────────────────────────────────
info "[CONFIG] Injecting callback URL..."

inject_env() {
    local file="$1" key="$2" val="$3"
    [ -f "$file" ] || return
    if grep -q "^${key}=" "$file"; then
        sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    else
        echo "${key}=${val}" >> "$file"
    fi
}

inject_env "$BACKEND_DIR/.env" "DARAJA_CALLBACK_URL" "$CALLBACK_URL"
inject_env "$ROOT_DIR/.env"    "DARAJA_CALLBACK_URL" "$CALLBACK_URL"

if [ -f "$BACKEND_DIR/src/main/resources/application.properties" ]; then
    sed -i "s|daraja.callback.url=.*|daraja.callback.url=$CALLBACK_URL|" \
        "$BACKEND_DIR/src/main/resources/application.properties"
fi

NGROK_HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||')
NEXT_CONFIG="$FRONTEND_DIR/next.config.ts"
if [ -f "$NEXT_CONFIG" ] && ! grep -q "$NGROK_HOSTNAME" "$NEXT_CONFIG" 2>/dev/null; then
    sed -i "s|allowedDevOrigins: \[|allowedDevOrigins: \[\n    '${NGROK_HOSTNAME}',|" "$NEXT_CONFIG"
fi
ok "Config updated."

# ──────────────────────────────────────
# Service start/restart functions
# ──────────────────────────────────────
start_backend() {
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && sleep 1
    free_port 8080
    > "$BACKEND_LOG"
    echo "${BE_LABEL}[Backend]${NC} ${GREEN}Starting Spring Boot...${NC}"
    cd "$BACKEND_DIR" && mvn spring-boot:run >> "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
    echo "${BE_LABEL}[Backend]${NC} ${GRAY}PID=$BACKEND_PID  •  log: $BACKEND_LOG${NC}"
    tail_log "$BACKEND_LOG" "backend"
}

start_frontend() {
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && sleep 1
    free_port 3000
    > "$FRONTEND_LOG"
    echo "${FE_LABEL}[Frontend]${NC} ${GREEN}Starting Next.js...${NC}"
    cd "$FRONTEND_DIR" && npm run dev >> "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID=$!
    echo "${FE_LABEL}[Frontend]${NC} ${GRAY}PID=$FRONTEND_PID  •  log: $FRONTEND_LOG${NC}"
    tail_log "$FRONTEND_LOG" "frontend"
}

wait_for_backend() {
    local waited=0 max=120
    echo "${BE_LABEL}[Backend]${NC} ${CYAN}Waiting for health check on :8080...${NC}"
    while [ $waited -lt $max ]; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo "${BE_LABEL}[Backend]${NC} ${BE_START}✔  Ready (${waited}s)${NC}"
            return 0
        fi
        sleep 2; waited=$((waited + 2))
        echo -n "."
    done
    echo ""
    echo "${BE_LABEL}[Backend]${NC} ${YELLOW}⚠  Not responding after ${max}s — starting Frontend anyway.${NC}"
}

# ──────────────────────────────────────
# Step 5: Start backend, wait, start frontend
# ──────────────────────────────────────
header "Starting Services"
start_backend
wait_for_backend
start_frontend

# ──────────────────────────────────────
# Step 6: Interactive management prompt
# ──────────────────────────────────────
echo ""
header "All services running"
echo "${WHITE}Commands:${NC}"
echo "  ${BE_LABEL}rb${NC}  — restart Backend"
echo "  ${FE_LABEL}rf${NC}  — restart Frontend"
echo "  ${YELLOW}ra${NC}  — restart both"
echo "  ${BE_LABEL}lb${NC}  — show Backend log (last 50 lines)"
echo "  ${FE_LABEL}lf${NC}  — show Frontend log (last 50 lines)"
echo "  ${RED}q${NC}   — quit all services"
echo ""

# Use a clean read loop — no subshell, no broken terminal state
while true; do
    # Prompt without -p to avoid cursor issues in some terminals
    printf "${WHITE}kedevs>${NC} "
    IFS= read -r cmd
    case "$cmd" in
        rb) start_backend  ;;
        rf) start_frontend ;;
        ra) start_backend; wait_for_backend; start_frontend ;;
        lb) tail -n 50 "$BACKEND_LOG" ;;
        lf) tail -n 50 "$FRONTEND_LOG" ;;
        q|quit|exit) shutdown ;;
        "") : ;;
        *)  warn "Unknown command: $cmd" ;;
    esac
done