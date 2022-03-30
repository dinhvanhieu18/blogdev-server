import mongoose from 'mongoose'
import { IBlog } from '../utils/interface'

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true,
        maxLength: 50
    },
    content: {
        type: String,
    },
    description: {
        type: String,
        require: true,
        trim: true,
        maxLength: 200
    },
    thumbnail:{
        type: String,
        require: true
    },
    category: {
        type: mongoose.Types.ObjectId || undefined,
        ref: 'blog'
    },
    type: {
        type: String,
        required: true,
        default: 'blog' // category
    }
},{
    timestamps: true
})

export default mongoose.model<IBlog>('blog', blogSchema)

