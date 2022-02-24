import { CycleService } from './cycleService'
import { Request, Response } from 'express'

describe('CycleService', () => {

    let testSubject: CycleService

    beforeAll(() => {
        testSubject = CycleService.instance
    })

    it('should be truthy', () => {
        expect(testSubject).toBeTruthy()
    })
})