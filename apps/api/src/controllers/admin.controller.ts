import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as adminService from '../services/admin.service'

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboard()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getDrivers(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined
    const drivers = await adminService.getDrivers(status)
    res.json(drivers)
  } catch (err) {
    next(err)
  }
}

export async function approveDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await adminService.approveDriver(req.params.id)
    res.json(driver)
  } catch (err) {
    next(err)
  }
}

export async function blockDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await adminService.blockDriver(req.params.id)
    res.json(driver)
  } catch (err) {
    next(err)
  }
}

export async function getRides(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const status = req.query.status as string | undefined
    const result = await adminService.getRides(page, limit, status)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function updateZone(req: Request, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body)
    const zone = await adminService.updateZone(req.params.id, data)
    res.json(zone)
  } catch (err) {
    next(err)
  }
}

export async function updatePrice(req: Request, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      price: z.number().positive().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body)
    const price = await adminService.updatePrice(req.params.id, data)
    res.json(price)
  } catch (err) {
    next(err)
  }
}

export async function getCommissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getCommissions()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function payCommission(req: Request, res: Response, next: NextFunction) {
  try {
    const { driverId, amount, notes } = z.object({
      driverId: z.string().min(1),
      amount: z.number().positive(),
      notes: z.string().optional(),
    }).parse(req.body)
    const payment = await adminService.payCommission(driverId, amount, notes)
    res.json(payment)
  } catch (err) {
    next(err)
  }
}
