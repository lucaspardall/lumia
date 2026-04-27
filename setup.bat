@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    LUMIA - Setup Automatico
echo ========================================
echo.

:: Verifica se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker nao esta rodando!
    echo Abra o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo [1/7] Subindo PostgreSQL e Redis...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao subir containers
    pause
    exit /b 1
)

echo.
echo [2/7] Aguardando banco ficar pronto...
timeout /t 5 /nobreak >nul

echo.
echo [3/7] Criando .env...
if not exist .env (
    copy .env.example .env >nul
    echo .env criado a partir do .env.example
) else (
    echo .env ja existe, pulando...
)

echo.
echo [4/7] Instalando dependencias do backend...
cd apps\api
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha no npm install do backend
    pause
    exit /b 1
)

echo.
echo [5/7] Gerando Prisma Client e rodando migrate...
call npx prisma generate
call npx prisma migrate dev --name init --skip-seed
if %errorlevel% neq 0 (
    echo [AVISO] Migrate falhou, tentando db push...
    call npx prisma db push
)

echo.
echo [6/7] Rodando seed do banco...
call npm run db:seed

echo.
echo [7/7] Instalando dependencias do frontend...
cd ..\..\apps\web
call npm install

cd ..\..

echo.
echo ========================================
echo    SETUP CONCLUIDO!
echo ========================================
echo.
echo Para iniciar o projeto, rode:
echo.
echo   Terminal 1 (backend):
echo     cd apps\api
echo     npm run dev
echo.
echo   Terminal 2 (frontend):
echo     cd apps\web
echo     npm run dev
echo.
echo   Backend: http://localhost:3333
echo   Frontend: http://localhost:5173
echo   Login admin: telefone "admin" / senha "admin123"
echo.
pause
