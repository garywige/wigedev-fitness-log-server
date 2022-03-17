import { Request, Response } from 'express'

import { Db, ObjectId } from 'mongodb'
import { UserService, AccountType, SigninReqBody } from './userService'
import * as bcrypt from 'bcrypt'

describe('UserService', () => {
    let testSubject: UserService
    let req: Request
    let res: Response

    beforeEach(() => {
        // instantiate service
        testSubject = UserService.instance

        // create mock response
        res = jasmine.createSpyObj('Response', ['send', 'status'])
        res.status = jasmine.createSpy().and.returnValue(res)
    })

    it('should create', () => {
        expect(testSubject).toBeTruthy()
    })

    describe('postSignin()', () => {
        it('should call status with 200 when request body is valid', () => {
            // Arrange
            req = jasmine.createSpyObj(
                'Request',
                {},
                { body: { email: 'test@test.com', password: 'password' } }
            )

            spyOn<any>(testSubject, 'compareCredentials').and.returnValue(
                new Promise(() => true)
            )
            spyOn<any>(testSubject, 'getId').and.returnValue(
                new Promise(() => new ObjectId(1))
            )
            spyOn<any>(testSubject, 'getRole').and.returnValue(
                new Promise(() => 'free')
            )

            // Act
            testSubject.postSignin(req, res).then(() => {
                // Assert
                expect(res.status).toHaveBeenCalledWith(200)
            })
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
            // Arrange
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

            spyOn<any>(testSubject, 'createUser').and.returnValue(true)

            testSubject['_db'] = <Db>{}
            testSubject['_db'].collection = jasmine
                .createSpy()
                .and.returnValue({
                    findOne() {
                        return {
                            _id: 'test',
                        }
                    },
                    insertOne() {},
                })
            testSubject['sendVerificationEmail'] = jasmine.createSpy()

            // Act
            testSubject.postSignup(req, res).then(() => {
                // Assert
                expect(res.status).toHaveBeenCalledWith(201)
            })
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

    describe('verifyEmail()', () => {
        it('should call getEmailHash when provided a valid request body', () => {
            // Arrange
            const body = {
                email: 'test@test.com',
                hash: 'test'
            }
            req = jasmine.createSpyObj('Request', {}, { body: body})

            const spy = spyOn<any>(testSubject, 'getEmailHash').and.returnValue('test2')

            // Act
            testSubject.verifyEmail(req, res).then(() => {

                // Assert
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('createUser()', () => {
        beforeEach(() => {
            testSubject['_db'] = <Db>{}
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    countDocuments(filter: any): Promise<number> {
                        return Promise.resolve(filter?.email === 'test' ? 1 : 0)
                    },
                    insertOne() {
                        return new Promise((resolve) => resolve(true))
                    },
                })
        })

        it('should return false when providing an existing email address', (done) => {
            // Arrange
            const body = {
                email: 'test',
                password: 'test',
                accountType: AccountType.Free,
            }

            // Act
            testSubject['createUser'](body).then((result) => {
                // Assert
                expect(result).toEqual(false)
                done()
            })
        })

        it("should return true when provided email address doesn't exist in the users collection", (done) => {
            // Arrange
            const body = {
                email: 'not same test :P',
                password: 'password',
                accountType: AccountType.Free,
            }

            // Act
            testSubject['createUser'](body).then((result) => {
                // Assert
                expect(result).toEqual(true)
                done()
            })
        })
    })

    describe('compareCredentials()', () => {
        let body: SigninReqBody

        beforeEach(() => {
            // Arrange
            const salt = bcrypt.genSaltSync()

            testSubject['_db'] = <Db>{}
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    findOne() {
                        return new Promise((resolve, reject) => {
                            resolve({
                                salt: salt,
                                hash: bcrypt.hashSync('test', salt),
                            })
                        })
                    },
                })

            body = {
                email: 'test',
                password: 'test',
            }
        })

        it('should return true when password hash matches', () => {
            // Act
            testSubject['compareCredentials'](body).then((result) => {
                // Assert
                expect(result).toEqual(true)
            })
        })

        it('should return false when password hash matches', () => {
            // Arrange
            body.password = 'different password'

            // Act
            testSubject['compareCredentials'](body).then((result) => {
                // Assert
                expect(result).toEqual(false)
            })
        })
    })

    describe('getRole()', () => {
        it('should call findOne()', () => {
            // Arrange
            const spy = jasmine.createSpy<any>('findOne')
            testSubject['_db'] = <Db>{}
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    findOne: spy,
                })

            // Act
            testSubject['getRole']('test')

            // Assert
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('getId()', () => {
        it('should call findOne()', () => {
            // Arrange
            const spy = jasmine.createSpy<any>('findOne')
            testSubject['_db'] = <Db>{}
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    findOne: spy,
                })

            // Act
            testSubject['getId']('test')

            // Assert
            expect(spy).toHaveBeenCalled()
        })
    })

    describe('getEmailHash()', () => {
        it('should call _db.collection()', () => {
            const spy = jasmine.createSpy<any>('collection').and.returnValue({
                findOne(){
                    return {
                        salt: 'test'
                    }
                }
            })

            testSubject['getEmailHash']('test').then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('emailVerified()', () => {
        it('should call _db.collection()', () => {
            const spy = jasmine.createSpy<any>('collection').and.returnValue({
                findOne(){
                    return {
                        emailVerified: true
                    }
                }
            })

            testSubject['emailVerified']('test').then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })
})
