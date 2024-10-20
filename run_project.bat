@echo off
set "projectDir=%~dp0"



REM Run the project
echo Running the project...
start "Client" cmd /k "cd "%projectDir%\client\"& npm run dev"
start "Server" cmd /k "cd "%projectDir%\server\"& npm run dev"
start "Database" cmd /k "cd "%projectDir%"& docker-compose up"