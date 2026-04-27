import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as clientService from '../services/client.service'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
})

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await clientService.getProfile(req.userId!)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body)
    const profile = await clientService.updateProfile(req.userId!, data)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

export async function getRides(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const result = await clientService.getRides(req.userId!, page, limit)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
