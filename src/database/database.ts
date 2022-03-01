import { Db, MongoClient } from 'mongodb'

export class Database {
    private _client: MongoClient
    private static _instance: Database

    static get instance(): Database {
        if(!this._instance){
            this._instance = new Database()
        }

        return this._instance
    }

    get db() : Db {
        return this._client.db('wfl')
    }

    public connect(){
        setTimeout(() => {
            try {
                this._client = new MongoClient(process.env.CONNECTION_STRING)
                this._client.connect()
            } catch {
                console.log('Error: failed to connect to database.')
            }
        }, 1000)
    }
}