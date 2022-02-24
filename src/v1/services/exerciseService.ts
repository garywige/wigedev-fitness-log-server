
export class ExerciseService {
    private static _instance: ExerciseService

    private constructor(){
        console.log('ExerciseService instantiating...')
    }

    static get instance() : ExerciseService {
        if(!this._instance){
            this._instance = new ExerciseService()
        }

        return this._instance
    }
}