@echo off

REM Run JS App
echo Starting JS App Server...
cd "JS App\backend"
call npm install
cd ..
start "" cmd /k "npm run server"