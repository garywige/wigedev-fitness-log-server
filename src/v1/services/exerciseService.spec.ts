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
})