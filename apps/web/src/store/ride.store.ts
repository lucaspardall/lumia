import { create } from 'zustand'
import api from '../lib/api'
import { getSocket } from '../lib/socket'

interface Zone {
  id: string
  name: string
  centerLat: number
  centerLng: number
}

interface RideDriver {
  id: string
  user: { name: string; phone: string }
  vehicleMake: string
  vehicleModel: string
  vehicleColor: string
  licensePlate: string
  currentLat?: number
  currentLng?: number
}

interface Ride {
  id: string
  status: string
  price: number
  paymentMethod: string
  originZone: { name: string }
  destZone: { name: string }
  pickupAddress?: string
  dropoffAddress?: string
  driver?: RideDriver
  requestedAt: string
  completedAt?: string
}

interface RideState {
  zones: Zone[]
  currentRide: Ride | null
  driverLocation: { lat: number; lng: number } | null
  isLoading: boolean
  error: string | null

  fetchZones: () => Promise<void>
  getPrice: (fromId: string, toId: string) => Promise<number | null>
  requestRide: (data: {
    originZoneId: string
    destZoneId: string
    pickupLat: number
    pickupLng: number
    pickupAddress?: string
    paymentMethod: 'PIX' | 'CASH'
  }) => Promise<void>
  cancelRide: (reason?: string) => Promise<void>
  rateRide: (rating: number, comment?: string) => Promise<void>
  listenToRideEvents: () => void
  clearRide: () => void
}

export const useRideStore = create<RideState>((set, get) => ({
  zones: [],
  currentRide: null,
  driverLocation: null,
  isLoading: false,
  error: null,

  fetchZones: async () => {
    try {
      const { data } = await api.get('/zones')
      set({ zones: data })
    } catch {
      console.error('Erro ao buscar zonas')
    }
  },

  getPrice: async (fromId, toId) => {
    try {
      const { data } = await api.get(`/zones/price?from=${fromId}&to=${toId}`)
      return data.price
    } catch {
      return null
    }
  },

  requestRide: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/rides', input)
      set({ currentRide: data, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao solicitar corrida'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  cancelRide: async (reason) => {
    const ride = get().currentRide
    if (!ride) return

    try {
      await api.put(`/rides/${ride.id}/cancel`, { reason })
      set({ currentRide: null, driverLocation: null })
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Erro ao cancelar' })
    }
  },

  rateRide: async (rating, comment) => {
    const ride = get().currentRide
    if (!ride) return

    try {
      await api.post(`/rides/${ride.id}/rating`, { rating, comment })
      set({ currentRide: null })
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Erro ao avaliar' })
    }
  },

  listenToRideEvents: () => {
    const socket = getSocket()
    if (!socket) return

    socket.on('ride:driver-accepted', (data) => {
      set((state) => ({
        currentRide: state.currentRide
          ? { ...state.currentRide, status: 'ACCEPTED', driver: data.driver }
          : null,
      }))
    })

    socket.on('ride:driver-location', (data: { lat: number; lng: number }) => {
      set({ driverLocation: data })
    })

    socket.on('ride:driver-arrived', () => {
      set((state) => ({
        currentRide: state.currentRide
          ? { ...state.currentRide, status: 'ARRIVING' }
          : null,
      }))
    })

    socket.on('ride:started', () => {
      set((state) => ({
        currentRide: state.currentRide
          ? { ...state.currentRide, status: 'IN_PROGRESS' }
          : null,
      }))
    })

    socket.on('ride:completed', (data) => {
      set((state) => ({
        currentRide: state.currentRide
          ? { ...state.currentRide, status: 'COMPLETED', ...data }
          : null,
      }))
    })
  },

  clearRide: () => set({ currentRide: null, driverLocation: null, error: null }),
}))
