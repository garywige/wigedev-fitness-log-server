
export class CycleService {
    private static _instance: CycleService

    private constructor(){
        console.log('CycleService instantiated...')
    }

    static get instance() : CycleService {
        if(!this._instance){
            this._instance = new CycleService()
        }

        return this._instance
    }
}