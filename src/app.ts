import * as path from 'path'
import * as cors from 'cors'
import * as express from 'express'
import * as logger from 'morgan'
import api from './api'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger('dev'))

app.use(
    '/',
    express.static(path.join(__dirname, './public'), { redirect: false })
)

app.use(api)

export default app
