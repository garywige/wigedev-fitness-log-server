import * as bcrypt from 'bcrypt'

import {
    BadRequestError,
    InternalServerError,
    UnauthorizedError,
} from './responses'
import { Db, ObjectId } from 'mongodb'
import { Request, Response } from 'express'

import { Database } from '../../database/database'
import { TokenService } from './tokenService'

export class UserService {
    private static _instance: UserService
    private _db: Db
    private _freeExercises = [
        'Squat',
        'Bench Press',
        'Deadlift',
        'Overhead Press',
        'Power Clean',
        'Barbell Row',
    ]

    private constructor() {
        try {
            this._db = Database.instance?.db
        } catch {
            console.log(
                'UserService: Failed to connect to database. This is only acceptable for testing.'
            )
        }
    }

    static get instance(): UserService {
        if (!this._instance) this._instance = new UserService()

        return this._instance
    }

    async postSignin(req: Request, res: Response) {
        // validate request body
        const body = req.body as SigninReqBody
        if (!body?.email || !body?.password) {
            res.status(400).send(BadRequestError)
            return
        }

        let token = ''
        try {
            // compare credentials with db user and check for email verification
            if (!(await this.compareCredentials(body)) || !(await this.emailVerified(body.email))) {
                res.status(401).send(UnauthorizedError)
                return
            }

            // get userId
            const id = await this.getId(body?.email)

            // determine role
            const role = await this.getRole(body?.email)

            // generate token
            token = await TokenService.instance.generateToken(
                id,
                body?.email,
                role
            )
        } catch {
            // handle
            res.status(500).send(InternalServerError)
            return
        }

        // create output object
        const output = {
            accessToken: token,
        }

        res.status(200).send(JSON.stringify(output))
    }

    async postSignup(req: Request, res: Response) {
        // validate request body
        const body = req.body as SignupReqBody
        if (!body?.email || !body?.password || !body?.accountType) {
            res.status(400).send(BadRequestError)
            return
        }

        try {
            // create new user account
            if ((await this.createUser(body)) === false) {
                res.status(500).send(InternalServerError)
                return
            }

            // create free cycle
            const user = await this._db
                .collection('users')
                .findOne({ email: body.email })
            await this._db
                .collection('cycles')
                .insertOne({ name: 'Free', user_id: user?._id })

            // create free exercises
            this._freeExercises.forEach((exercise) => {
                this._db
                    .collection('exercises')
                    .insertOne({ name: exercise, user_id: user?._id })
            })

            // initiate email verification depending on accountType
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        // create output object
        const output = {
            email: body?.email,
        }

        res.status(201).send(output)
    }

    async verifyEmail(req: Request, res: Response) {
        // validate request body
        const body = req.body as VerifyReqBody
        if(!body?.email || !body?.hash){
            res.status(400).send(BadRequestError)
            return
        }

        let isVerified = true
        try {
            // generate salted hash of email address
            const hash = await this.getEmailHash(body.email)

            // compare hash with provided input
            if(body.hash !== hash){
                isVerified = false
            }
            else {
                // set email verified to true in DB
                await this._db.collection('users').updateOne({ email: body.email}, { $set: { emailVerified: true }})
            }

        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send({
            email: body.email,
            verified: isVerified
        })
    }

    private async createUser(body: SignupReqBody): Promise<boolean> {
        return new Promise((resolve) =>
            bcrypt.genSalt().then((salt) => {
                bcrypt.hash(body?.password, salt).then(
                    (hash) => {
                        this._db
                            .collection('users')
                            .countDocuments({ email: body?.email })
                            .then((count) => {
                                if (count > 0) {
                                    return resolve(false)
                                }

                                this._db
                                    .collection('users')
                                    .insertOne({
                                        email: body?.email.toLowerCase(),
                                        hash: hash,
                                        salt: salt,
                                        role: 'free',
                                        created: new Date(),
                                        emailVerified: false,
                                    })
                                    .then(() => {
                                        resolve(true)
                                    })
                            })
                    },
                    (reason) => console.log(`hash rejected: ${reason}`)
                )
            })
        )
    }

    private async compareCredentials(body: SigninReqBody): Promise<boolean> {
        const account = await this._db
            .collection('users')
            .findOne(
                { email: body?.email.toLowerCase() },
                { projection: { _id: 0, hash: 1, salt: 1 } }
            )

        // account doesn't exist?
        if (!account) return false

        const hash = await bcrypt.hash(body?.password, account?.salt)
        return hash === account?.hash
    }

    private async getRole(email: string): Promise<AccountType> {
        const row = await this._db
            .collection('users')
            .findOne({ email: email }, { projection: { _id: 0, role: 1 } })
        return row?.role as AccountType
    }

    private async getId(email: string): Promise<ObjectId> {
        const row = await this._db
            .collection('users')
            .findOne({ email: email }, { projection: { _id: 1 } })
        return row?._id
    }

    private async getEmailHash(email: string): Promise<string> {
        const user = await this._db.collection('users').findOne({ email: email}, { projection: { _id: 0, salt: 1}})
        return await bcrypt.hash(email, user?.salt)
    }

    private async emailVerified(email: string): Promise<boolean> {
        const user = await this._db.collection('users').findOne({ email: email}, {projection: { _id: 0, emailVerified: 1}})
        return user?.emailVerified
    }
}

export interface SigninReqBody {
    email: string
    password: string
}

export enum AccountType {
    Free = 'free',
    Pro = 'pro',
}

interface SignupReqBody {
    email: string
    password: string
    accountType: AccountType
}

interface VerifyReqBody {
    email: string
    hash: string
}