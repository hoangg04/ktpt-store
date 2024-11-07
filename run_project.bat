@echo off
set "projectDir=%~dp0"

REM Install package dependencies
echo Installing package dependencies...
cd "%projectDir%\client"
call npm install

cd "%projectDir%\server"
call npm install


REM Run the project
echo Running the project...
start "Client" cmd /k "cd "%projectDir%\client\"& npm run dev"
start "Server" cmd /k "cd "%projectDir%\server\"& npm run dev"