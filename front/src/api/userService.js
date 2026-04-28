import axios from 'axios'

const BASE = import.meta.env.VITE_USER_API

export const createUser = (data) => axios.post(BASE, data)
export const getUserByEmail = (email) => axios.get(`${BASE}/email/${email}`)
export const getAllUsers = () => axios.get(BASE)
export const updateUser = (email, data) => axios.put(`${BASE}/email/${email}`, data)
export const deleteUser = (email) => axios.delete(`${BASE}/email/${email}`)