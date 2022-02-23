import { Request, Response } from "express"
import { InternalServerError } from "./responses"

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
}