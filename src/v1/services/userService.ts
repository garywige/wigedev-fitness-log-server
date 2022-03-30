import * as bcrypt from 'bcrypt'
import * as https from 'https'

import {
    BadRequestError,
    InternalServerError,
    UnauthorizedError,
} from './responses'
import { Db, ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { TokenPackage, TokenService } from './tokenService'

import { Database } from '../../database/database'
import { MailService } from '@sendgrid/mail'

export class UserService {
    private static _instance: UserService
    private _db: Db
    private _tokenService: TokenService
    private _freeExercises = [
        'Squat',
        'Bench Press',
        'Deadlift',
        'Overhead Press',
        'Power Clean',
        'Barbell Row',
    ]

    private _sendGrid: MailService

    private constructor() {
        try {
            this._tokenService = TokenService.instance
            this._sendGrid = new MailService()
            this._sendGrid.setApiKey(process.env['SENDGRID_API_KEY'])
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
            if (
                !(await this.compareCredentials(body)) ||
                !(await this.emailVerified(body.email))
            ) {
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
            await this.sendVerificationEmail(body.email)
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
        if (!body?.email || !body?.hash) {
            res.status(400).send(BadRequestError)
            return
        }

        let isVerified = true
        try {
            // generate salted hash of email address
            const hash = await this.getEmailHash(body.email)

            // compare hash with provided input
            if (body.hash !== hash) {
                isVerified = false
            } else {
                // set email verified to true in DB
                await this._db
                    .collection('users')
                    .updateOne(
                        { email: body.email },
                        { $set: { emailVerified: true } }
                    )
            }
        } catch {
            res.status(500).send(InternalServerError)
            return
        }

        res.status(200).send({
            email: body.email,
            verified: isVerified,
        })
    }

    async upgrade(req: Request, res: Response){
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

        // Validate request body
        const body = req?.body as UpgradeReqBody
        if(!body?.type || !body?.card || !body?.name || !body?.address) {
            res.status(400).send(BadRequestError)
            return
        }

        const output = {
            email: tokenPackage?.email,
            paidThrough: new Date()
        }
        try {

            this.postSquare('/v2/customers', {
                family_name: body.name?.last,
                given_name: body.name?.first,
                idempotency_key: await this.getEmailHash(tokenPackage.email),
                email_address: tokenPackage.email
            }, customerData => {
                this.postSquare('/v2/cards', {
                    idempotency_key: new Date().toISOString(),
                    source_id: body.card,
                    card: {
                        billing_address: {
                            address_line_1: body.address.line1,
                            address_line_2: body.address.line2,
                            locality: body.address.city,
                            administrative_district_level_1: body.address.state,
                            postal_code: body.address.zip,
                            country: body.address.country
                        },
                        cardholder_name: `${body.name.first} ${body.name.last}`,
                        customer_id: customerData?.customer?.id
                    }
                }, cardData => {
                    this.postSquare('/v2/subscriptions', {
                        idempotency_key: tokenPackage.email,
                        location_id: process.env['SQUARE_LOCATION_ID'],
                        plan_id: body.type === 'month' 
                            ? process.env['SQUARE_PLAN_MONTH'] 
                            : process.env['SQUARE_PLAN_YEAR'],
                        customer_id: customerData?.customer?.id,
                        card_id: cardData?.card?.id
                    }, subscriptionData => {
                        if(subscriptionData?.subscription?.status !== 'ACTIVE'){
                            throw new Error('Subscription status is not active.')
                        }

                        // upgrade account to pro
                        // set paidThrough appropriately
                        if(body.type === 'month'){
                            output.paidThrough.setMonth(output.paidThrough.getMonth() + 1)
                        } 
                        else {
                            output.paidThrough.setFullYear(output.paidThrough.getFullYear() + 1)
                        }
                        this._db.collection('users').updateOne({ email: tokenPackage.email}, 
                            {$set: { role: 'pro', paidThrough: output.paidThrough}})


                        // success
                        res.status(200).send(output)
                    })
                })
            })
        }
        catch {
            res.status(500).send(InternalServerError)
            return
        }
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
        const user = await this._db
            .collection('users')
            .findOne({ email: email }, { projection: { _id: 0, salt: 1 } })
        return await bcrypt.hash(email, user?.salt)
    }

    private async emailVerified(email: string): Promise<boolean> {
        const user = await this._db
            .collection('users')
            .findOne(
                { email: email },
                { projection: { _id: 0, emailVerified: 1 } }
            )
        return user?.emailVerified
    }

    private async sendVerificationEmail(email: string): Promise<void> {
        const hash = await this.getEmailHash(email)
        const url = `${process.env['FRONTEND_URL']}/verify/${email}?hash=${hash}`

        const message = {
            to: email,
            from: 'noreply@wige-dev.com',
            subject: 'WFL: Verify Your Email Address',
            html: `
            <p>Please click the link below to verify your email address. You will not be able to login to your WFL account until your email address is verified.</p>
            <br>
            <a href="${url}">Verify Email</a>`,
        }

        await this._sendGrid.send(message)
    }

    private postSquare(apiPath: string, reqBody: any, onEnd: (data: any) => void) {
        const req = https.request({
            host: process.env['SQUARE_API_URL'],
            path: apiPath,
            method: 'POST',
            headers: {
                'Square-Version': '2022-03-16',
                'Authorization': `Bearer ${process.env['SQUARE_ACCESS_TOKEN']}`,
                'Content-Type': 'application/json'
            }
        }, res => {

            // set subscription response
            const chunks = []
            res.setEncoding('utf8')
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                const data = JSON.parse(chunks.join())
                
                try {
                    onEnd(data)
                }
                catch (err) {
                    console.log(err)
                }
            })
        })

        req.write(JSON.stringify(reqBody))

        req.end()
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

interface UpgradeReqBody {
    type: string
    card: string
    name: {
        first: string,
        last: string
    }
    address: {
        line1: string
        line2?: string
        city: string
        state: string
        zip: string
        country: string
    }
}
