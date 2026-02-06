#!/bin/bash
nohup npm run dev > /dev/null 2>&1 &
echo $! > .dev-server.pid
echo "Dev server started (PID $(cat .dev-server.pid))"
