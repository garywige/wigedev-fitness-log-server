import { Router } from 'express'
import signin from './routes/users/signin'
import signup from './routes/users/signup'
import cycles from './routes/cycles/cycles'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)
router.use('/signup', signup)
router.use('/cycles?', cycles)

export default router