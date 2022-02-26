import { Db, MongoClient } from 'mongodb'

export class Database {
    readonly uri = process.env['CONNECTION_STRING'] ?? ''
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

    get db() : Db {
        return this._client.db('wfl')
    }

    private async connect(){
        try {
            this._client = new MongoClient(this.uri)
            await this._client.connect()
        } catch {
            console.log('Error: failed to connect to database.')
        }
    }
}