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
}