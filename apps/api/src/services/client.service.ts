import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/error'

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) throw new AppError('Usuário não encontrado', 404)
  return user
}

export async function updateProfile(userId: string, data: { name?: string; email?: string; avatarUrl?: string }) {
  // Se o email mudou, verificar duplicata
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, id: { not: userId } },
    })
    if (existing) throw new AppError('Email já em uso', 409)
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      avatarUrl: true,
    },
  })
}

export async function getRides(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        originZone: { select: { name: true } },
        destZone: { select: { name: true } },
        driver: {
          select: {
            user: { select: { name: true, phone: true } },
            vehicleMake: true,
            vehicleModel: true,
            vehicleColor: true,
            licensePlate: true,
          },
        },
      },
    }),
    prisma.ride.count({ where: { clientId: userId } }),
  ])

  return { rides, total, page, totalPages: Math.ceil(total / limit) }
}
