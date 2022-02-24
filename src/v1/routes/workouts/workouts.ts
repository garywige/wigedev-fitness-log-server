import { Router, Request, Response } from 'express'
import { WorkoutService } from '../../services/workoutService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    await WorkoutService.instance.getWorkouts(req, res)
})

router.post('/', async (req: Request, res: Response) => {
    await WorkoutService.instance.postWorkouts(req, res)
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