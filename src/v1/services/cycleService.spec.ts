import { CycleService } from './cycleService'
import { Request, Response } from 'express'
import { ObjectId} from 'mongodb'

describe('CycleService', () => {
    let testSubject: CycleService
    let req: Request
    let res: Response

    beforeAll(() => {
        testSubject = CycleService.instance
    })

    beforeEach(() => {
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

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getCycles()', () => {

        it('should set response status to 200 when called', () => {

            req = jasmine.createSpyObj('Request', [''])

            testSubject.getCycles(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })
    })

    describe('postCycles()', () => {

        it('should set response status to 201 when called with valid input', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { name: 'test' } }
            )

            testSubject.postCycles(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(201)
            })
        })

        it('should set response status to 400 when called with invalid input', () => {

            req = jasmine.createSpyObj('Request', {}, { body: { bad: 'test' } })

            testSubject.postCycles(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })

    describe('getCycleFromId()', () => {

        it('should set response status to 200 when called with valid input', () => {

            req = jasmine.createSpyObj('Request', {}, { params: { id: 1 } })

            testSubject.getCycleFromId(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })

        it('should set response status to 400 when called with invalid input', () => {

            req = jasmine.createSpyObj('Request', {}, { params: { bad: 1 } })

            testSubject.getCycleFromId(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })

    describe('putCycleFromId()', () => {

        it('should set response status to 200 when called with valid input', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                {
                    body: { name: 'test' },
                    params: { id: 1 },
                }
            )

            testSubject.putCycleFromId(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })

        it('should set response status to 400 when called with invalid request body', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                {
                    body: { invalid: 'test' },
                    params: { id: 1 },
                }
            )

            testSubject.putCycleFromId(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })

        it('should set response status to 400 when called with invalid parameter', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                {
                    body: { name: 'test' },
                    params: { invalid: 1 },
                }
            )

            testSubject.putCycleFromId(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })

    describe('deleteCycle()', () => {

        it('should set response status to 200 with valid parameter', () => {

            req = jasmine.createSpyObj('Request', {}, { params: { id: 1 } })

            testSubject.deleteCycle(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(200)
            })
        })

        it('should set response status to 400 with invalid parameter', () => {

            req = jasmine.createSpyObj(
                'Request',
                {},
                { params: { invalid: 1 } }
            )

            testSubject.deleteCycle(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })
})
