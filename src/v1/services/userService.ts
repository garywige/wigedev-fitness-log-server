import { Response, Request } from 'express'

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
        
        const output = {
            accessToken: 'asdf1234asdf1234'
        }

        res.status(200).send(JSON.stringify(output))
    }
}