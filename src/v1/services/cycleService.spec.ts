import { CycleService } from './cycleService'
import { Request, Response } from 'express'

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
    })

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('getCycles()', () => {
        it('should set response status to 200 when called', () => {
            req = jasmine.createSpyObj('Request', [''])
            testSubject.getCycles(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })
})