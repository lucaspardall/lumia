import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import * as rideController from '../controllers/ride.controller'

const router = Router()

router.use(authMiddleware)

router.post('/', rideController.createRide)
router.get('/:id', rideController.getRide)
router.put('/:id/accept', rideController.acceptRide)
router.put('/:id/arrive', rideController.arriveAtPickup)
router.put('/:id/start', rideController.startRide)
router.put('/:id/complete', rideController.completeRide)
router.put('/:id/cancel', rideController.cancelRide)
router.post('/:id/rating', rideController.rateRide)

export default router
