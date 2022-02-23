import { Router } from 'express'
import signin from './routes/users/signin'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)

export default router