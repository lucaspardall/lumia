import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as rideService from '../services/ride.service'

const createRideSchema = z.object({
  originZoneId: z.string().min(1),
  destZoneId: z.string().min(1),
  pickupLat: z.number(),
  pickupLng: z.number(),
  pickupAddress: z.string().optional(),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),
  dropoffAddress: z.string().optional(),
  paymentMethod: z.enum(['PIX', 'CASH']),
})

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function createRide(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createRideSchema.parse(req.body)
    const ride = await rideService.createRide({ ...data, clientId: req.userId! })
    res.status(201).json(ride)
  } catch (err) {
    next(err)
  }
}

export async function getRide(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.getRide(req.params.id)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function acceptRide(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.acceptRide(req.params.id, req.userId!)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function arriveAtPickup(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.arriveAtPickup(req.params.id, req.userId!)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function startRide(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.startRide(req.params.id, req.userId!)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function completeRide(req: Request, res: Response, next: NextFunction) {
  try {
    const ride = await rideService.completeRide(req.params.id, req.userId!)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function cancelRide(req: Request, res: Response, next: NextFunction) {
  try {
    const reason = req.body.reason as string | undefined
    const ride = await rideService.cancelRide(req.params.id, req.userId!, reason)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}

export async function rateRide(req: Request, res: Response, next: NextFunction) {
  try {
    const { rating, comment } = ratingSchema.parse(req.body)
    const ride = await rideService.rateRide(req.params.id, req.userId!, rating, comment)
    res.json(ride)
  } catch (err) {
    next(err)
  }
}
