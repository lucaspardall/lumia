import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/error'

export async function getDashboard() {
  const [
    totalUsers,
    totalDrivers,
    pendingDrivers,
    totalRides,
    activeRides,
    completedRides,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: 'PENDING' } }),
    prisma.ride.count(),
    prisma.ride.count({
      where: { status: { in: ['REQUESTED', 'ACCEPTED', 'ARRIVING', 'IN_PROGRESS'] } },
    }),
    prisma.ride.count({ where: { status: 'COMPLETED' } }),
  ])

  // Faturamento total
  const revenueResult = await prisma.ride.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { price: true, commission: true },
  })

  // Corridas de hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayRides = await prisma.ride.count({
    where: { createdAt: { gte: today } },
  })

  return {
    totalUsers,
    totalDrivers,
    pendingDrivers,
    totalRides,
    activeRides,
    completedRides,
    todayRides,
    totalRevenue: revenueResult._sum.price || 0,
    totalCommissions: revenueResult._sum.commission || 0,
  }
}

export async function getDrivers(status?: string) {
  const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'BLOCKED' } : {}

  return prisma.driver.findMany({
    where,
    include: {
      user: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function approveDriver(driverId: string) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) throw new AppError('Motorista não encontrado', 404)

  return prisma.driver.update({
    where: { id: driverId },
    data: { status: 'APPROVED' },
  })
}

export async function blockDriver(driverId: string) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) throw new AppError('Motorista não encontrado', 404)

  return prisma.driver.update({
    where: { id: driverId },
    data: { status: 'BLOCKED', availability: 'OFFLINE' },
  })
}

export async function getRides(page = 1, limit = 50, status?: string) {
  const skip = (page - 1) * limit
  const where = status ? { status: status as any } : {}

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true, phone: true } },
        driver: {
          select: { user: { select: { name: true } }, licensePlate: true },
        },
        originZone: { select: { name: true } },
        destZone: { select: { name: true } },
      },
    }),
    prisma.ride.count({ where }),
  ])

  return { rides, total, page, totalPages: Math.ceil(total / limit) }
}

export async function updateZone(zoneId: string, data: { name?: string; description?: string; isActive?: boolean }) {
  return prisma.zone.update({ where: { id: zoneId }, data })
}

export async function updatePrice(priceId: string, data: { price?: number; isActive?: boolean }) {
  return prisma.zonePrice.update({ where: { id: priceId }, data })
}

export async function getCommissions() {
  const drivers = await prisma.driver.findMany({
    where: { pendingBalance: { gt: 0 } },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { pendingBalance: 'desc' },
  })

  const payments = await prisma.commissionPayment.findMany({
    orderBy: { paidAt: 'desc' },
    take: 50,
  })

  return { pendingDrivers: drivers, recentPayments: payments }
}

export async function payCommission(driverId: string, amount: number, notes?: string) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) throw new AppError('Motorista não encontrado', 404)
  if (driver.pendingBalance < amount) {
    throw new AppError('Valor maior que o saldo pendente', 400)
  }

  // Registrar pagamento e zerar saldo
  const [payment] = await prisma.$transaction([
    prisma.commissionPayment.create({
      data: { driverId, amount, notes },
    }),
    prisma.driver.update({
      where: { id: driverId },
      data: { pendingBalance: { decrement: amount } },
    }),
  ])

  return payment
}
