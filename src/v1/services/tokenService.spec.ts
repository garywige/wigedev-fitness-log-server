import { ObjectId } from "mongodb"
import { TokenService } from "./tokenService"

describe('TokenService', () => {

    let testSubject: TokenService

    beforeEach(() => {
        testSubject = TokenService.instance
    })

    describe('generateToken()', () => {
        
        it('should return a non-empty string', () => {

            // Act
            testSubject.generateToken(new ObjectId('621bd519c0a89c2c785bcbaa'), 'test', 'test').then((result: string) => {

                // Assert
                expect(result?.length).toBeGreaterThan(0)
            })
        })
    })
})