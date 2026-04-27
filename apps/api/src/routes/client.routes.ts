import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import * as clientController from '../controllers/client.controller'

const router = Router()

router.use(authMiddleware)

router.get('/profile', clientController.getProfile)
router.put('/profile', clientController.updateProfile)
router.get('/rides', clientController.getRides)

export default router
