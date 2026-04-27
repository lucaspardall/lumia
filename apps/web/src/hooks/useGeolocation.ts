import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(watch = false) {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  })

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      error: null,
      loading: false,
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: 'Permissão de localização negada',
      2: 'Localização indisponível',
      3: 'Tempo esgotado ao obter localização',
    }
    setState((prev) => ({
      ...prev,
      error: messages[error.code] || 'Erro ao obter localização',
      loading: false,
    }))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocalização não suportada', loading: false }))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }

    if (watch) {
      const id = navigator.geolocation.watchPosition(updatePosition, handleError, options)
      return () => navigator.geolocation.clearWatch(id)
    } else {
      navigator.geolocation.getCurrentPosition(updatePosition, handleError, options)
    }
  }, [watch])

  return state
}
