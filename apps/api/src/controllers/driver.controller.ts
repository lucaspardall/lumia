import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as driverService from '../services/driver.service'

const updateProfileSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().optional(),
  vehicleColor: z.string().optional(),
})

const availabilitySchema = z.object({
  availability: z.enum(['ONLINE', 'OFFLINE']),
})

const registerDriverSchema = z.object({
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z.number().min(1990).max(2030),
  vehicleColor: z.string().min(1),
  licensePlate: z.string().min(5),
  cnhNumber: z.string().min(5),
  cnhImageUrl: z.string().url().optional(),
})

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await driverService.getProfile(req.userId!)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body)
    const profile = await driverService.updateProfile(req.userId!, data)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

export async function setAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { availability } = availabilitySchema.parse(req.body)
    const result = await driverService.setAvailability(req.userId!, availability)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getEarnings(req: Request, res: Response, next: NextFunction) {
  try {
    const period = req.query.period as string | undefined
    const result = await driverService.getEarnings(req.userId!, period)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function registerDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerDriverSchema.parse(req.body)
    const driver = await driverService.registerDriver(req.userId!, data)
    res.status(201).json(driver)
  } catch (err) {
    next(err)
  }
}
