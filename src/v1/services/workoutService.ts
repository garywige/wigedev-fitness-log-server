import {
    BadRequestError,
    ForbiddenError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { Request, Response } from 'express'
import { TokenPackage, TokenService } from './tokenService'

import { Database } from '../../database/database'
import { ObjectId } from 'mongodb'
import { validateDate } from './validation'

export class WorkoutService {
    private static _instance: WorkoutService
    private _tokenService: TokenService

    private constructor() {
        this._tokenService = TokenService.instance
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
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        if (!req.query?.cycle) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            workouts: [],
        }

        try {
            const db = Database.instance.db

            // validate user
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.query.cycle as string) })
            if (cycle?.user_id.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get workouts for the specified cycle
            const workouts = await db
                .collection('workouts')
                .aggregate([
                    { $match: { cycle_id: cycle._id } },
                    { $sort: { date: 1 } },
                ])

            while (await workouts.hasNext()) {
                const workout = await workouts.next()

                // get set count
                const count = await db
                    .collection('sets')
                    .countDocuments({ workout_id: workout?._id })

                output.workouts.push({
                    date: workout.date.toISOString().split('T')[0],
                    setCount: count,
                })
            }

            res.status(200).send(output)
        } catch {
            res.status(500).send(InternalServerError)
            return
        }
    }

    async postWorkouts(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        const body = req.body as WorkoutPostReqBody
        if (
            !body?.date ||
            !body?.cycleId ||
            !body?.sets ||
            !Array.isArray(body.sets)
        ) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            date: body.date,
            cycleId: body.cycleId,
            sets: [],
        }
        try {
            const db = Database.instance.db

            // validate that this cycle belongs to the user
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(body.cycleId) })
            if (cycle?.user_id?.toHexString() !== tokenPackage.id) {
                res.status(403).send(ForbiddenError)
                return
            }

            // validate that the exercises belong to this user
            body.sets.forEach(async (set) => {
                const exercise = await db
                    .collection('exercises')
                    .findOne({ _id: new ObjectId(set.exerciseId) })
                if (exercise?.user_id?.toHexString() !== tokenPackage.id) {
                    res.status(403).send(ForbiddenError)
                    return
                }
            })

            // validate that there aren't currently any workouts on this date for this cycle
            const workoutCount = await db
                .collection('workouts')
                .countDocuments({
                    date: new Date(body.date),
                    cycle_id: new ObjectId(body.cycleId),
                })
            if (workoutCount > 0) {
                res.status(403).send(ForbiddenError)
                return
            }

            // create the workout
            console.log('creating workout...')
            const workout = await db.collection('workouts').insertOne({
                date: new Date(body.date),
                cycle_id: new ObjectId(body.cycleId),
            })

            // create the sets with the new workoutId
            const resultIds = []
            for (const set of body.sets) {
                const setId = await this.createSet(
                    workout?.insertedId?.toHexString(),
                    set.exerciseId,
                    set.weight,
                    set.unit,
                    set.repsPrescribed,
                    set.repsPerformed,
                    set.order
                )

                resultIds.push(setId)
            }

            // format output
            for (let i = 0; i < body.sets.length; i++) {
                const exercise = await db
                    .collection('exercises')
                    .findOne({ _id: new ObjectId(body.sets[i].exerciseId) })

                output.sets.push({
                    id: resultIds[i],
                    exercise: {
                        id: body.sets[i].exerciseId,
                        name: exercise?.name,
                    },
                    weight: body.sets[i].weight,
                    unit: body.sets[i].unit,
                    repsPrescribed: body.sets[i].repsPrescribed,
                    repsPerformed: body.sets[i].repsPerformed,
                })
            }

            setTimeout(() => res.status(201).send(output), 100)
        } catch (err) {
            console.log(err)
            res.status(500).send(InternalServerError)
            return
        }
    }

    async getWorkoutFromDate(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        if (!validateDate(req.params?.date) || !req.query?.cycle) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            date: req.params.date,
            cycleId: req.query.cycle,
            setCount: 0,
            sets: [],
        }

        try {
            const db = Database.instance.db

            // validate that cycle belongs to this user
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.query.cycle as string) })
            if (cycle?.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get the workout requested
            const workout = await db.collection('workouts').findOne({
                cycle_id: cycle._id,
                date: new Date(req.params.date),
            })

            // get the set count
            const workoutId = new ObjectId(workout._id)
            output.setCount = await db
                .collection('sets')
                .countDocuments({ workout_id: workoutId })

            // get the sets of this workout
            const sets = await db
                .collection('sets')
                .aggregate([
                    { $match: { workout_id: workoutId } },
                    { $sort: { order: 1 } },
                ])

            // build the sets array of the output object
            while (await sets.hasNext()) {
                const set = await sets.next()
                const exercise = await db
                    .collection('exercises')
                    .findOne({ _id: new ObjectId(set?.exercise_id) })
                output.sets.push({
                    id: set._id.toHexString(),
                    exercise: {
                        id: exercise?._id?.toHexString(),
                        name: exercise?.name,
                    },
                    weight: set.weight,
                    unit: set.unit,
                    repsPrescribed: set.repsPrescribed,
                    repsPerformed: set.repsPerformed,
                })
            }

            res.status(200).send(output)
        } catch {
            res.status(500).send(InternalServerError)
            return
        }
    }

    async putWorkout(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        const body = req.body as WorkoutPutReqBody
        if (
            !validateDate(req.params?.date) ||
            !req.query?.cycle ||
            !body?.sets
        ) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            date: req.params.date,
            cycleId: req.query.cycle,
            sets: [],
        }

        try {
            // validate user
            const db = Database.instance.db
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.query.cycle as string) })
            if (cycle?.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get the workout
            const workout = await db.collection('workouts').findOne({
                cycle_id: cycle._id,
                date: new Date(req.params.date),
            })

            // delete current sets associated with this workout
            await db.collection('sets').deleteMany({ workout_id: workout?._id })

            // save these sets to this workout
            body.sets.forEach(async (set) => {
                const exercise = await db
                    .collection('exercises')
                    .findOne({ _id: new ObjectId(set.exerciseId) })
                const setId = await this.createSet(
                    workout?._id?.toHexString(),
                    set.exerciseId,
                    set.weight,
                    set.unit,
                    set.repsPrescribed,
                    set.repsPerformed,
                    set.order
                )
                output.sets.push({
                    id: setId,
                    exercise: {
                        id: set.exerciseId,
                        name: exercise?.name,
                    },
                    weight: set.weight,
                    unit: set.unit,
                    repsPrescribed: set.repsPrescribed,
                    repsPerformed: set.repsPerformed,
                })
            })
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        setTimeout(() => res.status(200).send(output), 100)
    }

    async deleteWorkout(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        if (!validateDate(req.params?.date) || !req.query?.cycle) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // validate user
            const db = Database.instance.db
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.query.cycle as string) })
            if (cycle?.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // delete all sets in this workout
            const workout = await db.collection('workouts').findOne({
                cycle_id: cycle?._id,
                date: new Date(req.params.date),
            })
            await db.collection('sets').deleteMany({ workout_id: workout?._id })

            // delete the workout
            await db.collection('workouts').deleteOne({ _id: workout?._id })
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // status 200
        res.status(200).send(new ServerMessage('1 row(s) deleted successfully'))
    }

    private async createSet(
        workoutId: string,
        exerciseId: string,
        weight: number,
        unit: Unit,
        repsPrescribed: number,
        repsPerformed: number | null,
        order: number
    ): Promise<string> {
        const db = Database.instance.db

        const set = {
            workout_id: new ObjectId(workoutId),
            exercise_id: new ObjectId(exerciseId),
            weight: weight,
            unit: unit,
            repsPrescribed: repsPrescribed,
            order: order,
        }

        if (repsPerformed) {
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
    order: number
}

export enum Unit {
    Lbs = 'lbs',
    KG = 'kg',
}
