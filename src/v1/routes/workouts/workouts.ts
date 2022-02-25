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
    await WorkoutService.instance.getWorkoutFromDate(req, res)
})

router.put('/:date', async (req: Request, res: Response) => {
    await WorkoutService.instance.putWorkout(req, res)
})

router.delete('/:date', async (req: Request, res: Response) => {
    await WorkoutService.instance.deleteWorkout(req, res)
})

export default router
