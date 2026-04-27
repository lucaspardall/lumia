import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import * as driverController from '../controllers/driver.controller'

const router = Router()

router.use(authMiddleware)

router.get('/profile', driverController.getProfile)
router.put('/profile', driverController.updateProfile)
router.post('/availability', driverController.setAvailability)
router.get('/earnings', driverController.getEarnings)
router.post('/register', driverController.registerDriver)

export default router
