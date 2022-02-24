
export class WorkoutService {
    private static _instance: WorkoutService

    private constructor(){
        console.log('WorkoutService instantiated...')
    }

    static get instance() : WorkoutService {
        if(!this._instance){
            this._instance = new WorkoutService()
        }

        return this._instance
    }
}