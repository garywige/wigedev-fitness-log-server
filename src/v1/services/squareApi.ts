import * as http from 'http'

export class SquareApi {

    private httpRequest = http.request
    private headers = {
        'Square-Version': '2022-03-16',
        'Authorization': `Bearer ${process.env['SQUARE_ACCESS_TOKEN']}`,
        'Content-Type': 'application/json'
    }

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

    public async createCustomer(firstName: string, lastName: string, email: string): Promise<CreateCustomerOutput> {
        return await this.request(process.env['SQUARE_API_URL'], 
        '/v2/customers', 'POST', 
        this.headers,{
            family_name: lastName,
            given_name: firstName,
            idempotency_key: new Date().toISOString(),
            email_address: email
        })
    }
}

export interface CreateCustomerOutput {
    customer: {
        id: string,
        address: {
            address_line_1: string,
            address_line_2: string,
            administrative_district_level_1: string,
            country: string,
            locality: string,
            postal_code: string
        },
        created_at: string,
        creation_source: string,
        email_address: string,
        family_name: string,
        given_name: string
    },
    errors: {
        category: string,
        code: string,
        detail: string,
        field: string
    }
}