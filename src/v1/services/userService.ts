import { Response, Request } from 'express'
import { Database } from '../../database/database'
import { BadRequestError, InternalServerError } from './responses'
import * as bcrypt from 'bcrypt'

export class UserService {
    private static _instance: UserService

    private constructor() {
        console.log('UserService instantiated...')
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

        try {
            // business logic
        } catch {
            // handle
            res.status(500).send(InternalServerError)
            return
        }

        // create output object
        const output = {
            accessToken: 'asdf1234asdf1234',
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
            await this.createUser(body)

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

    private async createUser(body: SignupReqBody){
        const salt = await bcrypt.genSalt()
            const hash = await bcrypt.hash(body?.password, salt)
            const db = Database.instance.db
            db.collection('users').insertOne({
                email: body?.email,
                hash: hash,
                salt: salt,
                role: 'free',
                created: new Date(),
                emailVerified: false
            })
    }
}

interface SigninReqBody {
    email: string
    password: string
}

enum AccountType {
    Free = 'free',
    Pro = 'pro',
}

interface SignupReqBody {
    email: string
    password: string
    accountType: AccountType
}
