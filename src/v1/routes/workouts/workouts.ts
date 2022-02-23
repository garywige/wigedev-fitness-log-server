import { Router } from 'express'

const router = Router()

router.get('/', (req: Request, res: Response) => {
    console.log('GET /v1/workouts')
})

router.post('/', (req: Request, res: Response) => {
    console.log('POST /v1/workouts')
})

router.get('/:date', (req: Request, res: Response) => {
    console.log('GET /v1/workout/{date}')
})

router.put('/:date', (req: Request, res: Response) => {
    console.log('PUT /v1/workout/{date}')
})

router.delete('/:date', (req: Request, res: Response) => {
    console.log('DELETE /v1/workout/{date}')
})

export default router