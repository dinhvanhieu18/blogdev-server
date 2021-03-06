import { Document } from 'mongoose'
import { Request } from 'express'

export interface IUser extends Document {
    name: string
    email: string
    password: string
    avatar: string
    role: string
    type: string
    rf_token?: string
    _doc: object
}

export interface INewUser {
    name: string
    email: string
    password: string
}

export interface IDecodedToken {
    id?: string
    newUser?: INewUser
    iat: number
    exp: number
}

export interface IReqAuth extends Request {
    user?: IUser
}

export interface IGgPayload {
    email: string
    email_verified: boolean
    name: string
    picture: string
}

export interface IUserParams {
    name: string
    email: string
    password: string
    avatar?: string
    type: string
}

export interface IBlog extends Document {
    title: string
    content?: string
    description: string
    thumbnail: string
    category?: string
    type: string
    _doc: object
}




