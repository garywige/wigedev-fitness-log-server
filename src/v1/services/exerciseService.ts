import { Request, Response } from 'express'
import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { TokenPackage, TokenService } from './tokenService'
import { validateInt } from './validation'

export class ExerciseService {
    private static _instance: ExerciseService

    private constructor() {
        console.log('ExerciseService instantiated...')
    }

    static get instance(): ExerciseService {
        if (!this._instance) {
            this._instance = new ExerciseService()
        }

        return this._instance
    }

    async getExercises(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        try {
            // business logic
            console.log(JSON.stringify(tokenPackage))
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            exercises: [
                {
                    id: 1337,
                    name: 'Bench Press',
                    workoutCount: 37,
                },
            ],
        }

        res.status(200).send(output)
    }

    async postExercises(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as ExerciseReqBody
        if (!body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: 1337,
            name: 'Bench Press',
        }

        res.status(201).send(output)
    }

    async getExerciseFromId(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!validateInt(req.params?.id)) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: 1337,
            name: 'Bench Press',
        }

        res.status(200).send(output)
    }

    async putExercise(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as ExerciseReqBody
        if (!validateInt(req.params?.id) || !body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: 1337,
            name: 'Bench Press',
        }

        res.status(200).send(output)
    }

    async deleteExercise(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!validateInt(req.params?.id)) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        res.status(200).send(new ServerMessage('1 row(s) deleted successfully'))
    }
}

interface ExerciseReqBody {
    name: string
}
