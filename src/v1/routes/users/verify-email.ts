import { Request, Response, Router } from 'express'
import { UserService } from '../../services/userService'

const router = Router()

router.put('/', async (req: Request, res: Response) => {
    await UserService.instance.verifyEmail(req, res)
})

export default router
