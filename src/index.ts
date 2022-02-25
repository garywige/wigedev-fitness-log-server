import * as http from 'http'
import app from './app'
import * as config from './config'

export let Instance: http.Server
async function start() {
    console.log('Starting server: ')
    console.log(`isProd: ${config.IsProd}`)
    console.log(`port: ${config.Port}`)

    Instance = http.createServer(app)

    Instance.listen(config.Port, async () => {
        console.log(`Server listening on port ${config.Port}...`)
    })
}

start()
