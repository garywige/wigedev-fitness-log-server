import { Request, Response } from "express"
import { InternalServerError } from "./responses"
export class ExerciseService {
    private static _instance: ExerciseService

    private constructor(){
        console.log('ExerciseService instantiating...')
    }

    static get instance() : ExerciseService {
        if(!this._instance){
            this._instance = new ExerciseService()
        }

        return this._instance
    }

    async getExercises(req: Request, res: Response) {

        // verify auth

        try {
            // business logic
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
                    workoutCount: 37
                }
            ]
        }

        res.status(200).send(output)
    }
}