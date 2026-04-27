import { prisma } from '../lib/prisma'

export async function getZones() {
  return prisma.zone.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function getAllPrices() {
  return prisma.zonePrice.findMany({
    where: { isActive: true },
    include: {
      originZone: { select: { id: true, name: true } },
      destZone: { select: { id: true, name: true } },
    },
    orderBy: [{ originZone: { name: 'asc' } }, { destZone: { name: 'asc' } }],
  })
}

export async function getPrice(fromZoneId: string, toZoneId: string) {
  const zonePrice = await prisma.zonePrice.findUnique({
    where: {
      originZoneId_destZoneId: {
        originZoneId: fromZoneId,
        destZoneId: toZoneId,
      },
    },
    include: {
      originZone: { select: { name: true } },
      destZone: { select: { name: true } },
    },
  })

  return zonePrice
}
