import { SquareApi } from './squareApi'

describe('SquareApi', () => {
    let service: SquareApi

    beforeEach(() => {
        service = new SquareApi()
    })

    it('should be truthy', () => {
        expect(service).toBeTruthy()
    })

    describe('request()', () => {
        it('should return server response', () => {
            service['request']<any>('www.google.com', '', 'GET').then(
                (response) => {
                    expect(response).toBeTruthy()
                }
            )
        })

        it('should call httpRequest()', () => {
            const spy = spyOn<any>(service, 'httpRequest')
            service['request']<any>('www.google.com', '', 'GET').then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('createCustomer()', () => {
        it('should call request()', () => {
            const spy = spyOn<any>(service, 'request')
            service['createCustomer']('test', 'test', 'test@test.com').then(
                () => {
                    expect(spy).toHaveBeenCalled()
                }
            )
        })
    })

    describe('createCard()', () => {
        it('should call request()', () => {
            const spy = spyOn<any>(service, 'request')
            service['createCard'](
                'test',
                'test',
                '',
                'test',
                'test',
                'test',
                'test',
                'test',
                'test'
            ).then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })

    describe('createSubscription()', () => {
        it('should call request()', () => {
            const spy = spyOn<any>(service, 'request')
            service['createSubscription']('month', 'test', 'test').then(() => {
                expect(spy).toHaveBeenCalled()
            })
        })
    })
})
