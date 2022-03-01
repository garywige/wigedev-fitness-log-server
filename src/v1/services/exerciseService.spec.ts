import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ExerciseService } from './exerciseService'

describe('ExerciseService', () => {
    let testSubject: ExerciseService
    let req: Request
    let res: Response

    beforeEach(() => {
        // create instance
        testSubject = ExerciseService.instance

        // create mock response
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)

        // spy on tokenService
        spyOn<any>(testSubject['_tokenService'], 'extractTokenPackage').and.returnValue(new Promise(() => { return {
            id: new ObjectId('621bd519c0a89c2c785bcbaa'),
            email: 'test@test.com',
            role: 'free'
        }}))
    })

    it('should create', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getExercises()', () => {

        it('should set status 200', () => {

            // Act
            testSubject.getExercises(req, res).then(() => {

                // Assert
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })
    })

    describe('postExercises()', () => {

        it('should set status 201 with valid input', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { name: 'test' } }
            )

            testSubject.postExercises(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(201)
            })
        })

        it('should set status 400 with invalid input', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { invalid: 'test' } }
            )

            testSubject.postExercises(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })

    describe('getExerciseFromId()', () => {
        it('should set status 200 with valid input', () => {
            req = jasmine.createSpyObj('Request', {}, { params: { id: 1 } })
            testSubject.getExerciseFromId(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should set status 400 with invalid input', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { params: { invalid: 'test' } }
            )
            testSubject.getExerciseFromId(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    describe('putExercise()', () => {
        it('should set status 200 with valid input', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { name: 'test' }, params: { id: 1 } }
            )
            testSubject.putExercise(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should set status 400 with invalid req body', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { invalid: 'test' }, params: { id: 1 } }
            )
            testSubject.putExercise(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })

        it('should set status 400 with invalid param', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { name: 'test' }, params: { invalid: 'test' } }
            )
            testSubject.putExercise(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    describe('deleteExercise()', () => {
        it('should set status 200 with valid input', () => {
            req = jasmine.createSpyObj('Request', {}, { params: { id: 1 } })
            testSubject.deleteExercise(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should set status 400 with invalid input', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { params: { invalid: 'test' } }
            )
            testSubject.deleteExercise(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })
})
