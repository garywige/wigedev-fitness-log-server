import { MongoClient } from 'mongodb'

export class Database {
    readonly uri = 'mongodb://localhost:27017'
    private _client: MongoClient
    private static _instance: Database

    private constructor(){
        // instatiate instance
        this.connect()
    }

    static get instance(): Database {
        if(!this._instance){
            this._instance = new Database()
        }

        return this._instance
    }

    get client(): MongoClient {
        return this._client
    }

    private connect(){
        try {
            this._client = new MongoClient(this.uri)
        } catch {
            console.log('Error: failed to connect to database.')
        }
    }
}