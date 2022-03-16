import { Request, Response, Router } from 'express'

const router = Router()

router.put('/', async (req: Request, res: Response) => {
    console.log('PUT /v1/verifyemail')
})

export default router