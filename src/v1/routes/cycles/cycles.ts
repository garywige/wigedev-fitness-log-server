import { Router, Request, Response } from 'express'
import { CycleService } from '../../services/cycleService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    await CycleService.instance.getCycles(req, res)
})

router.post('/', async (req: Request, res: Response) => {
    await CycleService.instance.postCycles(req, res)
})

router.get('/:id', async (req: Request, res: Response) => {
    console.log('GET /v1/cycle/{id}')
})

router.put('/:id', async (req: Request, res: Response) => {
    console.log('PUT /v1/cycle/{id}')
})

router.delete('/:id', async (req: Request, res: Response) => {
    console.log('DELETE /v1/cycle/{id}')
})

export default router