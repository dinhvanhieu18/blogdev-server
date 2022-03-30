import { Request, Response } from 'express'
import Users from '../models/userModel'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateActiveToken, generateRefreshToken } from '../utils/token'
import sendEmail from '../utils/sendgrid'
import { IDecodedToken, IReqAuth, IUser, IGgPayload, IUserParams } from '../utils/interface'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const CLIENT_URL = `${process.env.BASE_URL}`
const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`)

const authCtrl = {
    register: async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body

            const user = await Users.findOne({email})
            if (user) return res.status(400).json({msg: 'Email already exists.'})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = { name, email, password: passwordHash }
            const activeToken = generateActiveToken({newUser})

            const url = `${CLIENT_URL}/active/${activeToken}`

            await sendEmail(email, url, "Active Account BlogDev", "Active account")

            return res.json({msg: "Success! Please check your email."})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    activeAccount: async (req: Request, res: Response) => {
        try {
            const { activeToken } = req.body

            const decoded = <IDecodedToken>jwt.verify(activeToken, `${process.env.ACTIVE_TOKEN_SECRET}`)

            const { newUser } = decoded

            const user = new Users(newUser)

            await user.save()

            return res.json({msg: "Account has been activated."})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await Users.findOne({ email })
            if (!user) {
                return res.status(400).json({msg: "This account is not exist."})
            }

            await loginUser(user, password, res)
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    logout: async (req: IReqAuth, res: Response) => {
        if (!req.user) {
            return res.status(400).json({msg: "Invalid Authentication."})
        }

        try {
            res.clearCookie("refreshToken", { path: '/api/auth/refresh_token'})
            await Users.findOneAndUpdate({_id: req.user._id}, {
                rf_token: ''
            })

            return res.json({msg: "Logged out!"})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    refreshToken: async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) return res.status(400).json({msg: "Please login now!"})

            const decoded = <IDecodedToken>jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`)
            if (!decoded.id) {
                return res.status(400).json({msg: "Please login now!"})
            }

            const user = await Users.findById(decoded.id).select("-password +rf_token")
            if (!user) {
                return res.status(400).json({msg: "This account does not exist."})
            }

            if (refreshToken !== user.rf_token) {
                return res.status(400).json({msg: "Please login now!"})
            }

            const accessToken = generateAccessToken({id: user._id})
            const rfToken = generateRefreshToken({id: user._id}, res)

            await Users.findOneAndUpdate({_id: user._id}, {
                rf_token: rfToken
            })

            return res.json({ accessToken, user: {...user._doc, rf_token: ''}})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    forgotPassword: async(req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await Users.findOne({email})
            if(!user)
                return res.status(400).json({msg: 'This account does not exist.'})

            if(user.type !== 'register')
                return res.status(400).json({
                    msg: `Quick login account with ${user.type} can't use this function.`
                })

            const accessToken = generateAccessToken({id: user._id})

            const url = `${CLIENT_URL}/reset_password/${accessToken}`

            await sendEmail(email, url, "Reset Password BlogDev", "Reset Password")

            return res.json({msg: "Success! Please check your email."})

        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    googleLogin: async (req: Request, res: Response) => {
        try {
            const { idToken } = req.body
            const verify = await client.verifyIdToken({
                idToken: idToken, audience: `${process.env.MAIL_CLIENT_ID}`
            })

            const {
                email, email_verified, name, picture
            } = <IGgPayload>verify.getPayload()

            if (!email_verified) {
                return res.status(500).json({msg: "Email verification failed."})
            }

            const password = email + process.env.GOOGLE_SECRET

            const user = await Users.findOne({email})

            if (user) {
                await loginUser(user, password, res)
            } else {
                const passwordHash = await bcrypt.hash(password, 12)
                const newUser = {
                    name,
                    email,
                    password: passwordHash,
                    avatar: picture,
                    type: 'google'
                }
                await registerUser(newUser, res)
            }

        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    }
}

const loginUser = async (user: IUser, password: string, res: Response) => {
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        let msgError = user.type === 'register'
            ? 'Password is incorrect.'
            : `Password is incorrect. This account login with ${user.type}`

        return res.status(400).json({ msg: msgError })
    }

    const accessToken = generateAccessToken({id: user._id})
    const refreshToken = generateRefreshToken({id: user._id}, res)

    await Users.findOneAndUpdate({_id: user._id}, {
        rf_token: refreshToken
    })

    res.json({
        msg: 'Login Success!',
        accessToken,
        user: { ...user._doc, password: ''}
    })
}

const registerUser = async (user: IUserParams, res: Response) => {
    const newUser = new Users(user)

    const accessToken = generateAccessToken({id: newUser._id})
    const refreshToken = generateRefreshToken({id: newUser._id}, res)

    newUser.rf_token = refreshToken
    await newUser.save()

    res.json({
        msg: 'Lgoin Success!',
        accessToken,
        user: {...newUser._doc, password: ''}
    })
}

export default authCtrl;

