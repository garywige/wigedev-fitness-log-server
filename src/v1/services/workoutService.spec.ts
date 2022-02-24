import { Request, Response } from "express"
import { WorkoutService } from "./workoutService"

describe('WorkoutService', () => {

    let testSubject: WorkoutService
    let req: Request
    let res: Response

    beforeAll(() => {
        testSubject = WorkoutService.instance
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)
    })

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })
})