import { Router, Request, Response } from 'express'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    console.log('GET /v1/cycles')
})

router.post('/', async (req: Request, res: Response) => {
    console.log('POST /v1/cycles')
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