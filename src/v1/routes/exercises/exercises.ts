import { Router, Request, Response } from 'express'
import { ExerciseService } from '../../services/exerciseService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    await ExerciseService.instance.getExercises(req, res)
})

router.post('/', async (req: Request, res: Response) => {
    console.log('POST /v1/exercises')
})

router.get('/:id', async (req: Request, res: Response) => {
    console.log('GET /v1/exercise/{id}')
})

router.put('/:id', async (req: Request, res: Response) => {
    console.log('PUT /v1/exercise/{id}')
})

router.delete('/:id', async (req: Request, res: Response) => {
    console.log('DELETE /v1/exercise/{id}')
})

export default router