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
}