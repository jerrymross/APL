@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installerar beroenden...
  call npm install
)

echo Startar Astar APL-handledarutbildning...
start "" "http://localhost:5173/?reset=1"
call npm run dev
