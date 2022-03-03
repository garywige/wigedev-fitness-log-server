import * as config from './config'
import * as dotenv from 'dotenv'
import * as http from 'http'

import app from './app'

export let Instance: http.Server
async function start() {
    dotenv.config()

    console.log('Starting server: ')
    console.log(`isProd: ${config.IsProd}`)
    console.log(`port: ${config.Port}`)

    Instance = http.createServer(app)

    Instance.listen(config.Port, async () => {
        console.log(`Server listening on port ${config.Port}...`)
    })
}

start()
