import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { errorHandler } from './middlewares/error'
import { setupSocketHandlers } from './lib/socket'

// Rotas
import authRoutes from './routes/auth.routes'
import clientRoutes from './routes/client.routes'
import driverRoutes from './routes/driver.routes'
import rideRoutes from './routes/ride.routes'
import zoneRoutes from './routes/zone.routes'
import adminRoutes from './routes/admin.routes'

const app = express()
const httpServer = createServer(app)

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middlewares globais
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Registrar rotas
app.use('/api/auth', authRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/driver', driverRoutes)
app.use('/api/rides', rideRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/admin', adminRoutes)

// Handler de erros (deve ser o último middleware)
app.use(errorHandler)

// Socket.io — configura todos os eventos
const socketHandlers = setupSocketHandlers(io)

// Exporta io e handlers para uso nos services
export { io, socketHandlers }

// Inicia o servidor
const PORT = process.env.PORT || 3333

httpServer.listen(PORT, () => {
  console.log(`🚀 Lumia API rodando na porta ${PORT}`)
  console.log(`📡 Socket.io pronto`)
})
