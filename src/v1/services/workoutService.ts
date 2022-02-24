import { Request, Response } from "express"
import { BadRequestError, InternalServerError } from "./responses"
export class WorkoutService {
    private static _instance: WorkoutService

    private constructor(){
        console.log('WorkoutService instantiated...')
    }

    static get instance() : WorkoutService {
        if(!this._instance){
            this._instance = new WorkoutService()
        }

        return this._instance
    }

    async getWorkouts(req: Request, res: Response){
        // verify auth

        // validate input
        if(!/^[0-9]+$/.test(req.query?.cycle?.toString())){
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
            date: '20220223',
            setCount: 16
        }

        res.status(200).send(output)
    }
}