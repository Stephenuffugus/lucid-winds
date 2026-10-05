#!/usr/bin/env bash
# One line a minute to /workspaces/.health.log, which survives a container death
# (/tmp and ~ do not): free memory, out-of-memory kills, free disk, load, and the
# five biggest processes whenever memory runs low.
#
# Why: on 4 Oct 2026 the container died at 17:55:41 UTC with two heavy test runs
# and Chrome going on 2 cores, 8 GB and no swap, and nothing on disk said why.
# Started by postStartCommand; a second copy exits at once.
LOG=/workspaces/.health.log
PIDFILE=/tmp/health.pid
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then exit 0; fi
echo $$ > "$PIDFILE"
echo "$(date -u '+%F %T') health.sh started (pid $$)" >> "$LOG"
while :; do
  # Bounded: past 2 MB keep the newest 1 MB (about a week of lines).
  if [ "$(wc -c < "$LOG" 2>/dev/null || echo 0)" -gt 2000000 ]; then
    tail -c 1000000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
  fi
  avail=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)
  ooms=$(awk '/^oom_kill /{print $2}' /sys/fs/cgroup/memory.events 2>/dev/null)
  ws=$(df -Pm /workspaces | awk 'NR==2{print $4"MB "$5}')
  tmp=$(df -Pm /tmp | awk 'NR==2{print $4"MB"}')
  load=$(cut -d' ' -f1-3 /proc/loadavg)
  echo "$(date -u '+%F %T') mem ${avail}MB free, oom_kills ${ooms:-?} | /workspaces ${ws} | /tmp ${tmp} free | load ${load}" >> "$LOG"
  if [ "${avail:-0}" -lt 1200 ]; then
    ps -eo rss=,pid=,etime=,args= --sort=-rss | head -5 | awk '{printf "    %5d MB pid %s up %s ", $1/1024, $2, $3; $1=$2=$3=""; print substr($0,1,140)}' >> "$LOG"
  fi
  sleep 60
done
