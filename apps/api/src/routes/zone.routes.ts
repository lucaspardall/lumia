import { Router } from 'express'
import * as zoneController from '../controllers/zone.controller'

const router = Router()

// Rotas públicas — não precisam de auth
router.get('/', zoneController.getZones)
router.get('/prices', zoneController.getAllPrices)
router.get('/price', zoneController.getPrice)

export default router
