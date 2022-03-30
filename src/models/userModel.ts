import mongoose from 'mongoose'
import { IUser } from '../utils/interface'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxLength: [30, "Your name is up to 30 chars long."]
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please add your password"],
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/hieudv/image/upload/v1647070837/no_avatar_v6ll64.png"
    },
    role: {
        type: String,
        default: 'user'
    },
    rf_token: {
        type: String,
        select: false
    },
    type: {
        type: String,
        default: 'register'
    },
}, {
    timestamps: true
})

export default mongoose.model<IUser>('user', userSchema)
