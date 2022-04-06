import * as http from 'http'

export class SquareApi {

    private httpRequest = http.request

    private request<T>(host: string, path: string, method: string, headers?: any, body?: any) : Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const req = this.httpRequest({
                host: host,
                path: path,
                method: method,
                headers: headers
            }, res => {
                const chunks = []
                res.setEncoding('utf8')
                res.on('data', data => chunks.push(data))
                res.on('end', () => {
                    const data = JSON.parse(chunks.join())

                    resolve(data)
                })
            })

            if(body){
                req.write(JSON.stringify(body))
                req.end()
            }
        })
    }

    public async createCustomer(firstName: string, lastName: string, email: string): Promise<any> {
        return this.request(process.env['SQUARE_API_URL'], '/v2/customers', 'POST', {
            'Square-Version': '2022-03-16',
            'Authorization': `Bearer ${process.env['SQUARE_ACCESS_TOKEN']}`,
            'Content-Type': 'application/json'
        },{
            family_name: lastName,
            given_name: firstName,
            idempotency_key: new Date().toISOString(),
            email_address: email
        })
    }
}