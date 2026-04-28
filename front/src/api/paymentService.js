import axios from 'axios'

const BASE = import.meta.env.VITE_PAYMENT_API

export const processPayment = (data) => axios.post(BASE, data)
export const getPaymentsByUser = (userId) => axios.get(`${BASE}/user/${userId}`)

export const getAllPayments = () => axios.get(BASE)