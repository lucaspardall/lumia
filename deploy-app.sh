#!/bin/bash
set -e

cd /opt/lumia

echo ""
echo "========================================"
echo "   LUMIA - Setup da aplicação"
echo "========================================"
echo ""

# Copiar .env para os apps
cp .env apps/api/.env 2>/dev/null || true

# 1. Backend
echo "[1/5] Instalando dependências do backend..."
cd /opt/lumia/apps/api
npm install

echo "[2/5] Gerando Prisma Client..."
npx prisma generate

echo "[3/5] Rodando migrations..."
npx prisma migrate dev --name init --skip-seed 2>/dev/null || npx prisma db push

echo "[4/5] Rodando seed..."
npm run db:seed

# 2. Frontend
echo "[5/5] Instalando dependências do frontend..."
cd /opt/lumia/apps/web
npm install

# 3. Instalar PM2 para manter os processos rodando
echo "[EXTRA] Instalando PM2..."
npm install -g pm2 2>/dev/null || true

# 4. Iniciar backend com PM2
echo "Iniciando backend..."
cd /opt/lumia/apps/api
pm2 delete lumia-api 2>/dev/null || true
pm2 start "npx tsx src/index.ts" --name lumia-api

# 5. Build e servir frontend
echo "Fazendo build do frontend..."
cd /opt/lumia/apps/web
npm run build

# Servir com um server simples via PM2
pm2 delete lumia-web 2>/dev/null || true
pm2 start "npx serve dist -l 5173 -s" --name lumia-web
npm install -g serve 2>/dev/null || true
pm2 restart lumia-web

# Salvar config PM2
pm2 save

echo ""
echo "========================================"
echo "   DEPLOY CONCLUIDO!"
echo "========================================"
echo ""
echo "   Backend:  http://187.127.28.229:3333"
echo "   Frontend: http://187.127.28.229:5173"
echo ""
echo "   Login admin: telefone 'admin' / senha 'admin123'"
echo ""
echo "   Comandos uteis:"
echo "     pm2 logs          - ver logs"
echo "     pm2 status        - ver status"
echo "     pm2 restart all   - reiniciar tudo"
echo ""
