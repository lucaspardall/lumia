@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    LUMIA - Iniciando servidores
echo ========================================
echo.

:: Garante que Docker está rodando
docker compose up -d 2>nul

echo Iniciando backend (porta 3333)...
start "Lumia API" cmd /k "cd apps\api && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend (porta 5173)...
start "Lumia Web" cmd /k "cd apps\web && npm run dev"

echo.
echo Servidores iniciados!
echo   Backend:  http://localhost:3333
echo   Frontend: http://localhost:5173
echo.
echo Feche esta janela quando quiser.
pause
