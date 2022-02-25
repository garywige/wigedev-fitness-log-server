import { Router } from 'express'
import signin from './routes/users/signin'
import signup from './routes/users/signup'
import cycles from './routes/cycles/cycles'
import exercises from './routes/exercises/exercises'
import workouts from './routes/workouts/workouts'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)
router.use('/signup', signup)
router.use('/cycles?', cycles)
router.use('/exercises?', exercises)
router.use('/workouts?', workouts)

export default router
