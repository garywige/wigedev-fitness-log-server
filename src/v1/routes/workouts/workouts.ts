import { Router } from 'express'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    console.log('GET /v1/workouts')
})

router.post('/', async (req: Request, res: Response) => {
    console.log('POST /v1/workouts')
})

router.get('/:date', async (req: Request, res: Response) => {
    console.log('GET /v1/workout/{date}')
})

router.put('/:date', async (req: Request, res: Response) => {
    console.log('PUT /v1/workout/{date}')
})

router.delete('/:date', async (req: Request, res: Response) => {
    console.log('DELETE /v1/workout/{date}')
})

export default router