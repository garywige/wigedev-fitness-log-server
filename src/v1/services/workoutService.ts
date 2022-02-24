import { Request, Response } from "express"
import { BadRequestError, InternalServerError, ServerMessage } from "./responses"
import { validateDate, validateInt } from "./validation"
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
        if(!validateInt(req.query?.cycle as string)){
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

    async postWorkouts(req: Request, res: Response){
        // verify auth

        // validate input
        const body = req.body as WorkoutPostReqBody
        if(!body?.date || !body?.sets){
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
            sets: [
                {
                    id: 1337,
                    exercise: {
                        id: 1337,
                        name: 'Bench Press'
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0
                }
            ]
        }

        res.status(201).send(output)
    }

    async getWorkoutFromDate(req: Request, res: Response){
        // verify auth

        // validate input
        if(!validateDate(req.params?.date)){
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
            sets: [
                {
                    id: 1337,
                    exercise: {
                        id: 1337,
                        name: 'Bench Press'
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0
                }
            ]
        }

        res.status(200).send(output)
    }

    async putWorkout(req: Request, res: Response){
        // verify auth

        // validate input
        const body = req.body as WorkoutPutReqBody
        if(!validateDate(req.params?.date) || !body?.sets){
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
            sets: [
                {
                    id: 1337,
                    exercise: {
                        id: 1337,
                        name: 'Bench Press'
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0
                }
            ]
        }

        res.status(200).send(output)
    }

    async deleteWorkout(req: Request, res: Response){
        // verify auth

        // validate input
        if(!validateDate(req.params?.date)){
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // status 200
        res.status(200).send(new ServerMessage('1 row(s) deleted successfully'))
    }
}

interface WorkoutPostReqBody {
    date: string
    sets: SetReqBody[]
}

interface WorkoutPutReqBody {
    sets: SetReqBody[]
}

interface SetReqBody {
    exerciseId: number
    weight: number
    unit: Unit
    repsPrescribed: number
    repsPerformed: number | null
}

enum Unit {
    Lbs = 'lbs',
    KG = 'kg'
}