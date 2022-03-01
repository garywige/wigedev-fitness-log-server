import { Request, Response } from 'express'
import { WorkoutService } from './workoutService'
import { ObjectId } from 'mongodb'

describe('WorkoutService', () => {
    let testSubject: WorkoutService
    let valid: Request
    let invalid: Request
    let res: Response

    beforeAll(() => {
        testSubject = WorkoutService.instance
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)

        // spy on tokenService
        spyOn<any>(testSubject['_tokenService'], 'extractTokenPackage').and.returnValue(new Promise(() => { return {
            id: new ObjectId('621bd519c0a89c2c785bcbaa'),
            email: 'test@test.com',
            role: 'free'
        }}))
    })

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getWorkouts()', () => {
        beforeAll(() => {
            valid = jasmine.createSpyObj('Request', {}, { query: { cycle: 1 } })
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { query: { invalid: 'test' } }
            )
        })

        it('should set status 200 with valid query', () => {
            testSubject.getWorkouts(valid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(200)
            )
        })

        it('should set status 400 with invalid query', () => {
            testSubject.getWorkouts(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })
    })

    describe('postWorkouts()', () => {
        it('should set status 201 with valid input', () => {
            valid = jasmine.createSpyObj(
                'Request',
                {},
                { body: { date: '11111111', sets: ['test', 'test'] } }
            )
            testSubject.postWorkouts(valid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(201)
            )
        })

        it('should set status 400 with invalid input', () => {
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { body: { date: '11111111', invalid: 'test' } }
            )
            testSubject.postWorkouts(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })
    })

    describe('getWorkoutFromDate()', () => {
        it('should set status 200 with valid param', () => {
            valid = jasmine.createSpyObj(
                'Request',
                {},
                { params: { date: '11111111' } }
            )
            testSubject.getWorkoutFromDate(valid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(200)
            )
        })

        it('should set status 400 with invalid param', () => {
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { params: { invalid: 'test' } }
            )
            testSubject.getWorkoutFromDate(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })
    })

    describe('putWorkout()', () => {
        it('should set status 200 with valid input', () => {
            valid = jasmine.createSpyObj(
                'Request',
                {},
                { body: { sets: ['test'] }, params: { date: '11111111' } }
            )
            testSubject.putWorkout(valid, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })

        it('should set status 400 with invalid param', () => {
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { body: { sets: ['test'] }, params: { invalid: 'test' } }
            )
            testSubject.putWorkout(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })

        it('should set status 400 with invalid req body', () => {
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { body: { invalid: 'test' }, params: { date: '11111111' } }
            )
            testSubject.putWorkout(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })
    })

    describe('deleteWorkout()', () => {
        it('should set status 200 with valid input', () => {
            valid = jasmine.createSpyObj(
                'Request',
                {},
                { params: { date: '11111111' } }
            )
            testSubject.deleteWorkout(valid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(200)
            )
        })

        it('should set status 400 with invalid input', () => {
            invalid = jasmine.createSpyObj(
                'Request',
                {},
                { params: { invalid: 'test' } }
            )
            testSubject.deleteWorkout(invalid, res).then(() => 
                expect(res.status).toHaveBeenCalledWith(400)
            )
        })
    })
})
