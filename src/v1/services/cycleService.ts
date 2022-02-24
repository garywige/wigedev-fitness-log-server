import { Request, Response } from "express"
import { BadRequestError, InternalServerError, ServerMessage } from "./responses"
import { validateInt, validateReqParam } from "./validation"

export class CycleService {
    private static _instance: CycleService

    private constructor(){
        console.log('CycleService instantiated...')
    }

    static get instance() : CycleService {
        if(!this._instance){
            this._instance = new CycleService()
        }

        return this._instance
    }

    async getCycles(req: Request, res: Response) {
        // verify authorization

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
        }

        // format output
        const output = {
            cycles: [
                {
                    id: 1337,
                    name: 'Starting Strength',
                    modified: '20220223',
                    workoutCount: 23
                }
            ]
        }

        res.status(200).send(output)
    }

    async postCycles(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as CyclesReqBody
        if(!validateReqParam(body)) {
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
            name: 'Starting Strength',
            modified: '20220223',
            workoutCount: 15
        }

        res.status(201).send(output)
    }

    async getCycleFromId(req: Request, res: Response){

        // verify auth

        // validate input
        if(!validateInt(req.params?.id)){
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
        }

        // format output
        const output = {
            id: 1337,
            name: 'Starting Strength',
            modified: '20220223',
            workoutCount: 15
        }

        res.status(200).send(output)
    }

    async putCycleFromId(req: Request, res: Response){

        // verify auth

        // validate input
        const body = req.body as CyclesReqBody
        if(!validateInt(req.params?.id) || !validateReqParam(body)){
            res.status(400).send(BadRequestError)
            return
        }

        try{
            // do business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: 1337,
            name: 'Starting Strength',
            modified: '20220223',
            workoutCount: 15
        }

        res.status(200).send(output)
    }

    async deleteCycle(req: Request, res: Response){

        // verify auth

        // validate input
        if(!validateInt(req.params?.id)){
            res.status(400).send(BadRequestError)
            return
        }

        try{
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = new ServerMessage('1 row(s) deleted successfully')
        res.status(200).send(output)
    }
}

interface CyclesReqBody {
    name: string
}