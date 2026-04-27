import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extende o Request do Express para incluir o userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
    }
  }
}

interface JwtPayload {
  sub: string
  role: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Formato de token inválido' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET não configurado')
    }

    const decoded = jwt.verify(token, secret) as JwtPayload
    req.userId = decoded.sub
    req.userRole = decoded.role

    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

// Middleware para restringir acesso por role
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Acesso não autorizado' })
      return
    }
    next()
  }
}
