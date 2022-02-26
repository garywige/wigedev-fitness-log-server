import { ObjectID } from 'bson'
import { Request, Response } from 'express'
import { FindCursor, InsertOneResult, ObjectId } from 'mongodb'
import { Database } from '../../database/database'
import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { TokenPackage, TokenService } from './tokenService'
import { validateInt } from './validation'

export class ExerciseService {
    private static _instance: ExerciseService

    private constructor() {
        console.log('ExerciseService instantiated...')
    }

    static get instance(): ExerciseService {
        if (!this._instance) {
            this._instance = new ExerciseService()
        }

        return this._instance
    }

    async getExercises(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        let exercises: FindCursor
        const output = {
            exercises: []
        }

        try {
            // get exercises associated with this user
            exercises = await this.findExercises(tokenPackage.id)

            // grab workout count for each workout
            exercises.forEach(doc => {
                output.exercises.push({id: doc._id, name: doc.name, workoutCount: this.getSetCount(doc._id)})
            })

        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send(output)
    }

    async postExercises(req: Request, res: Response) {
        // verify auth
        let tokenPackage: TokenPackage
        if(!(tokenPackage = await TokenService.instance.extractTokenPackage(req?.headers?.authorization ?? ''))){
            res.status(401).send(UnauthorizedError)
            return
        }

        // validate input
        const body = req.body as ExerciseReqBody
        if (!body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        let document: InsertOneResult
        try {
            // business logic
            const db = Database.instance.db
            document = await db.collection('exercises').insertOne({ user_id: new ObjectId(tokenPackage.id), name: body?.name})
        } catch (e){
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: document.insertedId,
            name: body?.name,
        }

        res.status(201).send(output)
    }

    async getExerciseFromId(req: Request, res: Response) {
        // verify auth

        // validate input
        if (!req.params?.id) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            id: '',
            name: ''
        }
        try {
            // get the exercise
            const db = Database.instance.db
            const row = await db.collection('exercises').findOne({ _id: new ObjectId(req.params?.id)}, { projection: {_id: 1, name: 1}})
            output.id = row?._id.toHexString()
            output.name = row?.name
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send(output)
    }

    async putExercise(req: Request, res: Response) {
        // verify auth

        // validate input
        const body = req.body as ExerciseReqBody
        if (!validateInt(req.params?.id) || !body?.name) {
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
            name: 'Bench Press',
        }

        res.status(200).send(output)
    }

    async deleteExercise(req: Request, res: Response) {
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
        res.status(200).send(new ServerMessage('1 row(s) deleted successfully'))
    }

    private async findExercises(id: ObjectId){
        const db = Database.instance.db
        return await db.collection('exercises').find({ user_id: id}, { projection: { _id: 1, name: 1}})
    }

    private async getSetCount(exercise_id: ObjectId): Promise<number> {
        const db = Database.instance.db
        return await db.collection('sets').countDocuments({ exercise_id: exercise_id})
    }
}

interface ExerciseReqBody {
    name: string
}
