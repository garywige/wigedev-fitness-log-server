import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { Database } from '../../database/database'
import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { TokenPackage, TokenService } from './tokenService'
import { validateDate, validateInt } from './validation'
export class WorkoutService {
    private static _instance: WorkoutService

    private constructor() {
        console.log('WorkoutService instantiated...')
    }

    static get instance(): WorkoutService {
        if (!this._instance) {
            this._instance = new WorkoutService()
        }

        return this._instance
    }

    async getWorkouts(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        if (!req.query?.cycle) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            workouts: []
        }

        try {

            const db = Database.instance.db

            // validate user
            const cycle = await db.collection('cycles').findOne({ _id: new ObjectId(req.query.cycle as string)})
            if(cycle?.user_id.toHexString() !== tokenPackage.id){
                res.status(401).send(UnauthorizedError)
                return
            }

            // get workouts for the specified cycle
            const workouts = await db.collection('workouts').find({ user_id: new ObjectId(tokenPackage.id), cycle_id: cycle._id})

            await workouts.forEach(workout => {
                // get set count
                db.collection('sets').countDocuments({ workout_id: workout._id}).then(count => {
                    output.workouts.push({date: workout.date, setCount: count})
                })
            })

            setTimeout(() => res.status(200).send(output), 100)
            
        } catch {
            res.status(500).send(InternalServerError)
            return
        }
    }

    async postWorkouts(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as WorkoutPostReqBody
        if (!body?.date || !body?.sets) {
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
                        name: 'Bench Press',
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0,
                },
            ],
        }

        res.status(201).send(output)
    }

    async getWorkoutFromDate(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!validateDate(req.params?.date)) {
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
                        name: 'Bench Press',
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0,
                },
            ],
        }

        res.status(200).send(output)
    }

    async putWorkout(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as WorkoutPutReqBody
        if (!validateDate(req.params?.date) || !body?.sets) {
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
                        name: 'Bench Press',
                    },
                    weight: 135,
                    unit: 'lbs',
                    repsPrescribed: 10,
                    repsPerformed: 0,
                },
            ],
        }

        res.status(200).send(output)
    }

    async deleteWorkout(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!validateDate(req.params?.date)) {
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
    KG = 'kg',
}
