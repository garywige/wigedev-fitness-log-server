import { Request, Response } from "express"
import { BadRequestError, InternalServerError } from "./responses"
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

    async postExercises(req: Request, res: Response) {

        // verify auth

        // validate input
        const body = req.body as ExerciseReqBody
        if(!body?.name){
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
            name: 'Bench Press'
        }

        res.status(201).send(output)
    }

    async getExerciseFromId(req: Request, res: Response){

        // verify auth

        // validate input
        if(!/^[0-9]+$/.test(req.params.toString())){
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
            name: 'Bench Press'
        }

        res.status(200).send(output)
    }

    async putExercise(req: Request, res: Response){

        // verify auth

        // validate input
        const body = req.body as ExerciseReqBody
        if(!/^[0-9]+$/.test(req.params.toString()) || !body?.name){
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
            name: 'Bench Press'
        }

        res.status(200).send(output)
    }
}

interface ExerciseReqBody {
    name: string
}