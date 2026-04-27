import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

// Erro customizado com status HTTP
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Handler global de erros
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Erro de validação Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Erro customizado da aplicação
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  // Erro inesperado
  console.error('❌ Erro interno:', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
