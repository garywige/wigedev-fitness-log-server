import { SquareApi } from './squareApi'

describe('SquareApi', () => {

    let service: SquareApi

    beforeEach(() => {
        service = new SquareApi()
    })

    it('should be truthy', () => {
        expect(service).toBeTruthy()
    })
})