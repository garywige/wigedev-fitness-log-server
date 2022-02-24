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

            // create mock request
            req = jasmine.createSpyObj('Request', {}, { body: { email: 'test@test.com', password: 'password'}})

            // create mock response
            res = jasmine.createSpyObj('Response', ['send', 'status'])
            res.status = jasmine.createSpy().and.returnValue(res)

            // call the method
            await testSubject.postSignin(req, res)
        })

        it('should call status with 200 when request is valid', () => {
            expect(res.status).toHaveBeenCalledWith(200)
        })
    })

})