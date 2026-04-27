import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/error'
import type { DriverAvailability } from '@prisma/client'

export async function getProfile(userId: string) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
      },
    },
  })

  if (!driver) throw new AppError('Perfil de motorista não encontrado', 404)
  return driver
}

export async function updateProfile(
  userId: string,
  data: {
    vehicleMake?: string
    vehicleModel?: string
    vehicleYear?: number
    vehicleColor?: string
  },
) {
  const driver = await prisma.driver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Perfil de motorista não encontrado', 404)

  return prisma.driver.update({
    where: { userId },
    data,
  })
}

export async function setAvailability(userId: string, availability: DriverAvailability) {
  const driver = await prisma.driver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Perfil de motorista não encontrado', 404)

  if (driver.status !== 'APPROVED') {
    throw new AppError('Motorista ainda não aprovado', 403)
  }

  return prisma.driver.update({
    where: { userId },
    data: {
      availability,
      lastSeenAt: new Date(),
    },
  })
}

export async function updateLocation(userId: string, lat: number, lng: number) {
  return prisma.driver.update({
    where: { userId },
    data: {
      currentLat: lat,
      currentLng: lng,
      lastSeenAt: new Date(),
    },
  })
}

export async function getEarnings(userId: string, period?: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Perfil de motorista não encontrado', 404)

  // Filtro por período
  let dateFilter = {}
  if (period === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dateFilter = { completedAt: { gte: today } }
  } else if (period === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    dateFilter = { completedAt: { gte: weekAgo } }
  } else if (period === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    dateFilter = { completedAt: { gte: monthAgo } }
  }

  const rides = await prisma.ride.findMany({
    where: {
      driverId: driver.id,
      status: 'COMPLETED',
      ...dateFilter,
    },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      price: true,
      driverEarnings: true,
      commission: true,
      completedAt: true,
      originZone: { select: { name: true } },
      destZone: { select: { name: true } },
    },
  })

  const totalEarnings = rides.reduce((sum, r) => sum + r.driverEarnings, 0)
  const totalCommission = rides.reduce((sum, r) => sum + r.commission, 0)

  return {
    totalEarnings,
    totalCommission,
    pendingBalance: driver.pendingBalance,
    ridesCount: rides.length,
    rides,
  }
}

// Registrar um novo motorista (usado no cadastro)
export async function registerDriver(
  userId: string,
  data: {
    vehicleMake: string
    vehicleModel: string
    vehicleYear: number
    vehicleColor: string
    licensePlate: string
    cnhNumber: string
    cnhImageUrl?: string
  },
) {
  const existing = await prisma.driver.findUnique({ where: { userId } })
  if (existing) throw new AppError('Motorista já cadastrado', 409)

  return prisma.driver.create({
    data: {
      userId,
      ...data,
    },
  })
}
