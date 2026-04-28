import axios from 'axios'

const BASE = import.meta.env.VITE_EVENT_API

export const getAllEvents = () => axios.get(BASE)
export const getEventById = (id) => axios.get(`${BASE}/${id}`)
export const getEventsByCategory = (category) => axios.get(`${BASE}/search/category?category=${category}`)
export const getEventsByTitle = (title) => axios.get(`${BASE}/search/title?title=${title}`)
export const getEventsByLocation = (location) => axios.get(`${BASE}/search/location?location=${location}`)
export const createEvent = (data) => axios.post(BASE, data)
export const updateEvent = (email, data) => axios.put(`${BASE}/email/${email}`, data)
export const deleteEvent = (email) => axios.delete(`${BASE}/email/${email}`)