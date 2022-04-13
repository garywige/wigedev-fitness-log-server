import * as https from 'https'

export class SquareApi {
    private httpRequest = https.request
    private headers = {
        'Square-Version': '2022-03-16',
        Authorization: `Bearer ${process.env['SQUARE_ACCESS_TOKEN']}`,
        'Content-Type': 'application/json',
    }

    private request<T>(
        host: string,
        path: string,
        method: string,
        headers?: any,
        body?: any
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const req = this.httpRequest(
                {
                    host: host,
                    path: path,
                    method: method,
                    headers: headers,
                },
                (res) => {
                    const chunks = []
                    res.setEncoding('utf8')
                    res.on('data', (data) => chunks.push(data))
                    res.on('end', () => {
                        let data: T

                        try {
                            data = JSON.parse(chunks.join())
                        } catch (e) {
                            reject(
                                `request() failed: ${e}, data: ${chunks.join()}`
                            )
                        }

                        resolve(data)
                    })
                }
            )

            if (body) {
                req.write(JSON.stringify(body))
                req.end()
            }
        })
    }

    public async createCustomer(
        firstName: string,
        lastName: string,
        email: string
    ): Promise<CreateCustomerOutput> {
        return await this.request(
            process.env['SQUARE_API_URL'],
            '/v2/customers',
            'POST',
            this.headers,
            {
                family_name: lastName,
                given_name: firstName,
                idempotency_key: new Date().toISOString(),
                email_address: email,
            }
        )
    }

    public async createCard(
        cardToken: string,
        line1: string,
        line2: string,
        city: string,
        state: string,
        zip: string,
        country: string,
        billingName: string,
        customerId: string
    ): Promise<CreateCardOutput> {
        return await this.request(
            process.env['SQUARE_API_URL'],
            '/v2/cards',
            'POST',
            this.headers,
            {
                idempotency_key: new Date().toISOString(),
                source_id: cardToken,
                card: {
                    billing_address: {
                        address_line_1: line1,
                        address_line_2: line2,
                        locality: city,
                        administrative_district_level_1: state,
                        postal_code: zip,
                        country: country,
                    },
                    cardholder_name: billingName,
                    customer_id: customerId,
                },
            }
        )
    }

    public async createSubscription(
        type: string,
        customerId: string,
        cardId: string
    ): Promise<CreateSubscriptionOutput> {
        return await this.request(
            process.env['SQUARE_API_URL'],
            '/v2/subscriptions',
            'POST',
            this.headers,
            {
                idempotency_key: new Date().toISOString(),
                location_id: process.env['SQUARE_LOCATION_ID'] ?? '',
                plan_id:
                    type === 'month'
                        ? process.env['SQUARE_PLAN_MONTH'] ?? ''
                        : process.env['SQUARE_PLAN_YEAR'] ?? '',
                customer_id: customerId,
                card_id: cardId,
            }
        )
    }
}

export interface SquareError {
    category: string
    code: string
    detail: string
    field: string
}

export interface SquareAddress {
    address_line_1: string
    address_line_2: string
    administrative_district_level_1: string
    country: string
    locality: string
    postal_code: string
}

export interface CreateCustomerOutput {
    customer: {
        id: string
        address: SquareAddress
        created_at: string
        creation_source: string
        email_address: string
        family_name: string
        given_name: string
    }
    errors: SquareError[]
}

export interface CreateCardOutput {
    card: {
        id: string
        billing_address: SquareAddress
        bin: string
        card_brand: string
        card_type: string
        cardholder_name: string
        customer_id: string
        enabled: boolean
        exp_month: number
        exp_year: number
        fingerprint: string
        last_4: string
        merchant_id: string
        prepaid_type: string
        version: number
    }
    errors: SquareError[]
}

export interface CreateSubscriptionOutput {
    subscription: {
        id: string
        canceled_date: string
        card_id: string
        charged_through_date: string
        created_at: string
        customer_id: string
        invoice_ids: []
        location_id: string
        plan_id: string
        start_date: string
        status: string
    }
    errors: SquareError[]
}
