import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/error'
import type { UserRole } from '@prisma/client'

interface RegisterInput {
  name: string
  phone: string
  email?: string
  password: string
  role?: UserRole
}

interface LoginInput {
  phone: string
  password: string
}

// Gera par de tokens (access + refresh)
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' },
  )

  const refreshToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' },
  )

  return { accessToken, refreshToken }
}

export async function register(data: RegisterInput) {
  // Verificar se telefone já existe
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
  if (existing) {
    throw new AppError('Telefone já cadastrado', 409)
  }

  // Verificar email duplicado
  if (data.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } })
    if (emailExists) {
      throw new AppError('Email já cadastrado', 409)
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'CLIENT',
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  const tokens = generateTokens(user.id, user.role)

  return { user, ...tokens }
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { phone: data.phone } })
  if (!user) {
    throw new AppError('Credenciais inválidas', 401)
  }

  const validPassword = await bcrypt.compare(data.password, user.password)
  if (!validPassword) {
    throw new AppError('Credenciais inválidas', 401)
  }

  const tokens = generateTokens(user.id, user.role)

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    ...tokens,
  }
}

export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      sub: string
      role: string
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } })
    if (!user) {
      throw new AppError('Usuário não encontrado', 401)
    }

    return generateTokens(user.id, user.role)
  } catch {
    throw new AppError('Refresh token inválido', 401)
  }
}
