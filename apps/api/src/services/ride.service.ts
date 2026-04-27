import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/error'
import type { PaymentMethod } from '@prisma/client'

interface CreateRideInput {
  clientId: string
  originZoneId: string
  destZoneId: string
  pickupLat: number
  pickupLng: number
  pickupAddress?: string
  dropoffLat?: number
  dropoffLng?: number
  dropoffAddress?: string
  paymentMethod: PaymentMethod
}

// Taxa de comissão padrão
const DEFAULT_COMMISSION_RATE = 0.15

async function getCommissionRate(): Promise<number> {
  const config = await prisma.appConfig.findUnique({ where: { key: 'commission_rate' } })
  return config ? parseFloat(config.value) : DEFAULT_COMMISSION_RATE
}

export async function createRide(data: CreateRideInput) {
  // Buscar preço da zona
  const zonePrice = await prisma.zonePrice.findUnique({
    where: {
      originZoneId_destZoneId: {
        originZoneId: data.originZoneId,
        destZoneId: data.destZoneId,
      },
    },
  })

  if (!zonePrice) {
    throw new AppError('Rota não disponível entre essas zonas', 400)
  }

  if (!zonePrice.isActive) {
    throw new AppError('Rota temporariamente indisponível', 400)
  }

  const commissionRate = await getCommissionRate()
  const price = zonePrice.price
  const commission = Math.round(price * commissionRate * 100) / 100
  const driverEarnings = Math.round((price - commission) * 100) / 100

  const ride = await prisma.ride.create({
    data: {
      clientId: data.clientId,
      originZoneId: data.originZoneId,
      destZoneId: data.destZoneId,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      pickupAddress: data.pickupAddress,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      dropoffAddress: data.dropoffAddress,
      paymentMethod: data.paymentMethod,
      price,
      commission,
      driverEarnings,
    },
    include: {
      originZone: { select: { name: true } },
      destZone: { select: { name: true } },
      client: { select: { name: true, phone: true } },
    },
  })

  return ride
}

export async function getRide(rideId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      originZone: { select: { name: true } },
      destZone: { select: { name: true } },
      client: { select: { id: true, name: true, phone: true } },
      driver: {
        select: {
          id: true,
          user: { select: { name: true, phone: true } },
          vehicleMake: true,
          vehicleModel: true,
          vehicleColor: true,
          licensePlate: true,
          currentLat: true,
          currentLng: true,
        },
      },
    },
  })

  if (!ride) throw new AppError('Corrida não encontrada', 404)
  return ride
}

export async function acceptRide(rideId: string, driverUserId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId: driverUserId } })
  if (!driver) throw new AppError('Motorista não encontrado', 404)

  const ride = await prisma.ride.findUnique({ where: { id: rideId } })
  if (!ride) throw new AppError('Corrida não encontrada', 404)
  if (ride.status !== 'REQUESTED') throw new AppError('Corrida não está mais disponível', 400)

  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: {
      driverId: driver.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
    include: {
      originZone: { select: { name: true } },
      destZone: { select: { name: true } },
      client: { select: { name: true, phone: true } },
    },
  })

  // Marca motorista como em viagem
  await prisma.driver.update({
    where: { id: driver.id },
    data: { availability: 'ON_TRIP' },
  })

  return updated
}

export async function arriveAtPickup(rideId: string, driverUserId: string) {
  const ride = await validateRideDriver(rideId, driverUserId)
  if (ride.status !== 'ACCEPTED') throw new AppError('Status inválido para esta ação', 400)

  return prisma.ride.update({
    where: { id: rideId },
    data: { status: 'ARRIVING', arrivedAt: new Date() },
  })
}

export async function startRide(rideId: string, driverUserId: string) {
  const ride = await validateRideDriver(rideId, driverUserId)
  if (ride.status !== 'ARRIVING') throw new AppError('Status inválido para esta ação', 400)

  return prisma.ride.update({
    where: { id: rideId },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  })
}

export async function completeRide(rideId: string, driverUserId: string) {
  const ride = await validateRideDriver(rideId, driverUserId)
  if (ride.status !== 'IN_PROGRESS') throw new AppError('Status inválido para esta ação', 400)

  // Atualizar corrida como completa
  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      paymentStatus: 'CONFIRMED',
    },
  })

  // Atualizar ganhos do motorista e liberar disponibilidade
  await prisma.driver.update({
    where: { id: ride.driverId! },
    data: {
      availability: 'ONLINE',
      totalEarnings: { increment: ride.driverEarnings },
      pendingBalance: { increment: ride.commission },
    },
  })

  return updated
}

export async function cancelRide(rideId: string, userId: string, reason?: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: true },
  })
  if (!ride) throw new AppError('Corrida não encontrada', 404)

  // Só pode cancelar se não estiver completa
  if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
    throw new AppError('Corrida não pode ser cancelada', 400)
  }

  const updated = await prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    },
  })

  // Liberar motorista se já tinha sido aceita
  if (ride.driverId) {
    await prisma.driver.update({
      where: { id: ride.driverId },
      data: { availability: 'ONLINE' },
    })
  }

  return updated
}

export async function rateRide(
  rideId: string,
  userId: string,
  rating: number,
  comment?: string,
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } })
  if (!ride) throw new AppError('Corrida não encontrada', 404)
  if (ride.status !== 'COMPLETED') throw new AppError('Corrida não foi completada', 400)

  // Determinar se é avaliação do cliente ou do motorista
  if (ride.clientId === userId) {
    return prisma.ride.update({
      where: { id: rideId },
      data: { driverRating: rating, clientComment: comment },
    })
  }

  // Se é o motorista avaliando
  const driver = await prisma.driver.findUnique({ where: { userId } })
  if (driver && driver.id === ride.driverId) {
    return prisma.ride.update({
      where: { id: rideId },
      data: { clientRating: rating },
    })
  }

  throw new AppError('Sem permissão para avaliar esta corrida', 403)
}

// Helper: valida que o motorista é o dono da corrida
async function validateRideDriver(rideId: string, driverUserId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId: driverUserId } })
  if (!driver) throw new AppError('Motorista não encontrado', 404)

  const ride = await prisma.ride.findUnique({ where: { id: rideId } })
  if (!ride) throw new AppError('Corrida não encontrada', 404)
  if (ride.driverId !== driver.id) throw new AppError('Sem permissão', 403)

  return ride
}
