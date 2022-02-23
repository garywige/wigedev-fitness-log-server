import { Router, Request, Response } from 'express'
import { UserService } from '../../services/userService'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    await UserService.instance.postSignup(req, res)
})

export default router