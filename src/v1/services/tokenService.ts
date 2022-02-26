import * as jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export class TokenService {
    private static _instance: TokenService

    private constructor(){
        console.log('TokenService instantiated...')
    }

    static get instance(){
        if(!this._instance){
            this._instance = new TokenService()
        }

        return this._instance
    }

    async generateToken(id: ObjectId, email: string, role: string): Promise<string> {
        const payload: TokenPackage = {
            id: id,
            email: email,
            role: role
        }

        return jwt.sign(payload, process.env['JWT_SECRET'] ?? '', {
            expiresIn: '1d'
        })
    }

    async extractTokenPackage(authHeader: string): Promise<TokenPackage | null> {

        try {
            const token = authHeader?.split(' ')[1] ?? ''
            return jwt.verify(token, process.env['JWT_SECRET'] ?? '') as TokenPackage
        } catch {
            return null
        }

    }
}

export interface TokenPackage {
    id: ObjectId
    email: string
    role: string
}