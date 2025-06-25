@echo off
REM Windows batch script to start WSL services
REM This can be used with Windows Task Scheduler

echo Starting Chemo Cursor services in WSL...

REM Start WSL and run the startup script
wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR && docker-compose up -d"

echo Services started successfully!
echo Frontend: http://localhost
echo Backend API: http://localhost:5000
echo MySQL: localhost:3306

pause 