import { Router, Request, Response } from 'express'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    console.log('POST /v1/signup')
})

export default router