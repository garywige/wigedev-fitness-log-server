import { UserService } from "./userService";
import { Request, Response} from 'express'

describe('UserService', () => {

    let testSubject: UserService

    beforeAll(() => {
        testSubject = UserService.instance
    })

    it('should create', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('postSignIn()', () => {

        let req: Request
        let res: Response

        beforeEach(async () => {

            // create mock response
            res = jasmine.createSpyObj('Response', ['send', 'status'])
            res.status = jasmine.createSpy().and.returnValue(res)
        })

        it('should call status with 200 when request body is valid', () => {
            req = jasmine.createSpyObj('Request', {}, { body: { email: 'test@test.com', password: 'password'}})
            testSubject.postSignin(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should call status with 400 when request body is invalid', () => {
            req = jasmine.createSpyObj('Request', {}, { body: { email: 'test@test.com', bad: 'test'}})
            testSubject.postSignin(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

})