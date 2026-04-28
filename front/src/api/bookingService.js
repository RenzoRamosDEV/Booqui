//
import axios from 'axios'

const BASE = import.meta.env.VITE_BOOKING_API

// Exportación nombrada explícita
export const createBooking = (data) => axios.post(BASE, data)

export const getBookingById = (id) => axios.get(`${BASE}/${id}`)

export const getBookingsByUser = (userId) => axios.get(`${BASE}/user/${userId}`)

// Exportación de getUserBookings 
export const getUserBookings = (userId) => {
  return getBookingsByUser(userId)
}

// Exportación de las reservas de todos los usuarios (solo para admin)
export const getAllBookings = () => axios.get(BASE)

//
const bookingService = {
  createBooking,
  getBookingById,
  getBookingsByUser,
  getUserBookings,
  getAllBookings
}

export default bookingService