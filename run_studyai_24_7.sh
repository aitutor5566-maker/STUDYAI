#!/bin/bash
# ==============================================================================
# STUDYAI — 24/7 Persistent Background Daemon for Daily Testers
# Runs decoupled from Antigravity & Terminal so it stays active continuously.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "======================================================================"
echo "🚀 Starting STUDYAI 24/7 Background Services..."
echo "======================================================================"

# 1. Kill any conflicting existing instances
pkill -f "server/index.ts" 2>/dev/null
pkill -f "cloudflared tunnel --url http://localhost:3001" 2>/dev/null
sleep 2

# 2. Build production assets if not built
if [ ! -d "dist" ]; then
  echo "📦 Building production frontend bundle..."
  npm run build
fi

# 3. Start Production Server with nohup
echo "⚡ Starting background server on port 3001..."
nohup node --experimental-strip-types server/index.ts > /tmp/studyai_server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID (Logging to /tmp/studyai_server.log)"

# Wait for server to be responsive
sleep 3

# 4. Start Cloudflare Tunnel with nohup
echo "🌐 Starting Cloudflare 24/7 tunnel..."
rm -f /tmp/studyai_tunnel.log
nohup npx --yes cloudflared tunnel --url http://localhost:3001 > /tmp/studyai_tunnel.log 2>&1 &
TUNNEL_PID=$!
echo "   Tunnel PID: $TUNNEL_PID (Logging to /tmp/studyai_tunnel.log)"

# Wait for tunnel URL to generate
echo "⏳ Connecting to Indian edge servers..."
for i in {1..15}; do
  TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' /tmp/studyai_tunnel.log | head -n 1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done

if [ -n "$TUNNEL_URL" ]; then
  echo ""
  echo "======================================================================"
  echo "🎉 SUCCESS! Your 24/7 Live Testing Link is ACTIVE:"
  echo "👉 $TUNNEL_URL"
  echo "======================================================================"
  echo "$TUNNEL_URL" > "$PROJECT_DIR/ACTIVE_TEST_LINK.txt"
  echo "Saved link to ACTIVE_TEST_LINK.txt"
else
  echo "⚠️ Tunnel started, check /tmp/studyai_tunnel.log for the live link."
fi
