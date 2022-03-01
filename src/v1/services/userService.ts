import { Response, Request } from 'express'
import { Database } from '../../database/database'
import { BadRequestError, InternalServerError, UnauthorizedError } from './responses'
import * as bcrypt from 'bcrypt'
import { TokenService } from './tokenService'
import { Db, ObjectId } from 'mongodb'

export class UserService {
    private static _instance: UserService
    private _db: Db

    private constructor(){
        this._db = Database.instance.db
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
            // compare credentials with db user
            if(! await this.compareCredentials(body)){
                res.status(401).send(UnauthorizedError)
                return
            }

            // get userId
            const id = await this.getId(body?.email)

            // determine role
            const role = await this.getRole(body?.email)

            // generate token
            token = await TokenService.instance.generateToken(id, body?.email, role)

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

            // validate that the account doesn't already exist
            if(await this._db.collection('users').findOne({ email: body?.email}))
                throw Error('account already exists with this email address.')

            this._db.collection('users').insertOne({
                email: body?.email.toLowerCase(),
                hash: hash,
                salt: salt,
                role: 'free',
                created: new Date(),
                emailVerified: false
            })
    }

    private async compareCredentials(body: SigninReqBody): Promise<boolean> {
        const account = await this._db.collection('users').findOne({ email: body?.email.toLowerCase()}, { projection: { _id: 0, hash: 1, salt: 1}})
        
        // account doesn't exist?
        if(!account) return false

        const hash = await bcrypt.hash(body?.password, account?.salt)
        return hash === account?.hash
    }

    private async getRole(email: string) : Promise<AccountType> {
        const row = await this._db.collection('users').findOne({ email: email}, { projection: { _id: 0, role: 1}})
        return row?.role as AccountType
    }

    private async getId(email: string) : Promise<ObjectId> {
        const row =  await this._db.collection('users').findOne({email: email}, {projection: {_id: 1}})
        return row?._id
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
