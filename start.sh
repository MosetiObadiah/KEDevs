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

    # PostgreSQL label — bold yellow/orange (warm earth tone)
    PG_LABEL=$(tput setaf 3)$(tput bold)
    PG_INFO=$(tput setaf 3)
    PG_ERROR=$(tput setaf 1)$(tput bold)
    PG_WARN=$(tput setaf 3)
    PG_READY=$(tput setaf 2)$(tput bold)

    # Redis label — bold cyan (cool, distinct from postgres)
    RD_LABEL=$(tput setaf 6)$(tput bold)
    RD_INFO=$(tput setaf 6)
    RD_ERROR=$(tput setaf 1)$(tput bold)
    RD_WARN=$(tput setaf 3)
    RD_READY=$(tput setaf 2)$(tput bold)

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
    PG_LABEL='' PG_INFO='' PG_ERROR='' PG_WARN='' PG_READY=''
    RD_LABEL='' RD_INFO='' RD_ERROR='' RD_WARN='' RD_READY=''
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

# Docker container names (must match docker ps --format '{{.Names}}')
PG_CONTAINER="kedevs_postgres"
RD_CONTAINER="kedevs_redis"

# Clean up log toggle state files on startup
rm -f /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe

PG_TAIL_PID=""
RD_TAIL_PID=""
BACKEND_TAIL_PID=""
FRONTEND_TAIL_PID=""

# ──────────────────────────────────────
# Helpers
# ──────────────────────────────────────
log()    { echo "${NC}$*${NC}"; }
info()   { echo "${CYAN}$*${NC}"; }
ok()     { echo "${GREEN}✔  $*${NC}"; }
warn()   { echo "${YELLOW}⚠  $*${NC}"; }
err()    { echo "${RED}✖  $*${NC}"; }
header() { echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo "${YELLOW}  $*${NC}"; echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

get_port_pids() {
    local port=$1
    local pids=""
    
    # Try ss first (standard on Linux, fast, never blocks on mounts or DNS)
    if command -v ss &>/dev/null; then
        pids=$(ss -tlnp "sport = :$port" 2>/dev/null | tr ',' '\n' | grep 'pid=' | cut -d= -f2 | xargs)
    fi
    
    # Fallback to lsof with timeout and no DNS/port name resolution
    if [ -z "$pids" ] && command -v lsof &>/dev/null; then
        pids=$(timeout 2 lsof -t -n -P -i :"$port" 2>/dev/null | xargs)
    fi
    
    echo "$pids"
}

free_port() {
    local port=$1
    local pids
    pids=$(get_port_pids "$port")
    for pid in $pids; do
        if [ "$pid" -eq "$$" ] 2>/dev/null || [ "$pid" -eq "$PPID" ] 2>/dev/null; then
            continue
        fi
        local name
        name=$(ps -p "$pid" -o comm= 2>/dev/null)
        if echo "$name" | grep -qiE 'zen|firefox|chrome|chromium|browser'; then
            echo "${YELLOW}⚠  Skipping PID $pid ($name) on port $port — looks like a browser.${NC}"
            continue
        fi
        kill -9 "$pid" 2>/dev/null
    done
    sleep 0.5
}


should_show_log() {
    local service="$1"
    [ ! -f "/tmp/.kedevs_hide_${service}" ]
}

toggle_log() {
    local service="$1"
    local label="$2"
    if should_show_log "$service"; then
        touch "/tmp/.kedevs_hide_${service}"
        warn "$label logs hidden."
    else
        rm -f "/tmp/.kedevs_hide_${service}"
        ok "$label logs shown."
    fi
}

show_only() {
    local active_service="$1"
    local active_label="$2"
    
    # Hide all
    touch /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe
    # Show active
    rm -f "/tmp/.kedevs_hide_${active_service}"
    
    ok "Now showing ONLY $active_label logs."
}

show_all() {
    rm -f /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe
    ok "Now showing ALL logs."
}

show_status() {
    header "Status & Log Configuration"
    echo "Services:"
    if docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
        echo "  PostgreSQL ($PG_CONTAINER): ${GREEN}RUNNING${NC}"
    else
        echo "  PostgreSQL ($PG_CONTAINER): ${RED}STOPPED${NC}"
    fi
    if docker ps --format '{{.Names}}' | grep -qx "$RD_CONTAINER"; then
        echo "  Redis ($RD_CONTAINER):      ${GREEN}RUNNING${NC}"
    else
        echo "  Redis ($RD_CONTAINER):      ${RED}STOPPED${NC}"
    fi
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "  Backend:                 ${GREEN}RUNNING${NC} (PID: $BACKEND_PID)"
    else
        echo "  Backend:                 ${RED}STOPPED${NC}"
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo "  Frontend:                ${GREEN}RUNNING${NC} (PID: $FRONTEND_PID)"
    else
        echo "  Frontend:                ${RED}STOPPED${NC}"
    fi

    echo ""
    echo "Log Toggles:"
    echo "  PostgreSQL (tp): $(should_show_log "pg" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Redis (tr):      $(should_show_log "rd" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Backend (tb):    $(should_show_log "be" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Frontend (tf):   $(should_show_log "fe" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo ""
}

# ──────────────────────────────────────
# Log colorizers
# ──────────────────────────────────────
color_backend_line() {
    should_show_log "be" || return
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
    should_show_log "fe" || return
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

color_postgres_line() {
    should_show_log "pg" || return
    local line="$1"
    local prefix="${PG_LABEL}[Postgres]${NC}"
    if echo "$line" | grep -qiE 'error|fatal|panic'; then
        echo "${prefix} ${PG_ERROR}$line${NC}"
    elif echo "$line" | grep -qiE 'warn'; then
        echo "${prefix} ${PG_WARN}$line${NC}"
    elif echo "$line" | grep -qiE 'ready to accept|database system|started|listening'; then
        echo "${prefix} ${PG_READY}$line${NC}"
    else
        echo "${prefix} ${PG_INFO}$line${NC}"
    fi
}

color_redis_line() {
    should_show_log "rd" || return
    local line="$1"
    local prefix="${RD_LABEL}[Redis]${NC}"
    if echo "$line" | grep -qiE '# .*error|oops|crashed'; then
        echo "${prefix} ${RD_ERROR}$line${NC}"
    elif echo "$line" | grep -qiE 'warn|# '; then
        echo "${prefix} ${RD_WARN}$line${NC}"
    elif echo "$line" | grep -qiE 'ready to accept|server initialized|loaded|started'; then
        echo "${prefix} ${RD_READY}$line${NC}"
    else
        echo "${prefix} ${RD_INFO}$line${NC}"
    fi
}

# ──────────────────────────────────────
# Log tailer — kills existing tailer first to prevent duplicate output
# ──────────────────────────────────────
tail_log() {
    local logfile="$1"
    local filter_fn="$2"   # "backend" | "frontend"

    if [ "$filter_fn" = "backend" ] && [ -n "$BACKEND_TAIL_PID" ]; then
        kill "$BACKEND_TAIL_PID" 2>/dev/null
        BACKEND_TAIL_PID=""
    elif [ "$filter_fn" = "frontend" ] && [ -n "$FRONTEND_TAIL_PID" ]; then
        kill "$FRONTEND_TAIL_PID" 2>/dev/null
        FRONTEND_TAIL_PID=""
    fi

    (
        tail -F "$logfile" 2>/dev/null | while IFS= read -r line; do
            if [ "$filter_fn" = "backend" ]; then
                color_backend_line "$line"
            else
                color_frontend_line "$line"
            fi
        done
    ) &

    if [ "$filter_fn" = "backend" ]; then
        BACKEND_TAIL_PID=$!
    else
        FRONTEND_TAIL_PID=$!
    fi
}

# Stream a docker container's logs, colored by service (only last 50 lines to prevent flooding)
tail_docker_logs() {
    local container="$1"
    local filter_fn="$2"   # "postgres" | "redis"

    (
        docker logs --tail 50 -f "$container" 2>&1 | while IFS= read -r line; do
            if [ "$filter_fn" = "postgres" ]; then
                color_postgres_line "$line"
            else
                color_redis_line "$line"
            fi
        done
    ) &

    if [ "$filter_fn" = "postgres" ]; then
        PG_TAIL_PID=$!
    else
        RD_TAIL_PID=$!
    fi
}

# ──────────────────────────────────────
# Ensure a docker container is running
# Returns 0 if running, 1 on failure
# ──────────────────────────────────────
ensure_container() {
    local name="$1"
    local label="$2"

    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
        ok "$label is already running."
        return 0
    fi

    if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
        warn "$label container exists but is stopped — starting..."
        if docker start "$name" > /dev/null 2>&1; then
            ok "$label started."
            return 0
        else
            err "Failed to start $label container '$name'."
            return 1
        fi
    fi

    err "Container '$name' not found. Please create it first."
    err "  Postgres: docker run -d --name $PG_CONTAINER -p 5432:5432 -e POSTGRES_PASSWORD=... postgres:17-alpine"
    err "  Redis:    docker run -d --name $RD_CONTAINER -p 6379:6379 redis:8.8-m03-alpine3.23"
    return 1
}

# ──────────────────────────────────────
# Clean shutdown — stops containers, restores terminal
# ──────────────────────────────────────
shutdown() {
    # Reset traps to prevent infinite recursion
    trap - INT TERM EXIT
    echo ""
    warn "Shutting down all services..."

    # Stop app processes
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null
    [ -n "$NGROK_PID"    ] && kill "$NGROK_PID"    2>/dev/null

    # Stop log tailers
    [ -n "$BACKEND_TAIL_PID"  ] && kill "$BACKEND_TAIL_PID"  2>/dev/null
    [ -n "$FRONTEND_TAIL_PID" ] && kill "$FRONTEND_TAIL_PID" 2>/dev/null
    [ -n "$PG_TAIL_PID"       ] && kill "$PG_TAIL_PID"       2>/dev/null
    [ -n "$RD_TAIL_PID"       ] && kill "$RD_TAIL_PID"       2>/dev/null

    # Stop Docker containers
    if docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER" 2>/dev/null; then
        warn "Stopping PostgreSQL container ($PG_CONTAINER)..."
        docker stop "$PG_CONTAINER" > /dev/null 2>&1 && ok "PostgreSQL stopped."
    fi
    if docker ps --format '{{.Names}}' | grep -qx "$RD_CONTAINER" 2>/dev/null; then
        warn "Stopping Redis container ($RD_CONTAINER)..."
        docker stop "$RD_CONTAINER" > /dev/null 2>&1 && ok "Redis stopped."
    fi

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
# Step 1: Docker + PostgreSQL + Redis
# ──────────────────────────────────────
header "Checking Docker & Containers"

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

ensure_container "$PG_CONTAINER" "PostgreSQL" || exit 1
ensure_container "$RD_CONTAINER" "Redis" || exit 1

# Give containers a moment to fully initialize if they were just started
sleep 1

# Stream container logs in the background (colored)
echo "${PG_LABEL}[Postgres]${NC} ${GRAY}Streaming logs from $PG_CONTAINER...${NC}"
tail_docker_logs "$PG_CONTAINER" "postgres"

echo "${RD_LABEL}[Redis]${NC} ${GRAY}Streaming logs from $RD_CONTAINER...${NC}"
tail_docker_logs "$RD_CONTAINER" "redis"

# ──────────────────────────────────────
# Step 2: Free ports (once)
# ──────────────────────────────────────
info "\n[SETUP] Freeing ports 8080 & 3000..."
free_port 8080
free_port 3000
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

kill_nextjs() {
    # 1. Kill our tracked PID
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null

    # 2. Kill any next-server process running from this project directory
    pkill -f "next-server" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    pkill -f "${FRONTEND_DIR}" 2>/dev/null

    # 3. Read the PID from Next.js's own lockfile and kill it
    local lockfile="$FRONTEND_DIR/.next/dev/locks/server.lock"
    if [ -f "$lockfile" ]; then
        local lock_pid
        lock_pid=$(cat "$lockfile" 2>/dev/null | tr -d '[:space:]')
        if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
            echo "${FE_LABEL}[Frontend]${NC} ${YELLOW}Killing Next.js lockfile PID $lock_pid${NC}"
            kill -9 "$lock_pid" 2>/dev/null
        fi
        rm -f "$lockfile" 2>/dev/null
    fi

    # 4. Kill anything still on port 3000, skipping browsers
    local stray
    stray=$(get_port_pids 3000)
    for pid in $stray; do
        local name
        name=$(ps -p "$pid" -o comm= 2>/dev/null)
        if echo "$name" | grep -qiE 'zen|firefox|chrome|chromium|browser'; then
            echo "${YELLOW}⚠  Skipping PID $pid ($name) on port 3000 — looks like a browser.${NC}"
            continue
        fi
        echo "${FE_LABEL}[Frontend]${NC} ${YELLOW}Killing stray PID $pid ($name) on :3000${NC}"
        kill -9 "$pid" 2>/dev/null
    done

    sleep 1
}

start_frontend() {
    kill_nextjs
    FRONTEND_PID=""

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
echo "  ${YELLOW}ra${NC}  — restart both Backend & Frontend"
echo "  ${BE_LABEL}lb${NC}  — show Backend log (last 50 lines)"
echo "  ${FE_LABEL}lf${NC}  — show Frontend log (last 50 lines)"
echo "  ${PG_LABEL}tp${NC}  — toggle Postgres logs"
echo "  ${RD_LABEL}tr${NC}  — toggle Redis logs"
echo "  ${BE_LABEL}tb${NC}  — toggle Backend logs"
echo "  ${FE_LABEL}tf${NC}  — toggle Frontend logs"
echo "  ${WHITE}op${NC}  — show Postgres logs ONLY"
echo "  ${WHITE}or${NC}  — show Redis logs ONLY"
echo "  ${WHITE}ob${NC}  — show Backend logs ONLY"
echo "  ${WHITE}of${NC}  — show Frontend logs ONLY"
echo "  ${WHITE}sa${NC}  — show ALL logs"
echo "  ${WHITE}status${NC} — show service and log status"
echo "  ${RED}q${NC}   — quit all services (stops Docker containers too)"
echo ""

# Use a clean read loop — no subshell, no broken terminal state
while true; do
    # Prompt without -p to avoid cursor issues in some terminals
    printf "${WHITE}kedevs> ${NC}"
    IFS= read -r cmd
    case "$cmd" in
        rb) start_backend  ;;
        rf) start_frontend ;;
        ra) start_backend; wait_for_backend; start_frontend ;;
        lb) tail -n 50 "$BACKEND_LOG" ;;
        lf) tail -n 50 "$FRONTEND_LOG" ;;
        tp) toggle_log "pg" "PostgreSQL" ;;
        tr) toggle_log "rd" "Redis" ;;
        tb) toggle_log "be" "Backend" ;;
        tf) toggle_log "fe" "Frontend" ;;
        op) show_only "pg" "PostgreSQL" ;;
        or) show_only "rd" "Redis" ;;
        ob) show_only "be" "Backend" ;;
        of) show_only "fe" "Frontend" ;;
        sa) show_all ;;
        status) show_status ;;
        q|quit|exit) shutdown ;;
        "") : ;;
        *)  warn "Unknown command: $cmd (type status to see choices)" ;;
    esac
done