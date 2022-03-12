import {
    BadRequestError,
    InternalServerError,
    ServerMessage,
    UnauthorizedError,
} from './responses'
import { Db, InsertOneResult, ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { TokenPackage, TokenService } from './tokenService'

import { Database } from '../../database/database'

export class ExerciseService {
    private static _instance: ExerciseService
    private _tokenService: TokenService
    private _db: Db

    private constructor() {
        try {
            this._tokenService = TokenService.instance
            this._db = Database.instance.db
        } catch (e) {
            console.error(e)
        }
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
        if (
            !(tokenPackage = await this._tokenService.extractTokenPackage(
                req?.headers?.authorization ?? ''
            ))
        ) {
            res.status(401).send(UnauthorizedError)
            return
        }

        const output = {
            exercises: [],
        }

        try {
            // get exercises associated with this user
            const exercises = await this._db
                .collection('exercises')
                .aggregate([
                    { $match: { user_id: new ObjectId(tokenPackage?.id)}},
                    { $sort: { name: 1}},
                    { $project: { _id: 1, name: 1}}
                ])

            // grab workout count for each workout
            while(await exercises.hasNext()){
                const exercise = await exercises.next()
                const count = await this._db.collection('sets').countDocuments({ exercise_id: new ObjectId(exercise?._id)})

                output.exercises.push({
                    id: exercise?._id?.toHexString(),
                    name: exercise?.name,
                    setCount: count
                })
            }
            
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // send output
        res.status(200).send(output)
    }

    async postExercises(req: Request, res: Response) {
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
        const body = req.body as ExerciseReqBody
        if (!body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        let document: InsertOneResult
        try {
            // business logic
            const db = Database.instance.db
            document = await db.collection('exercises').insertOne({
                user_id: new ObjectId(tokenPackage.id),
                name: body?.name,
            })
        } catch (e) {
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
            id: '',
            name: '',
        }
        try {
            // get the exercise
            const db = Database.instance.db
            const row = await db
                .collection('exercises')
                .findOne(
                    { _id: new ObjectId(req.params?.id) },
                    { projection: { _id: 1, user_id: 1, name: 1 } }
                )
            output.id = row?._id.toHexString()
            output.name = row?.name

            // verify that user is authorized to access this exercise
            if (tokenPackage?.id !== row?.user_id?.toHexString()) {
                res.status(401).send(UnauthorizedError)
                return
            }
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send(output)
    }

    async putExercise(req: Request, res: Response) {
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
        const body = req.body as ExerciseReqBody
        if (!req.params?.id || !body?.name) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // verify that exercise belongs to user
            const db = Database.instance.db
            const row = await db
                .collection('exercises')
                .findOne(
                    { _id: new ObjectId(req.params?.id) },
                    { projection: { _id: 0, user_id: 1 } }
                )
            if (row?.user_id?.toHexString() !== tokenPackage?.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // update the exercise
            await db
                .collection('exercises')
                .updateOne(
                    { _id: new ObjectId(req.params?.id) },
                    { $set: { name: body?.name } }
                )
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        const output = {
            id: req.params?.id,
            name: body?.name,
        }

        res.status(200).send(output)
    }

    async deleteExercise(req: Request, res: Response) {
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
            // validate that this belongs to the user
            const row = await Database.instance.db
                .collection('exercises')
                .findOne(
                    { _id: new ObjectId(req.params?.id) },
                    { projection: { _id: 0, user_id: 1 } }
                )
            if (row?.user_id?.toHexString() !== tokenPackage?.id) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // delete sets
            const objId = new ObjectId(req.params?.id)
            await Database.instance.db
                .collection('sets')
                .deleteMany({ exercise_id: objId })

            // delete the exercise
            const result = await Database.instance.db
                .collection('exercises')
                .deleteOne({ _id: objId })
            if (result?.deletedCount < 1)
                throw Error('Failed to delete exercise')
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // format output
        res.status(200).send(new ServerMessage('1 row(s) deleted successfully'))
    }
}

interface ExerciseReqBody {
    name: string
}
