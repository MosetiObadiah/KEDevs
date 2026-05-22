#!/bin/bash
# KEDevs Development Environment Startup Script — v2

# ──────────────────────────────────────
# Terminal-safe color setup
# ──────────────────────────────────────
if [ -t 1 ]; then
    GREEN=$(tput setaf 2);  YELLOW=$(tput setaf 3);  RED=$(tput setaf 1)
    WHITE=$(tput bold);     GRAY=$(tput setaf 8 2>/dev/null || tput setaf 7)
    NC=$(tput sgr0);        BOLD=$(tput bold)
    BE_LABEL=$(tput setaf 5)$(tput bold)
    BE_ERROR=$(tput setaf 1)$(tput bold)   # bold red     — ERROR
    BE_WARN=$(tput setaf 3)$(tput bold)    # bold yellow  — WARN / WARNING
    BE_INFO=$(tput setaf 5)               # magenta      — INFO
    BE_START=$(tput setaf 2)$(tput bold)   # bold green   — startup milestones
    BE_SQL=$(tput setaf 6)                # cyan         — SQL/Hibernate
    BE_DEBUG=$(tput setaf 4)              # blue         — DEBUG (distinct from gray noise)
    FE_LABEL=$(tput setaf 4)$(tput bold);  FE_ERROR=$(tput setaf 1)$(tput bold)
    FE_WARN=$(tput setaf 3);               FE_READY=$(tput setaf 2)$(tput bold)
    FE_BROWSER=$(tput setaf 8 2>/dev/null || tput setaf 7)
    PG_LABEL=$(tput setaf 3)$(tput bold);  PG_ERROR=$(tput setaf 1)$(tput bold)
    PG_WARN=$(tput setaf 3);               PG_INFO=$(tput setaf 3)
    PG_READY=$(tput setaf 2)$(tput bold)
    RD_LABEL=$(tput setaf 6)$(tput bold);  RD_ERROR=$(tput setaf 1)$(tput bold)
    RD_WARN=$(tput setaf 3);               RD_INFO=$(tput setaf 6)
    RD_READY=$(tput setaf 2)$(tput bold)
    M_GET=$(tput setaf 4)$(tput bold);     M_POST=$(tput setaf 2)$(tput bold)
    M_PUT=$(tput setaf 3)$(tput bold);     M_DELETE=$(tput setaf 1)$(tput bold)
    M_OTHER=$(tput setaf 7)$(tput bold)
    S_2XX=$(tput setaf 2);  S_3XX=$(tput setaf 6)
    S_4XX=$(tput setaf 3);  S_5XX=$(tput setaf 1)$(tput bold)
    CYAN=$(tput setaf 6);   BLUE=$(tput setaf 4);  MAGENTA=$(tput setaf 5)
else
    GREEN='' YELLOW='' RED='' WHITE='' GRAY='' NC='' BOLD=''
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
BACKEND_TAIL_PID=""
FRONTEND_TAIL_PID=""
PG_TAIL_PID=""
RD_TAIL_PID=""

PG_CONTAINER="kedevs_postgres"
RD_CONTAINER="kedevs_redis"

# ── Backend log filter — what Spring levels to SHOW in the live stream ──────
# Values: ERROR WARN INFO DEBUG SQL ALL
# By default only ERROR and WARN are shown live; use `lb` to see full log.
BE_SHOW_LEVELS="${BE_SHOW_LEVELS:-ERROR WARN}"

rm -f /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe

# ──────────────────────────────────────
# Helpers
# ──────────────────────────────────────
log()    { echo "${NC}$*${NC}"; }
info()   { echo "${CYAN}$*${NC}"; }
ok()     { echo "${GREEN}✔  $*${NC}"; }
warn()   { echo "${YELLOW}⚠  $*${NC}"; }
err()    { echo "${RED}✖  $*${NC}"; }
header() {
    echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${YELLOW}  $*${NC}"
    echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

get_port_pids() {
    local port=$1 pids=""
    if command -v ss &>/dev/null; then
        pids=$(ss -tlnp "sport = :$port" 2>/dev/null | tr ',' '\n' | grep 'pid=' | cut -d= -f2 | xargs)
    fi
    if [ -z "$pids" ] && command -v lsof &>/dev/null; then
        pids=$(timeout 2 lsof -t -n -P -i :"$port" 2>/dev/null | xargs)
    fi
    echo "$pids"
}

free_port() {
    local port=$1 pids name
    pids=$(get_port_pids "$port")
    for pid in $pids; do
        [[ "$pid" -eq "$$" || "$pid" -eq "$PPID" ]] 2>/dev/null && continue
        name=$(ps -p "$pid" -o comm= 2>/dev/null)
        if [[ "$name" =~ zen|firefox|chrome|chromium|browser ]]; then
            warn "Skipping PID $pid ($name) on port $port — looks like a browser."
            continue
        fi
        kill -9 "$pid" 2>/dev/null
    done
    sleep 0.3
}

should_show_log() { [ ! -f "/tmp/.kedevs_hide_${1}" ]; }

toggle_log() {
    local service="$1" label="$2"
    if should_show_log "$service"; then
        touch "/tmp/.kedevs_hide_${service}"; warn "$label logs hidden."
    else
        rm -f "/tmp/.kedevs_hide_${service}"; ok "$label logs shown."
    fi
}

show_only() {
    touch /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe
    rm -f "/tmp/.kedevs_hide_${1}"
    ok "Now showing ONLY $2 logs."
}

show_all() {
    rm -f /tmp/.kedevs_hide_pg /tmp/.kedevs_hide_rd /tmp/.kedevs_hide_be /tmp/.kedevs_hide_fe
    ok "Now showing ALL logs."
}

show_status() {
    header "Status & Log Configuration"
    echo "Services:"
    docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER" \
        && echo "  PostgreSQL ($PG_CONTAINER): ${GREEN}RUNNING${NC}" \
        || echo "  PostgreSQL ($PG_CONTAINER): ${RED}STOPPED${NC}"
    docker ps --format '{{.Names}}' | grep -qx "$RD_CONTAINER" \
        && echo "  Redis ($RD_CONTAINER):      ${GREEN}RUNNING${NC}" \
        || echo "  Redis ($RD_CONTAINER):      ${RED}STOPPED${NC}"
    { [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; } \
        && echo "  Backend:                 ${GREEN}RUNNING${NC} (PID: $BACKEND_PID)" \
        || echo "  Backend:                 ${RED}STOPPED${NC}"
    { [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; } \
        && echo "  Frontend:                ${GREEN}RUNNING${NC} (PID: $FRONTEND_PID)" \
        || echo "  Frontend:                ${RED}STOPPED${NC}"
    echo ""
    echo "Live log filters (BE_SHOW_LEVELS): ${WHITE}${BE_SHOW_LEVELS}${NC}"
    echo "  Use 'blevels ERROR WARN INFO' to change. Use 'lb' / 'lf' for full logs."
    echo ""
    echo "Log Toggles:"
    echo "  PostgreSQL (tp): $(should_show_log "pg" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Redis (tr):      $(should_show_log "rd" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Backend (tb):    $(should_show_log "be" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo "  Frontend (tf):   $(should_show_log "fe" && echo "${GREEN}SHOWING${NC}" || echo "${RED}HIDDEN${NC}")"
    echo ""
}

# ──────────────────────────────────────
# Log colorizers — use bash [[ =~ ]] to avoid fork-per-line grep overhead
# ──────────────────────────────────────

# Returns 0 if $1 (level string like "ERROR") is in BE_SHOW_LEVELS
be_level_visible() {
    local lvl="$1"
    [[ "$BE_SHOW_LEVELS" == *"$lvl"* || "$BE_SHOW_LEVELS" == *"ALL"* ]]
}

color_backend_line() {
    should_show_log "be" || return
    local line="$1"
    local prefix="${BE_LABEL}[BE]${NC}"

    # ── Noise suppression ────────────────────────────────────────────────────
    # Drop known-voluminous lines that are never actionable in dev:
    #   • HikariCP pool stats / heartbeat pings
    #   • Hibernate parameter binding & pool metadata
    #   • Tomcat/NIO thread lifecycle
    #   • Spring bean factory / handler mapping
    #   • Actuator self-health-check calls
    #   • JVM/Netty native-access WARNINGs (suppress at source by adding
    #     --enable-native-access=ALL-UNNAMED to MAVEN_OPTS instead)
    if [[ "$line" =~ (binding[[:space:]]parameter|Minimum[[:space:]]pool[[:space:]]size|Maximum[[:space:]]pool[[:space:]]size|Pool:[[:space:]]DataSource|HikariPool|o\.s\.b\.a\.e\.web|actuator/health|NioEndpoint|ajp-|AbstractHandlerMapping|InitializingBean|DefaultListableBeanFactory|tomcat\.util|TaskScheduler|NativeLibraryUtil|enable-native-access|Restricted[[:space:]]methods[[:space:]]will[[:space:]]be[[:space:]]blocked|restricted[[:space:]]method[[:space:]]in[[:space:]]java\.lang) ]]; then
        return
    fi

    # ── Classify by level ────────────────────────────────────────────────────
    # ── Level detection — match the Spring level FIELD (before the PID), not anywhere in the line.
    # Spring format: "<timestamp>  LEVEL PID --- [app] [thread] logger : message"
    # JVM format:    "WARNING: some message" (starts at column 0)
    # We extract the level word that appears between whitespace and a space+digits pattern.
    local level=""
    if [[ "$line" =~ [[:space:]](ERROR|WARN|INFO|DEBUG|TRACE)[[:space:]][0-9] ]]; then
        level="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ ^(WARNING|ERROR): ]]; then
        level="${BASH_REMATCH[1]}"
        [[ "$level" == "WARNING" ]] && level="WARN"
    fi

    # ERROR — always visible, bold red with marker
    if [[ "$level" == "ERROR" ]]; then
        echo "${prefix} ${BE_ERROR}▶ ERROR ◀ ${NC}${BE_ERROR}$line${NC}"

    # WARN / WARNING — bold yellow
    elif [[ "$level" == "WARN" ]]; then
        be_level_visible "WARN" && echo "${prefix} ${BE_WARN}⚠ $line${NC}"

    # Startup milestones (INFO level, special message) — bold green
    elif [[ "$level" == "INFO" && "$line" =~ [Ss]tarted|[Ll]istening|[Rr]unning[[:space:]]on|[Aa]pplication.*[Ss]tarted ]]; then
        be_level_visible "INFO" && echo "${prefix} ${BE_START}$line${NC}"

    # SQL/Hibernate — cyan
    elif [[ "$line" =~ [Hh]ibernate:|[[:space:]]select[[:space:]]|[[:space:]]insert[[:space:]]|[[:space:]]update[[:space:]]|[[:space:]]delete[[:space:]] ]]; then
        be_level_visible "SQL" && echo "${prefix} ${BE_SQL}$line${NC}"

    # INFO — magenta
    elif [[ "$level" == "INFO" ]]; then
        be_level_visible "INFO" && echo "${prefix} ${BE_INFO}$line${NC}"

    # DEBUG — blue (visually distinct from gray unclassified lines)
    elif [[ "$level" == "DEBUG" || "$level" == "TRACE" ]]; then
        be_level_visible "DEBUG" && echo "${prefix} ${BE_DEBUG}» $line${NC}"

    # Unclassified (stack traces, "Caused by:", continuation lines) — dim gray, gated by WARN filter
    else
        be_level_visible "WARN" && echo "${prefix} ${GRAY}$line${NC}"
    fi
}

color_frontend_line() {
    should_show_log "fe" || return
    local line="$1"
    local prefix="${FE_LABEL}[FE]${NC}"

    if [[ "$line" =~ (GET|POST|PUT|PATCH|DELETE|OPTIONS)[[:space:]] ]]; then
        local METHOD STATUS URL METHOD_COLOR STATUS_COLOR MS_TIME
        [[ "$line" =~ (GET|POST|PUT|PATCH|DELETE|OPTIONS) ]] && METHOD="${BASH_REMATCH[1]}"
        [[ "$line" =~ [[:space:]]([0-9]{3})[[:space:]] ]]   && STATUS="${BASH_REMATCH[1]}"
        [[ "$line" =~ (/[^[:space:]]*) ]]                    && URL="${BASH_REMATCH[1]}"
        case "$METHOD" in
            GET)         METHOD_COLOR="$M_GET"    ;;
            POST)        METHOD_COLOR="$M_POST"   ;;
            PUT|PATCH)   METHOD_COLOR="$M_PUT"    ;;
            DELETE)      METHOD_COLOR="$M_DELETE" ;;
            *)           METHOD_COLOR="$M_OTHER"  ;;
        esac
        STATUS_COLOR=""
        if [ -n "$STATUS" ]; then
            case "${STATUS:0:1}" in
                2) STATUS_COLOR="$S_2XX" ;;  3) STATUS_COLOR="$S_3XX" ;;
                4) STATUS_COLOR="$S_4XX" ;;  5) STATUS_COLOR="$S_5XX" ;;
            esac
        fi
        [[ "$line" =~ (in\ [0-9]+ms) ]] && MS_TIME="${BASH_REMATCH[1]}"
        echo "${prefix} ${METHOD_COLOR}${METHOD}${NC}  ${WHITE}${URL}${NC}  ${STATUS_COLOR}${STATUS}${NC}  ${GRAY}${MS_TIME}${NC}"
    elif [[ "$line" =~ \[browser\] ]]; then
        if   [[ "$line" =~ [Ee]rror|failed|[Uu]ncaught ]]; then echo "${prefix} ${FE_ERROR}$line${NC}"
        elif [[ "$line" =~ [Ww]arn ]];                       then echo "${prefix} ${FE_WARN}$line${NC}"
        else                                                      echo "${prefix} ${FE_BROWSER}$line${NC}"
        fi
    elif [[ "$line" =~ compiled|ready|[Ss]tarted|✓|▲|[Ll]ocal:.*http ]]; then
        echo "${prefix} ${FE_READY}$line${NC}"
    elif [[ "$line" =~ [Ee]rror|fail ]]; then
        echo "${prefix} ${FE_ERROR}$line${NC}"
    elif [[ "$line" =~ [Ww]arn ]]; then
        echo "${prefix} ${FE_WARN}$line${NC}"
    else
        echo "${prefix} ${GRAY}$line${NC}"
    fi
}

color_postgres_line() {
    should_show_log "pg" || return
    local line="$1"

    # Suppress noisy background checkpoints
    if [[ "$line" =~ checkpoint\ (starting|complete) ]]; then return; fi

    local prefix="${PG_LABEL}[PG]${NC}"
    if   [[ "$line" =~ [Ee]rror|[Ff]atal|[Pp]anic ]]; then echo "${prefix} ${PG_ERROR}$line${NC}"
    elif [[ "$line" =~ [Ww]arn ]];                      then echo "${prefix} ${PG_WARN}$line${NC}"
    elif [[ "$line" =~ ready\ to\ accept|database\ system|[Ss]tarted|[Ll]istening ]]; then
        echo "${prefix} ${PG_READY}$line${NC}"
    else
        echo "${prefix} ${PG_INFO}$line${NC}"
    fi
}

color_redis_line() {
    should_show_log "rd" || return
    local line="$1"
    local prefix="${RD_LABEL}[RD]${NC}"
    if   [[ "$line" =~ \#.*[Ee]rror|oops|crashed ]]; then echo "${prefix} ${RD_ERROR}$line${NC}"
    elif [[ "$line" =~ [Ww]arn|^"# " ]];              then echo "${prefix} ${RD_WARN}$line${NC}"
    elif [[ "$line" =~ ready\ to\ accept|[Ss]erver\ initialized|[Ll]oaded|[Ss]tarted ]]; then
        echo "${prefix} ${RD_READY}$line${NC}"
    else
        echo "${prefix} ${RD_INFO}$line${NC}"
    fi
}

# ──────────────────────────────────────
# Log tailers — track the TAIL pid inside the subshell via a temp file
# so we can reliably kill both the subshell and the tail -F process.
# ──────────────────────────────────────
_kill_tailer() {
    local pidvar="$1"   # e.g. BACKEND_TAIL_PID
    local pid="${!pidvar}"
    if [ -n "$pid" ]; then
        # Kill the process group so tail -F inside also dies
        kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null
        eval "$pidvar="
    fi
}

tail_log() {
    local logfile="$1" filter_fn="$2"

    if [ "$filter_fn" = "backend" ]; then
        _kill_tailer BACKEND_TAIL_PID
    else
        _kill_tailer FRONTEND_TAIL_PID
    fi

    # Run in its own process group (setsid) so kill -- -PID reaches tail -F
    setsid bash -c "
        tail -F \"\$1\" 2>/dev/null | while IFS= read -r line; do
            if [ \"\$2\" = backend ]; then
                $(declare -f color_backend_line should_show_log be_level_visible)
                # Re-export color vars into subshell
                $(declare -p BE_SHOW_LEVELS BE_LABEL NC BE_ERROR BE_WARN BE_INFO BE_START BE_SQL BE_DEBUG GREEN YELLOW RED WHITE GRAY CYAN 2>/dev/null || true)
                color_backend_line \"\$line\"
            else
                $(declare -f color_frontend_line should_show_log)
                $(declare -p FE_LABEL NC FE_ERROR FE_WARN FE_READY FE_BROWSER M_GET M_POST M_PUT M_DELETE M_OTHER S_2XX S_3XX S_4XX S_5XX WHITE GRAY 2>/dev/null || true)
                color_frontend_line \"\$line\"
            fi
        done
    " _ "$logfile" "$filter_fn" &

    if [ "$filter_fn" = "backend" ]; then
        BACKEND_TAIL_PID=$!
    else
        FRONTEND_TAIL_PID=$!
    fi
}

tail_docker_logs() {
    local container="$1" filter_fn="$2"

    if [ "$filter_fn" = "postgres" ]; then
        _kill_tailer PG_TAIL_PID
    else
        _kill_tailer RD_TAIL_PID
    fi

    setsid bash -c "
        docker logs --tail 20 -f \"\$1\" 2>&1 | while IFS= read -r line; do
            if [ \"\$2\" = postgres ]; then
                $(declare -f color_postgres_line should_show_log)
                $(declare -p PG_LABEL NC PG_ERROR PG_WARN PG_INFO PG_READY 2>/dev/null || true)
                color_postgres_line \"\$line\"
            else
                $(declare -f color_redis_line should_show_log)
                $(declare -p RD_LABEL NC RD_ERROR RD_WARN RD_INFO RD_READY 2>/dev/null || true)
                color_redis_line \"\$line\"
            fi
        done
    " _ "$container" "$filter_fn" &

    if [ "$filter_fn" = "postgres" ]; then
        PG_TAIL_PID=$!
    else
        RD_TAIL_PID=$!
    fi
}

# ──────────────────────────────────────
# Ensure Docker container is running
# ──────────────────────────────────────
ensure_container() {
    local name="$1" label="$2"
    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
        ok "$label is already running."; return 0
    fi
    if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
        warn "$label container exists but is stopped — starting..."
        docker start "$name" > /dev/null 2>&1 && ok "$label started." && return 0
        err "Failed to start $label container '$name'."; return 1
    fi
    err "Container '$name' not found. Please create it first."
    err "  Postgres: docker run -d --name $PG_CONTAINER -p 5432:5432 -e POSTGRES_PASSWORD=... postgres:17-alpine"
    err "  Redis:    docker run -d --name $RD_CONTAINER -p 6379:6379 redis:8-alpine"
    return 1
}

# ──────────────────────────────────────
# Clean shutdown — kills all children reliably
# ──────────────────────────────────────
shutdown() {
    trap - INT TERM EXIT
    echo ""
    warn "Shutting down all services..."

    # Kill tracked processes
    for pid in "$FRONTEND_PID" "$BACKEND_PID" "$NGROK_PID"; do
        [ -n "$pid" ] && kill "$pid" 2>/dev/null
    done

    # Kill tailer process groups
    _kill_tailer BACKEND_TAIL_PID
    _kill_tailer FRONTEND_TAIL_PID
    _kill_tailer PG_TAIL_PID
    _kill_tailer RD_TAIL_PID

    # Give processes a moment, then force-kill anything still holding ports
    sleep 1
    kill_nextjs_quiet

    # Stop Docker containers
    for info in "$PG_CONTAINER:PostgreSQL" "$RD_CONTAINER:Redis"; do
        local cname="${info%%:*}" clabel="${info##*:}"
        if docker ps --format '{{.Names}}' | grep -qx "$cname" 2>/dev/null; then
            warn "Stopping $clabel ($cname)..."
            docker stop "$cname" > /dev/null 2>&1 && ok "$clabel stopped."
        fi
    done

    # Restore terminal
    tput cnorm 2>/dev/null; tput rmcup 2>/dev/null; stty sane 2>/dev/null
    echo ""
    ok "All services stopped. Terminal restored."
    exit 0
}
trap shutdown INT TERM EXIT

# ──────────────────────────────────────
# Service start/restart helpers
# ──────────────────────────────────────
start_backend() {
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && sleep 0.5
    free_port 8080
    > "$BACKEND_LOG"
    echo "${BE_LABEL}[Backend]${NC} ${GREEN}Starting Spring Boot...${NC}"
    # Load .env into the environment so Spring resolves ${VAR} placeholders.
    # set -a exports every variable defined after it; set +a stops that.
    if [ -f "$ROOT_DIR/.env" ]; then
        set -a; source "$ROOT_DIR/.env"; set +a
    else
        warn ".env not found at $ROOT_DIR/.env — Spring may fail to resolve secrets."
    fi
    cd "$BACKEND_DIR" && mvn spring-boot:run >> "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
    echo "${BE_LABEL}[Backend]${NC} ${GRAY}PID=$BACKEND_PID  •  log: $BACKEND_LOG${NC}"
    echo "${BE_LABEL}[Backend]${NC} ${GRAY}Live stream: ${WHITE}${BE_SHOW_LEVELS}${GRAY} levels only. Use 'lb' for full log.${NC}"
    tail_log "$BACKEND_LOG" "backend"
}

kill_nextjs_quiet() {
    pkill -f "next-server"  2>/dev/null
    pkill -f "next dev"     2>/dev/null
    pkill -f "${FRONTEND_DIR}" 2>/dev/null
    local lockfile="$FRONTEND_DIR/.next/dev/locks/server.lock"
    if [ -f "$lockfile" ]; then
        local lock_pid
        lock_pid=$(cat "$lockfile" 2>/dev/null | tr -d '[:space:]')
        [ -n "$lock_pid" ] && kill -9 "$lock_pid" 2>/dev/null
        rm -f "$lockfile" 2>/dev/null
    fi
    local stray name
    stray=$(get_port_pids 3000)
    for pid in $stray; do
        name=$(ps -p "$pid" -o comm= 2>/dev/null)
        [[ "$name" =~ zen|firefox|chrome|chromium|browser ]] && continue
        kill -9 "$pid" 2>/dev/null
    done
}

start_frontend() {
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    _kill_tailer FRONTEND_TAIL_PID
    kill_nextjs_quiet
    sleep 0.5
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
    echo "${BE_LABEL}[Backend]${NC} ${CYAN}Waiting for health check on :8080 (max ${max}s)...${NC}"
    while [ $waited -lt $max ]; do
        if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo ""
            echo "${BE_LABEL}[Backend]${NC} ${BE_START}✔  Ready (${waited}s)${NC}"
            return 0
        fi
        # Also abort early if the backend process died
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            echo ""
            err "Backend process exited unexpectedly. Check: tail -n 50 $BACKEND_LOG"
            return 1
        fi
        sleep 2; waited=$((waited + 2))
        printf "."
    done
    echo ""
    warn "Backend not responding after ${max}s — starting Frontend anyway."
}

# Change which BE levels are shown live, without restarting
set_be_levels() {
    if [ -z "$*" ]; then
        echo "${YELLOW}Usage: blevels ERROR WARN INFO SQL DEBUG ALL${NC}"
        echo "Current: ${WHITE}${BE_SHOW_LEVELS}${NC}"
        return
    fi
    BE_SHOW_LEVELS="$*"
    ok "Backend live filter set to: ${WHITE}${BE_SHOW_LEVELS}${NC}"
    echo "${GRAY}(restart backend log tailer? rb to restart backend, or tb twice to retoggle)${NC}"
}

# ──────────────────────────────────────
# Step 1: Docker + Containers (parallel readiness checks)
# ──────────────────────────────────────
header "Checking Docker & Containers"

if ! docker info > /dev/null 2>&1; then
    warn "Docker is not running. Starting..."
    if command -v systemctl &>/dev/null; then
        sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null
    elif command -v service &>/dev/null; then
        sudo service docker start 2>/dev/null
    fi
    local DOCKER_WAIT=0
    while ! docker info > /dev/null 2>&1 && [ $DOCKER_WAIT -lt 30 ]; do
        sleep 2; DOCKER_WAIT=$((DOCKER_WAIT + 2)); printf "."
    done
    echo ""
    docker info > /dev/null 2>&1 || { err "Docker failed to start. Please start it manually."; exit 1; }
    ok "Docker started."
else
    ok "Docker is running."
fi

ensure_container "$PG_CONTAINER" "PostgreSQL" || exit 1
ensure_container "$RD_CONTAINER" "Redis"      || exit 1
sleep 0.5

echo "${PG_LABEL}[Postgres]${NC} ${GRAY}Streaming logs from $PG_CONTAINER...${NC}"
tail_docker_logs "$PG_CONTAINER" "postgres"

echo "${RD_LABEL}[Redis]${NC} ${GRAY}Streaming logs from $RD_CONTAINER...${NC}"
tail_docker_logs "$RD_CONTAINER" "redis"

# ──────────────────────────────────────
# Step 2: Free ports
# ──────────────────────────────────────
info "\n[SETUP] Freeing ports 8080 & 3000..."
free_port 8080
free_port 3000
pkill -9 ngrok 2>/dev/null; sleep 0.3
ok "Ports free."

# ──────────────────────────────────────
# Step 3: Ngrok
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
        err "Cannot install ngrok automatically. See: https://ngrok.com/download"; exit 1
    fi
fi

> "$NGROK_LOG"
ngrok http 3000 --log=stdout > "$NGROK_LOG" 2>&1 &
NGROK_PID=$!

NGROK_URL=""
for i in $(seq 1 10); do
    sleep 1
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"\K[^"]+' | grep https | head -1)
    [ -n "$NGROK_URL" ] && break
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

export CORS_ALLOWED_ORIGINS="http://localhost:3000,${NGROK_URL}"

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

inject_env "$BACKEND_DIR/.env" "DARAJA_CALLBACK_URL"    "$CALLBACK_URL"
inject_env "$ROOT_DIR/.env"    "DARAJA_CALLBACK_URL"    "$CALLBACK_URL"
inject_env "$ROOT_DIR/.env"    "CORS_ALLOWED_ORIGINS"   "http://localhost:3000,${NGROK_URL}"

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
# Step 5: Start Backend, wait for ready, then start Frontend
# ──────────────────────────────────────
header "Starting Services"
start_backend
wait_for_backend && start_frontend || {
    warn "Backend did not become healthy — skipping Frontend start."
    warn "Fix the backend, then type 'rf' to start the frontend manually."
}

# ──────────────────────────────────────
# Step 6: Interactive management prompt
# ──────────────────────────────────────
echo ""
header "All services running"
echo "${WHITE}Commands:${NC}"
printf "  ${BE_LABEL}rb${NC}    restart Backend          "
printf "  ${FE_LABEL}rf${NC}   restart Frontend\n"
printf "  ${YELLOW}ra${NC}    restart Backend+Frontend  "
printf "  ${WHITE}status${NC} service status\n"
printf "  ${BE_LABEL}lb${NC}    full Backend log (50)    "
printf "  ${FE_LABEL}lf${NC}   full Frontend log (50)\n"
printf "  ${PG_LABEL}tp${NC}    toggle Postgres logs      "
printf "  ${RD_LABEL}tr${NC}   toggle Redis logs\n"
printf "  ${BE_LABEL}tb${NC}    toggle Backend logs       "
printf "  ${FE_LABEL}tf${NC}   toggle Frontend logs\n"
printf "  ${WHITE}ob${NC}    Backend logs ONLY         "
printf "  ${WHITE}of${NC}   Frontend logs ONLY\n"
printf "  ${WHITE}op${NC}    Postgres logs ONLY        "
printf "  ${WHITE}or${NC}   Redis logs ONLY\n"
printf "  ${WHITE}sa${NC}    show ALL logs\n"
printf "  ${CYAN}blevels ERROR WARN INFO${NC}   — set Backend live filter\n"
printf "  ${RED}q${NC}     quit all services\n"
echo ""

# ── Ctrl+C in the read loop: forward to shutdown cleanly ──────────────────
_handle_int() { shutdown; }
trap _handle_int INT

while true; do
    printf "${WHITE}kedevs> ${NC}"
    # -r: no backslash interpretation; timeout keeps the loop alive if logs print over prompt
    if ! IFS= read -r -t 86400 cmd; then
        # read returned non-zero (EOF / signal) — exit cleanly
        shutdown
    fi
    case "$cmd" in
        rb)     start_backend ;;
        rf)     start_frontend ;;
        ra)     start_backend; start_frontend ;;
        lb)     tail -n 50 "$BACKEND_LOG" ;;
        lf)     tail -n 50 "$FRONTEND_LOG" ;;
        tp)     toggle_log "pg" "PostgreSQL" ;;
        tr)     toggle_log "rd" "Redis" ;;
        tb)     toggle_log "be" "Backend" ;;
        tf)     toggle_log "fe" "Frontend" ;;
        op)     show_only "pg" "PostgreSQL" ;;
        or)     show_only "rd" "Redis" ;;
        ob)     show_only "be" "Backend" ;;
        of)     show_only "fe" "Frontend" ;;
        sa)     show_all ;;
        status) show_status ;;
        blevels*) set_be_levels "${cmd#blevels }" ;;
        q|quit|exit) shutdown ;;
        "") : ;;
        *) warn "Unknown command: '$cmd'  (type status to see all commands)" ;;
    esac
done
