import { Router } from 'express'
import v1 from './v1/index'


const api = Router()

// Configure all routes here
api.use('/v1', v1)

export default api