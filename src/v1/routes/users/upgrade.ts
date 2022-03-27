import { Request, Response, Router } from "express";

import { UserService } from "../../services/userService";

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    await UserService.instance.upgrade(req, res)
})

export default router