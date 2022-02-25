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
    await CycleService.instance.getCycleFromId(req, res)
})

router.put('/:id', async (req: Request, res: Response) => {
    await CycleService.instance.putCycleFromId(req, res)
})

router.delete('/:id', async (req: Request, res: Response) => {
    await CycleService.instance.deleteCycle(req, res)
})

export default router
