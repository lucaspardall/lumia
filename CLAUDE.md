# LUMIA — Contexto do Projeto

## O que é
App de transporte por zonas para Lumiar e região (Nova Friburgo/RJ).
Funciona como PWA (sem loja). Modelo: Uber simplificado, rede fechada de motoristas.

## Stack definida
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- ORM: Prisma + PostgreSQL
- Tempo real: Socket.io
- Push: Firebase Cloud Messaging
- Cache: Redis
- Mapas: Google Maps JavaScript API v3
- Monorepo estruturado: apps/web + apps/api

## Estrutura de pastas esperada
```
lumia/
├── CLAUDE.md
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── web/                  # React PWA (cliente + motorista + admin)
│   │   ├── Dockerfile
│   │   ├── vite.config.ts
│   │   ├── public/
│   │   │   └── manifest.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── pages/
│   │       │   ├── client/
│   │       │   ├── driver/
│   │       │   └── admin/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── store/
│   │       └── lib/
│   └── api/                  # Node.js + Express
│       ├── Dockerfile
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middlewares/
│       │   └── lib/
│       └── prisma/
│           └── schema.prisma
```

## Schema Prisma completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CLIENT
  DRIVER
  ADMIN
}

enum DriverStatus {
  PENDING
  APPROVED
  BLOCKED
}

enum DriverAvailability {
  ONLINE
  OFFLINE
  ON_TRIP
}

enum RideStatus {
  REQUESTED
  ACCEPTED
  ARRIVING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  PIX
  CASH
}

enum PaymentStatus {
  PENDING
  CONFIRMED
}

model User {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique
  email       String?  @unique
  password    String
  role        UserRole @default(CLIENT)
  avatarUrl   String?
  fcmToken    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  clientRides Ride[]   @relation("ClientRides")
  driver      Driver?

  @@map("users")
}

model Driver {
  id           String             @id @default(cuid())
  userId       String             @unique
  user         User               @relation(fields: [userId], references: [id])
  vehicleMake  String
  vehicleModel String
  vehicleYear  Int
  vehicleColor String
  licensePlate String             @unique
  cnhNumber    String             @unique
  cnhImageUrl  String?
  status       DriverStatus       @default(PENDING)
  availability DriverAvailability @default(OFFLINE)
  currentLat   Float?
  currentLng   Float?
  lastSeenAt   DateTime?
  totalEarnings Float             @default(0)
  pendingBalance Float            @default(0)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  rides        Ride[]             @relation("DriverRides")

  @@map("drivers")
}

model Zone {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  centerLat   Float
  centerLng   Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pricesAsOrigin      ZonePrice[] @relation("OriginZone")
  pricesAsDestination ZonePrice[] @relation("DestinationZone")
  ridesAsOrigin       Ride[]      @relation("OriginZone")
  ridesAsDestination  Ride[]      @relation("DestinationZone")

  @@map("zones")
}

model ZonePrice {
  id            String   @id @default(cuid())
  originZoneId  String
  originZone    Zone     @relation("OriginZone", fields: [originZoneId], references: [id])
  destZoneId    String
  destZone      Zone     @relation("DestinationZone", fields: [destZoneId], references: [id])
  price         Float
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([originZoneId, destZoneId])
  @@map("zone_prices")
}

model Ride {
  id              String        @id @default(cuid())
  clientId        String
  client          User          @relation("ClientRides", fields: [clientId], references: [id])
  driverId        String?
  driver          Driver?       @relation("DriverRides", fields: [driverId], references: [id])
  originZoneId    String
  originZone      Zone          @relation("OriginZone", fields: [originZoneId], references: [id])
  destZoneId      String
  destZone        Zone          @relation("DestinationZone", fields: [destZoneId], references: [id])
  pickupLat       Float
  pickupLng       Float
  pickupAddress   String?
  dropoffLat      Float?
  dropoffLng      Float?
  dropoffAddress  String?
  status          RideStatus    @default(REQUESTED)
  price           Float
  commission      Float
  driverEarnings  Float
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  requestedAt     DateTime      @default(now())
  acceptedAt      DateTime?
  arrivedAt       DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  clientRating    Int?
  driverRating    Int?
  clientComment   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("rides")
}

model CommissionPayment {
  id        String   @id @default(cuid())
  driverId  String
  amount    Float
  paidAt    DateTime @default(now())
  notes     String?
  createdAt DateTime @default(now())

  @@map("commission_payments")
}

model AppConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedAt   DateTime @updatedAt

  @@map("app_config")
}
```

## Rotas da API

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh

### Cliente
- GET  /api/client/profile
- PUT  /api/client/profile
- GET  /api/client/rides

### Motorista
- GET  /api/driver/profile
- PUT  /api/driver/profile
- POST /api/driver/availability
- GET  /api/driver/earnings

### Corridas
- POST /api/rides
- GET  /api/rides/:id
- PUT  /api/rides/:id/accept
- PUT  /api/rides/:id/arrive
- PUT  /api/rides/:id/start
- PUT  /api/rides/:id/complete
- PUT  /api/rides/:id/cancel
- POST /api/rides/:id/rating

### Zonas
- GET /api/zones
- GET /api/zones/prices
- GET /api/zones/price?from=X&to=Y

### Admin
- GET  /api/admin/dashboard
- GET  /api/admin/drivers
- PUT  /api/admin/drivers/:id/approve
- PUT  /api/admin/drivers/:id/block
- GET  /api/admin/rides
- PUT  /api/admin/zones/:id
- PUT  /api/admin/prices/:id
- GET  /api/admin/commissions
- POST /api/admin/commissions/pay

## Socket.io Events

### Motorista → Servidor
- driver:update-location { lat, lng }
- driver:online
- driver:offline

### Servidor → Cliente
- ride:driver-accepted { driver, eta }
- ride:driver-location { lat, lng }
- ride:driver-arrived
- ride:started
- ride:completed

### Servidor → Motorista
- ride:new-request { ride }
- ride:cancelled-by-client

## Design System

### Cores
- Primary: #1B6CA8 (azul serrano)
- Secondary: #F5A623 (laranja)
- Accent: #27AE60 (verde)
- Danger: #E74C3C (vermelho)
- BG: #F8F9FA
- Dark BG: #0F1624

### Tipografia
- Títulos: Sora (Google Fonts)
- Body: Plus Jakarta Sans

## Regras gerais de desenvolvimento
- Sempre TypeScript, sem any desnecessário
- Tratamento de erro em todas as rotas
- Middleware de auth JWT em rotas protegidas
- Variáveis sensíveis sempre em .env
- Comentários em português no código
- Mobile-first em todo o frontend
