import { Request, Response } from 'express'
import { ObjectId, InsertOneResult } from 'mongodb'
import { Database } from '../../database/database'
import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { TokenPackage, TokenService } from './tokenService'
import { validateInt } from './validation'

export class CycleService {
    private static _instance: CycleService

    private constructor() {
        console.log('CycleService instantiated...')
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
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        const output = {
            cycles: []
        }
        try {
            const db = Database.instance.db

            // get all cycles associated with this user ID
            const cycles = db.collection('cycles')
                .find({ user_id: new ObjectId(tokenPackage?.id)}, { projection: { _id: 1, name: 1}})

            // for each cycle
            await cycles.forEach(cycle => {

                // get workout count
                this.getWorkoutCount(cycle._id.toHexString()).then(async count => {

                    // get date of last workout
                    const lastWorkout = await this.getLastWorkoutDate(cycle._id.toHexString())

                    // add to output array
                    output.cycles.push({id: cycle._id.toHexString(), name: cycle?.name, modified: lastWorkout, workoutCount: count})
                })
            })

            setTimeout(() => res.status(200).send(output), 100)

        } catch {
            res.status(500).send(InternalServerError)
            return
        }
    }

    async postCycles(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
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
            result = await Database.instance.db.collection('cycles').insertOne({ user_id: new ObjectId(tokenPackage?.id), name: body.name, modified: '1970-01-01', workoutCount: 0})
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
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
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
            const cycleRow = await db.collection('cycles').findOne({ _id: new ObjectId(req.params?.id)}, { projection: { user_id: 1, name: 1}})

            // get date of last workout
            output.modified = await this.getLastWorkoutDate(cycleRow?._id?.toHexString())

            // get workout count
            output.workoutCount = await this.getWorkoutCount(cycleRow?._id?.toHexString())

            // set output
            output.name = cycleRow.name
        
        } catch {
            res.status(500).send(InternalServerError)
        }

        res.status(200).send(output)
    }

    async putCycleFromId(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as CyclesReqBody
        if (!validateInt(req.params?.id) || !body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // do business logic
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: 1337,
            name: 'Starting Strength',
            modified: '20220223',
            workoutCount: 15,
        }

        res.status(200).send(output)
    }

    async deleteCycle(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!validateInt(req.params?.id)) {
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
        const output = new ServerMessage('1 row(s) deleted successfully')
        res.status(200).send(output)
    }

    private async getLastWorkoutDate(cycle_id: string) : Promise<string> {
        // get workouts in this cycle
        const db = Database.instance.db
        const workouts = await db.collection('workouts').find({ cycle_id: new ObjectId(cycle_id)})

        // iterate through each one
        let lastWorkout = new Date('1970-01-01')
        await workouts.forEach( workout => {
            // store the date if it's newer
            const workoutDate = new Date(workout.date)
            if(workoutDate > lastWorkout){
                lastWorkout = workoutDate
            }
        })

        // return the winner
        return lastWorkout.toDateString()
    }

    private async getWorkoutCount(cycle_id: string) : Promise<number> {
        const db = Database.instance.db

        return await db.collection('workouts').countDocuments({ cycle_id: new ObjectId(cycle_id)})
    }
}

interface CyclesReqBody {
    name: string
}
