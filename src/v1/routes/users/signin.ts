import { Router } from 'express'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    console.log('POST /v1/signin')
    
})

export default router