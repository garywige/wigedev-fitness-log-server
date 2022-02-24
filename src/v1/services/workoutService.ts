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

    async postWorkouts(req: Request, res: Response){
        // verify auth

        // validate input
        const body = req.body as WorkoutReqBody
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
        if(!/^[0-9]{8}$/.test(req.params?.date)){
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
        const body = req.body as WorkoutReqBody
        if(!/^[0-9]{8}$/.test(req.params?.date) || !body?.date || !body?.sets){
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
}

interface WorkoutReqBody {
    date: string
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