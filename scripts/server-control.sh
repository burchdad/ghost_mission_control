#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT_DIR/.ghost-mission-control.pid"
LOG_FILE="$ROOT_DIR/.ghost-mission-control.log"

is_running() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

start_server() {
  if is_running; then
    echo "Ghost Mission Control already running (PID $(cat "$PID_FILE"))."
    exit 0
  fi

  cd "$ROOT_DIR"
  nohup node server.js >>"$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" >"$PID_FILE"

  sleep 1
  if kill -0 "$pid" 2>/dev/null; then
    echo "Ghost Mission Control started in background (PID $pid)."
    echo "Log: $LOG_FILE"
  else
    echo "Failed to start server. Check log: $LOG_FILE"
    exit 1
  fi
}

stop_server() {
  if ! [[ -f "$PID_FILE" ]]; then
    echo "No PID file found. Server may not be running."
    exit 0
  fi

  local pid
  pid="$(cat "$PID_FILE")"

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" || true
    fi
    echo "Ghost Mission Control stopped (PID $pid)."
  else
    echo "Process $pid not running. Cleaning up PID file."
  fi

  rm -f "$PID_FILE"
}

status_server() {
  if is_running; then
    echo "Ghost Mission Control is running (PID $(cat "$PID_FILE"))."
    exit 0
  fi

  echo "Ghost Mission Control is not running."
  exit 1
}

case "${1:-}" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 2
    ;;
esac
