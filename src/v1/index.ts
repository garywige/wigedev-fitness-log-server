import { Router } from 'express'
import signin from './routes/users/signin'
import signup from './routes/users/signup'

const router = Router()

// Configure all v1 routers here
router.use('/signin', signin)
router.use('/signup', signup)

export default router