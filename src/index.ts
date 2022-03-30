import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { createServer } from 'http'
import mongoose from 'mongoose'
import routes from "./routes/index";

// Middleware
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: `${process.env.BASE_URL}`,
    credentials: true
}))
app.use(morgan('dev'))
app.use(cookieParser())

const http = createServer(app)

// routes
app.use('/api', routes)

// connect mongo db
const URI = process.env.MONGODB_URL
mongoose.connect(`${URI}`, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log("Mongodb connected")
})


const PORT = process.env.PORT || 5000
http.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})


