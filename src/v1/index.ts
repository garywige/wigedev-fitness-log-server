import { Router } from 'express'
import cycles from './routes/cycles/cycles'
import exercises from './routes/exercises/exercises'
import signin from './routes/users/signin'
import signup from './routes/users/signup'
import verifyemail from './routes/users/verify-email'
import workouts from './routes/workouts/workouts'
import upgrade from './routes/users/upgrade'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)
router.use('/signup', signup)
router.use('/upgrade', upgrade)
router.use('/verifyemail', verifyemail)
router.use('/cycles?', cycles)
router.use('/exercises?', exercises)
router.use('/workouts?', workouts)

export default router
