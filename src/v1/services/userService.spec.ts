import { UserService } from './userService'
import { Request, Response } from 'express'

describe('UserService', () => {
    let testSubject: UserService
    let req: Request
    let res: Response

    beforeAll(() => {
        testSubject = UserService.instance
    })

    beforeEach(() => {
        // create mock response
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)
    })

    it('should create', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('postSignIn()', () => {
        it('should call status with 200 when request body is valid', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { email: 'test@test.com', password: 'password' } }
            )
            testSubject.postSignin(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should call status with 400 when request body is invalid', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { email: 'test@test.com', bad: 'test' } }
            )
            testSubject.postSignin(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })

    describe('postSignup()', () => {
        it('should call status with 201 when request body is valid', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                {
                    body: {
                        email: 'test@test.com',
                        password: 'password',
                        accountType: 'free',
                    },
                }
            )
            testSubject.postSignup(req, res)
            expect(res.status).toHaveBeenCalledWith(201)
        })

        it('should call status with 400 when request body is invalid', () => {
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { email: 'test@test.com', bad: 'test' } }
            )
            testSubject.postSignup(req, res)
            expect(res.status).toHaveBeenCalledWith(400)
        })
    })
})
