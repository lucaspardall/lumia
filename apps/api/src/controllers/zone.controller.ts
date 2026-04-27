import { Request, Response, NextFunction } from 'express'
import * as zoneService from '../services/zone.service'

export async function getZones(_req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await zoneService.getZones()
    res.json(zones)
  } catch (err) {
    next(err)
  }
}

export async function getAllPrices(_req: Request, res: Response, next: NextFunction) {
  try {
    const prices = await zoneService.getAllPrices()
    res.json(prices)
  } catch (err) {
    next(err)
  }
}

export async function getPrice(req: Request, res: Response, next: NextFunction) {
  try {
    const from = req.query.from as string
    const to = req.query.to as string

    if (!from || !to) {
      res.status(400).json({ error: 'Parâmetros "from" e "to" são obrigatórios' })
      return
    }

    const price = await zoneService.getPrice(from, to)
    if (!price) {
      res.status(404).json({ error: 'Rota não encontrada' })
      return
    }

    res.json(price)
  } catch (err) {
    next(err)
  }
}
