import {Request, Response } from 'express'

import { Db, ObjectId } from 'mongodb'
import { UserService, AccountType, SigninReqBody } from './userService'
import * as bcrypt from 'bcrypt'
import { stringify } from 'querystring'
import { TokenService } from './tokenService'
import { doesNotMatch } from 'assert'

describe('UserService', () => {
    let testSubject: UserService
    let req: Request
    let res: Response

    beforeEach(() => {
        // instantiate service
        UserService['_instance'] = null
        testSubject = UserService.instance
        testSubject['_db'] = <Db>{}

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
            testSubject.postSignin(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
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
            testSubject.postSignup(req, res).then(() => {
                expect(res.status).toHaveBeenCalledWith(400)
            })
        })
    })

    describe('verifyEmail()', () => {
        it('should call getEmailHash when provided a valid request body', () => {
            // Arrange
            const body = {
                email: 'test@test.com',
                hash: 'test',
            }
            req = jasmine.createSpyObj('Request', {}, { body: body })

            const spy = spyOn<any>(testSubject, 'getEmailHash').and.returnValue(
                'test2'
            )

            // Act
            testSubject.verifyEmail(req, res).then(() => {
                // Assert
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('upgrade()', () => {
        beforeEach(() => {
            spyOn<any>(
                testSubject['_tokenService'],
                'extractTokenPackage'
            ).and.returnValue(
                new Promise(resolve => {
                    resolve({
                        id: new ObjectId('621bd519c0a89c2c785bcbaa'),
                        email: 'test@test.com',
                        role: 'free',
                    })
                })
            )
            req = jasmine.createSpyObj('Request', {}, {
                headers: {
                    authorization: 'test'
                },
                body: {
                    type: 'month',
                    card: 'test',
                    name: {
                        first: 'test',
                        last: 'test'
                    },
                    address: {
                        line1: 'test',
                        city: 'test',
                        state: 'CA',
                        zip: '12345',
                        country: 'US'
                    }
                }
            })
        })
        it('should call SquareApi.createCustomer()', done => {
            const spy = spyOn<any>(testSubject['_squareApi'], 'createCustomer').and.returnValue(new Promise(resolve => {
                resolve({
                    customer: {
                        id: 'test'
                    }
                })
            }))

            spyOn<any>(testSubject['_squareApi'], 'createCard')
            
            testSubject.upgrade(req, res).then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })

        it('should call SquareApi.createCard()', done => {
            const spy = spyOn<any>(testSubject['_squareApi'], 'createCard').and.returnValue(new Promise(resolve => resolve(1)))
            spyOn<any>(testSubject['_squareApi'], 'createCustomer').and.returnValue({
                customer: {
                    id: 'test'
                }
            })

            spyOn<any>(testSubject['_squareApi'], 'createSubscription')
            
            testSubject.upgrade(req, res).then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })

        it('should call SquareApi.createSubscription()', done => {
            const spy = spyOn<any>(testSubject['_squareApi'], 'createSubscription')
            spyOn<any>(testSubject['_squareApi'], 'createCustomer').and.returnValue({
                customer: {
                    id: 'test'
                }
            })
            spyOn<any>(testSubject['_squareApi'], 'createCard').and.returnValue({
                card: {
                    id: 'test'
                }
            })

            testSubject.upgrade(req, res).then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })

        it('should call Db.collection()', done => {
            spyOn<any>(testSubject['_squareApi'], 'createCustomer').and.returnValue({
                customer: {
                    id: 'test'
                }
            })
            spyOn<any>(testSubject['_squareApi'], 'createCard').and.returnValue({
                card: {
                    id: 'test'
                }
            })
            spyOn<any>(testSubject['_squareApi'], 'createSubscription')
            testSubject['_db'] = jasmine.createSpyObj('Db', ['collection'])
            const spy = testSubject['_db'].collection

            testSubject.upgrade(req, res).then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })
    })

    describe('createUser()', () => {
        beforeEach(() => {
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
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    findOne: spy,
                })

            // Act
            testSubject['getRole']('test').then(() => {
                // Assert
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('getId()', () => {
        it('should call findOne()', () => {
            // Arrange
            const spy = jasmine.createSpy<any>('findOne')
            testSubject['_db'].collection = jasmine
                .createSpy<any>('collection', testSubject['_db'].collection)
                .and.returnValue({
                    findOne: spy,
                })

            // Act
            testSubject['getId']('test').then(() => {
                // Assert
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('getEmailHash()', () => {
        it('should call _db.collection()', () => {
            const spy = jasmine.createSpy<any>('collection').and.returnValue({
                findOne() {
                    return {
                        salt: bcrypt.genSaltSync(),
                    }
                },
            })
            testSubject['_db'].collection = spy

            testSubject['getEmailHash']('test').then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('emailVerified()', () => {
        it('should call _db.collection()', (done) => {
            const spy = jasmine.createSpy<any>('collection').and.returnValue({
                findOne() {
                    return {
                        emailVerified: true,
                    }
                },
            })
            testSubject['_db'].collection = spy

            testSubject['emailVerified']('test').then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })
    })

    describe('sendVerificationEmail()', () => {
        it('should call _sendGrid.send()', (done) => {
            const spy = spyOn<any>(testSubject['_sendGrid'], 'send')
            testSubject['getEmailHash'] = jasmine.createSpy()

            testSubject['sendVerificationEmail']('test').then(() => {
                expect(spy).toHaveBeenCalled()
                done()
            })
        })
    })
})
