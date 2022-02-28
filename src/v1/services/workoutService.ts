import { Request, Response } from 'express'
import { ObjectId, OptionalId } from 'mongodb'
import { Database } from '../../database/database'
import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { TokenPackage, TokenService } from './tokenService'
import { validateDate } from './validation'
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
            const workouts = await db.collection('workouts').find({ cycle_id: cycle._id})

            await workouts.forEach(workout => {
                // get set count
                db.collection('sets').countDocuments({ workout_id: workout._id}).then(count => {
                    output.workouts.push({date: workout.date.toISOString().split('T')[0] ,setCount: count})
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
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        const body = req.body as WorkoutPostReqBody
        if (!body?.date || !body?.cycleId || !body?.sets || !Array.isArray(body.sets)) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            date: body.date,
            cycleId: body.cycleId,
            sets: []
        }
        try {
            const db = Database.instance.db
            
            // validate that this cycle belongs to the user
            const cycle = await db.collection('cycles').findOne({ _id: new ObjectId(body.cycleId)})
            if(cycle?.user_id?.toHexString() !== tokenPackage.id){
                res.status(401).send(UnauthorizedError)
                return
            }

            // validate that the exercises belong to this user
            body.sets.forEach(async set => {
                const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(set.exerciseId)})
                if(exercise?.user_id?.toHexString() !== tokenPackage.id){
                    res.status(401).send(UnauthorizedError)
                    return
                }
            })

            // validate that there aren't currently any workouts on this date for this cycle
            const workoutCount = await db.collection('workouts').countDocuments({ date: new Date(body.date), cycle_id: new ObjectId(body.cycleId)})
            if(workoutCount > 0){
                res.status(401).send(UnauthorizedError)
                return
            }

            // create the workout
            console.log('creating workout...')
            const workout = await db.collection('workouts').insertOne({ date: new Date(body.date), cycle_id: new ObjectId(body.cycleId)})

            // create the sets with the new workoutId
            const resultIds = []
            for(const set of body.sets){
                
                const setId = await this.createSet(workout?.insertedId?.toHexString(), set.exerciseId, set.weight, set.unit, 
                    set.repsPrescribed, set.repsPerformed)

                resultIds.push(setId)
            }

            // format output
            for(let i = 0; i < body.sets.length; i++){

                const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(body.sets[i].exerciseId)})

                output.sets.push({
                    id: resultIds[i],
                    exercise: {
                        id: body.sets[i].exerciseId,    
                        name: exercise?.name
                    },
                    weight: body.sets[i].weight,
                    unit: body.sets[i].unit,
                    repsPrescribed: body.sets[i].repsPrescribed,
                    repsPerformed: body.sets[i].repsPerformed
                })
            }

            setTimeout(() => res.status(201).send(output), 100)

        } catch (err){
            console.log(err)
            res.status(500).send(InternalServerError)
            return
        }
    }

    async getWorkoutFromDate(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

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

    private async createSet(workoutId: string, exerciseId: string, weight: number, unit: Unit, repsPrescribed: number, repsPerformed?: number) : Promise<string> {
        const db = Database.instance.db

        const set = {
            workout_id: new ObjectId(workoutId),
            exercise_id: new ObjectId(exerciseId),
            weight: weight,
            unit: unit,
            repsPrescribed: repsPrescribed
        }

        if(repsPerformed){
            set['repsPerformed'] = repsPerformed
        }

        const result = await db.collection('sets').insertOne(set)

        return result?.insertedId?.toHexString() ?? ''
    }
}

interface WorkoutPostReqBody {
    date: string
    cycleId: string
    sets: SetReqBody[]
}

interface WorkoutPutReqBody {
    sets: SetReqBody[]
}

interface SetReqBody {
    exerciseId: string
    weight: number
    unit: Unit
    repsPrescribed: number
    repsPerformed: number | null
}

enum Unit {
    Lbs = 'lbs',
    KG = 'kg',
}
