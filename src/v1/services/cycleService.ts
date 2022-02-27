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
                console.log(`getting workout count`)
                const cycleId = new ObjectId(cycle?._id)
                db.collection('workouts').countDocuments({ cycle_id: cycleId}).then(count => {

                    // get date of last workout
                    let lastWorkout = new Date('1970-01-01')
                    const workouts = db.collection('workouts').find({cycle_id: cycleId}, { projection: { date: 1 }})
                    workouts.forEach( workout => {
                        const workoutDate = new Date(workout.date)
                        if(workoutDate > lastWorkout){
                            lastWorkout = workoutDate
                        }
                    }).then(() => {

                        // add to output array
                        output.cycles.push({id: cycleId, name: cycle?.name, modified: lastWorkout, workoutCount: count})
                    })
                })
            }).then(() => {
                setTimeout(() => res.status(200).send(output), 1000)
            })

        } catch {
            res.status(500).send(InternalServerError)
            return
        }
    }

    async postCycles(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as CyclesReqBody
        if (!body?.name) {
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
            name: 'Starting Strength',
            modified: '20220223',
            workoutCount: 15,
        }

        res.status(201).send(output)
    }

    async getCycleFromId(req: Request, res: Response) {
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
}

interface CyclesReqBody {
    name: string
}
