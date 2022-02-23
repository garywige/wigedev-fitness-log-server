import { Response, Request } from 'express'
import { BadRequestError, UnauthorizedError, InternalServerError } from './responses'

export class UserService {
    private static _instance: UserService

    private constructor(){
        console.log('UserService instantiated...')
    }

    static get instance() : UserService {
        if(!this._instance)
            this._instance = new UserService()

        return this._instance
    }

    async postSignin(req: Request, res: Response) {
        
        // validate request body
        const body = req.body as SigninReqBody
        if(!body?.email || !body?.password){
            res.status(400).send(BadRequestError)
            return
        }

        // create output object
        const output = {
            accessToken: 'asdf1234asdf1234'
        }

        res.status(200).send(JSON.stringify(output))
    }
}

interface SigninReqBody {
    email: string
    password: string
}