#!/bin/bash
set -e

echo ""
echo "========================================"
echo "   LUMIA - Deploy na VPS"
echo "========================================"
echo ""

# 1. Criar diretório do projeto
echo "[1/8] Criando diretório do projeto..."
mkdir -p /opt/lumia
cd /opt/lumia

# 2. Instalar Node.js se não existir
if ! command -v node &> /dev/null; then
    echo "[2/8] Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "[2/8] Node.js já instalado: $(node --version)"
fi

# 3. Criar docker-compose.yml para PostgreSQL + Redis
echo "[3/8] Criando docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: lumia-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: lumia
      POSTGRES_PASSWORD: lumia_prod_2026
      POSTGRES_DB: lumia
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U lumia -d lumia']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: lumia-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
EOF

# 4. Subir PostgreSQL e Redis
echo "[4/8] Subindo PostgreSQL e Redis..."
docker compose up -d
echo "Aguardando banco ficar pronto..."
sleep 8

# 5. Criar .env
echo "[5/8] Criando .env..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://lumia:lumia_prod_2026@localhost:5432/lumia?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="lumia-jwt-secret-prod-2026-trocar-em-producao"
JWT_REFRESH_SECRET="lumia-refresh-secret-prod-2026-trocar-em-producao"
GOOGLE_MAPS_API_KEY="sua-chave-google-maps"
FIREBASE_PROJECT_ID="seu-project-id"
FIREBASE_PRIVATE_KEY="sua-private-key"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
PORT=3333
CLIENT_URL="http://187.127.28.229:5173"
EOF

echo ""
echo "========================================"
echo "   Banco e Redis rodando!"
echo "   Agora envie o codigo do projeto."
echo "========================================"
echo ""
echo "Proximo passo: copie os arquivos do projeto para /opt/lumia/"
echo ""
