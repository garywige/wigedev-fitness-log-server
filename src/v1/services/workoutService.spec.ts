import { Request, Response } from "express"
import { WorkoutService } from "./workoutService"

describe('WorkoutService', () => {

    let testSubject: WorkoutService
    let valid: Request
    let invalid: Request
    let res: Response

    beforeAll(() => {
        testSubject = WorkoutService.instance
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)
    })

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getWorkouts()', () => {
        beforeAll(() => {
            valid = jasmine.createSpyObj('Request', {}, {query: {cycle: 1}})
            invalid = jasmine.createSpyObj('Request', {}, {query: {invalid: 'test'}})
        })

        it('should set status 200 with valid query', () => {
            testSubject.getWorkouts(valid, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should set status 400 with invalid query', () => {
            testSubject.getWorkouts(invalid, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    describe('postWorkouts()', () => {
        it('should set status 201 with valid input', () => {
            valid = jasmine.createSpyObj('Request', {}, { body: { date: '11111111', sets: ['test', 'test']}})
            testSubject.postWorkouts(valid, res)
            expect(res.status).toHaveBeenCalledWith(201)
        })

        it('should set status 400 with invalid input', () => {
            invalid = jasmine.createSpyObj('Request', {}, { body: {date: '11111111', invalid: 'test'}})
            testSubject.postWorkouts(invalid, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })
})