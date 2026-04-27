import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { phone: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      phone: 'admin',
      email: 'admin@lumia.app',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin criado: ${admin.name} (${admin.id})`)

  // 2. Criar zonas da região
  const zonasData = [
    {
      name: 'Lumiar Centro',
      description: 'Centro de Lumiar — ponto principal',
      centerLat: -22.3725,
      centerLng: -42.3533,
    },
    {
      name: 'São Pedro da Serra',
      description: 'Vila de São Pedro da Serra',
      centerLat: -22.3547,
      centerLng: -42.3708,
    },
    {
      name: 'Boa Esperança',
      description: 'Localidade de Boa Esperança',
      centerLat: -22.3890,
      centerLng: -42.3400,
    },
    {
      name: 'Benfica',
      description: 'Distrito de Benfica',
      centerLat: -22.3600,
      centerLng: -42.3300,
    },
    {
      name: 'Santiago',
      description: 'Localidade de Santiago',
      centerLat: -22.3450,
      centerLng: -42.3600,
    },
  ]

  const zonas = []
  for (const zona of zonasData) {
    const created = await prisma.zone.upsert({
      where: { name: zona.name },
      update: {},
      create: zona,
    })
    zonas.push(created)
    console.log(`✅ Zona criada: ${created.name}`)
  }

  // 3. Tabela de preços entre zonas
  // Matriz de preços (índice = zona de origem, coluna = zona de destino)
  // Lumiar Centro, São Pedro, Boa Esperança, Benfica, Santiago
  const precos = [
    //  LC    SP    BE    BF    ST
    [   0,   20,   25,   30,   15 ], // Lumiar Centro
    [  20,    0,   35,   40,   25 ], // São Pedro da Serra
    [  25,   35,    0,   20,   30 ], // Boa Esperança
    [  30,   40,   20,    0,   45 ], // Benfica
    [  15,   25,   30,   45,    0 ], // Santiago
  ]

  let precosCount = 0
  for (let i = 0; i < zonas.length; i++) {
    for (let j = 0; j < zonas.length; j++) {
      if (i === j) continue // Não cria preço para mesma zona

      await prisma.zonePrice.upsert({
        where: {
          originZoneId_destZoneId: {
            originZoneId: zonas[i].id,
            destZoneId: zonas[j].id,
          },
        },
        update: { price: precos[i][j] },
        create: {
          originZoneId: zonas[i].id,
          destZoneId: zonas[j].id,
          price: precos[i][j],
        },
      })
      precosCount++
    }
  }
  console.log(`✅ ${precosCount} preços entre zonas criados`)

  // 4. Configurações iniciais do app
  const configs = [
    { key: 'commission_rate', value: '0.15', description: 'Taxa de comissão (15%)' },
    { key: 'min_driver_balance', value: '100', description: 'Saldo mínimo para cobrança de comissão (R$)' },
    { key: 'app_active', value: 'true', description: 'App ativo para novos pedidos' },
  ]

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    })
  }
  console.log('✅ Configurações do app criadas')

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
