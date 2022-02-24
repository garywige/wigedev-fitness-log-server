import { Request, Response } from "express"
import { ExerciseService } from "./exerciseService"

describe('ExerciseService', () => {

    let testSubject: ExerciseService
    let req: Request
    let res: Response

    beforeAll(() => {
        testSubject = ExerciseService.instance
    })

    beforeEach(() => {
        // create mock response
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)
    })

    it('should create', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getExercises()', () => {
    
        it('should set status 200', () => {
            testSubject.getExercises(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

    describe('postExercises()', () => {
        it('should set status 201 with valid input', () => {
            req = jasmine.createSpyObj('Request', {}, { body: { name: 'test'}})
            testSubject.postExercises(req, res)
            expect(res.status).toHaveBeenCalledWith(201)
        })

        it('should set status 400 with invalid input', () => {
            req = jasmine.createSpyObj('Request', {}, { body: { invalid: 'test'}})
            testSubject.postExercises(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })
})