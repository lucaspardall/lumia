import { Router } from 'express'
import { authMiddleware, requireRole } from '../middlewares/auth'
import * as adminController from '../controllers/admin.controller'

const router = Router()

// Todas as rotas admin exigem auth + role ADMIN
router.use(authMiddleware)
router.use(requireRole('ADMIN'))

router.get('/dashboard', adminController.getDashboard)
router.get('/drivers', adminController.getDrivers)
router.put('/drivers/:id/approve', adminController.approveDriver)
router.put('/drivers/:id/block', adminController.blockDriver)
router.get('/rides', adminController.getRides)
router.put('/zones/:id', adminController.updateZone)
router.put('/prices/:id', adminController.updatePrice)
router.get('/commissions', adminController.getCommissions)
router.post('/commissions/pay', adminController.payCommission)

export default router
