import { Router, Request, Response } from 'express'
import { ExerciseService } from '../../services/exerciseService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    await ExerciseService.instance.getExercises(req, res)
})

router.post('/', async (req: Request, res: Response) => {
    await ExerciseService.instance.postExercises(req, res)
})

router.get('/:id', async (req: Request, res: Response) => {
    await ExerciseService.instance.getExerciseFromId(req, res)
})

router.put('/:id', async (req: Request, res: Response) => {
    await ExerciseService.instance.putExercise(req, res)
})

router.delete('/:id', async (req: Request, res: Response) => {
    console.log('DELETE /v1/exercise/{id}')
})

export default router