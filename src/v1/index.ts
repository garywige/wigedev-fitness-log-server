import { Router } from 'express'
import signin from './routes/users/signin'
import signup from './routes/users/signup'
import cycles from './routes/cycles/cycles'
import exercises from './routes/exercises/exercises'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)
router.use('/signup', signup)
router.use('/cycles?', cycles)
router.use('/exercises?', exercises)

export default router