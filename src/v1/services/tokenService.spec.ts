import { ObjectId } from 'mongodb'
import { TokenService } from './tokenService'

describe('TokenService', () => {
    let testSubject: TokenService

    beforeEach(() => {
        testSubject = TokenService.instance
    })

    describe('generateToken()', () => {
        it('should return a non-empty string', () => {
            // Act
            testSubject
                .generateToken(
                    new ObjectId('621bd519c0a89c2c785bcbaa'),
                    'test',
                    'test'
                )
                .then((result: string) => {
                    // Assert
                    expect(result?.length).toBeGreaterThan(0)
                })
        })
    })

    describe('extractTokenPackage()', () => {
        it('should return extracted token package when provided valid auth header', () => {
            // Arrange
            testSubject
                .generateToken(
                    new ObjectId('621bd519c0a89c2c785bcbaa'),
                    'test',
                    'test'
                )
                .then((token) => {
                    const authHeader = `Bearer ${token}`

                    // Act
                    testSubject
                        .extractTokenPackage(authHeader)
                        .then((result) => {
                            // Assert
                            expect(result?.email).toEqual('test')
                        })
                })
        })
    })
})
