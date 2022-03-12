import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { Document, InsertOneResult, ObjectId, WithId } from 'mongodb'
import { Request, Response } from 'express'
import { TokenPackage, TokenService } from './tokenService'

import { Database } from '../../database/database'

export class CycleService {
    private static _instance: CycleService
    private _tokenService: TokenService

    private constructor() {
        this._tokenService = TokenService.instance
    }

    static get instance(): CycleService {
        if (!this._instance) {
            this._instance = new CycleService()
        }

        return this._instance
    }

    async getCycles(req: Request, res: Response) {
        // verify authorization
        let tokenPackage: TokenPackage
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        const output = {
            cycles: [],
        }
        try {
            const db = Database.instance.db

            // get all cycles associated with this user ID
            const cycles = db
                .collection('cycles')
                .aggregate(
                    [
                        { $match: { user_id: new ObjectId(tokenPackage?.id)}},
                        { $sort: { name: 1 }},
                        { $project: { _id: 1, name: 1}}
                    ]
                )

            // for each cycle
            while(await cycles.hasNext()){
                const cycle = await cycles.next()

                // get workout count
                const count = await this.getWorkoutCount(cycle?._id?.toHexString())

                // get date of last workout
                const lastWorkout = await this.getLastWorkoutDate(
                    cycle?._id?.toHexString()
                )
                
                // add to output array
                output.cycles.push({
                    id: cycle?._id?.toHexString(),
                    name: cycle?.name,
                    modified: lastWorkout,
                    workoutCount: count,
                })
            }

            res.status(200).send(output)
        } catch (err){
            res.status(500).send(InternalServerError)
            return
        }
    }

    async postCycles(req: Request, res: Response) {
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
        const body = req.body as CyclesReqBody
        if (!body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        let result: InsertOneResult
        try {
            // add cycle to collection
            result = await Database.instance.db.collection('cycles').insertOne({
                user_id: new ObjectId(tokenPackage?.id),
                name: body.name,
                modified: '1970-01-01',
                workoutCount: 0,
            })
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: result?.insertedId.toHexString(),
            name: body?.name,
            modified: '1970-01-01',
            workoutCount: 0,
        }

        res.status(201).send(output)
    }

    async getCycleFromId(req: Request, res: Response) {
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
        if (!req.params?.id) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            id: req.params?.id,
            name: '',
            modified: '',
            workoutCount: 0,
        }
        try {
            const db = Database.instance.db

            // verify cycle is for this user id
            const cycleRow = await db
                .collection('cycles')
                .findOne(
                    { _id: new ObjectId(req.params?.id) },
                    { projection: { user_id: 1, name: 1 } }
                )
            if (cycleRow.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get date of last workout
            output.modified = await this.getLastWorkoutDate(
                cycleRow?._id?.toHexString()
            )

            // get workout count
            output.workoutCount = await this.getWorkoutCount(
                cycleRow?._id?.toHexString()
            )

            // set output
            output.name = cycleRow.name
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send(output)
    }

    async putCycleFromId(req: Request, res: Response) {
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
        const body = req.body as CyclesReqBody
        if (!req.params?.id || !body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        let cycle: WithId<Document>
        let lastWorkout: string
        let workoutCount: number
        try {
            // validate that this cycle belongs to this user
            const db = Database.instance.db
            cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.params?.id) })
            if (cycle.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // update the cycle
            const result = await db
                .collection('cycles')
                .updateOne(
                    { _id: new ObjectId(req.params?.id) },
                    { $set: { name: body.name } }
                )
            if (result.modifiedCount < 1) {
                throw Error('failed to update cycle')
            }

            // get last workout date
            lastWorkout = await this.getLastWorkoutDate(cycle._id.toHexString())

            // get workout count
            workoutCount = await this.getWorkoutCount(cycle._id.toHexString())
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: cycle._id.toHexString(),
            name: body.name,
            modified: lastWorkout,
            workoutCount: workoutCount,
        }

        res.status(200).send(output)
    }

    async deleteCycle(req: Request, res: Response) {
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
        if (!req.params?.id) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // verify that this is for this user
            const db = Database.instance.db
            const cycle = await db
                .collection('cycles')
                .findOne({ _id: new ObjectId(req.params?.id) })
            if (cycle.user_id?.toHexString() !== tokenPackage.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get workouts
            const cycleId = new ObjectId(req.params.id)
            const workouts = await db
                .collection('workouts')
                .find({ cycle_id: cycleId })

            // delete sets in each workout
            while (await workouts.hasNext()) {
                const workout = await workouts.next()
                await db
                    .collection('sets')
                    .deleteMany({ workout_id: workout?._id })
            }

            // delete all workouts
            await db.collection('workouts').deleteMany({ cycle_id: cycleId })

            // delete the cycle
            const result = await db
                .collection('cycles')
                .deleteOne({ _id: cycleId })

            // check for results
            if (result?.deletedCount < 1) {
                throw Error('failed to delete cycle')
            }
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = new ServerMessage('1 row(s) deleted successfully')
        res.status(200).send(output)
    }

    private async getLastWorkoutDate(cycle_id: string): Promise<string> {
        // get workouts in this cycle
        const db = Database.instance.db
        const workouts = await db
            .collection('workouts')
            .find({ cycle_id: new ObjectId(cycle_id) })

        // iterate through each one
        let lastWorkout = new Date('1970-01-01')
        await workouts.forEach((workout) => {
            // store the date if it's newer
            const workoutDate = new Date(workout.date)
            if (workoutDate > lastWorkout) {
                lastWorkout = workoutDate
            }
        })

        // return the winner
        return lastWorkout.toISOString().split('T')[0]
    }

    private async getWorkoutCount(cycle_id: string): Promise<number> {
        const db = Database.instance.db

        return await db
            .collection('workouts')
            .countDocuments({ cycle_id: new ObjectId(cycle_id) })
    }
}

interface CyclesReqBody {
    name: string
}
