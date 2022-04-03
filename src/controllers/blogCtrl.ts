import { Response, Request } from 'express'
import Blogs from '../models/blogModel'
import { IReqAuth } from '../utils/interface'
import {BlogType, CategoryType, MinContentLen} from "../utils/const";

const blogCtrl = {
    create: async (req: IReqAuth, res: Response) => {
        try {
            const {title, content, description, thumbnail, category, type} = req.body
            if (type !== BlogType && type !== CategoryType) {
                return res.status(400).json({msg: "Type invalid. Allow blog or category."})
            }

            if (category) {
                const cat = await Blogs.findById(category)
                if (!cat) {
                    return res.status(400).json({msg: "This category is not exists."})
                }
            }

            if (type === BlogType && content.length <= MinContentLen) {
                return res.status(400).json({msg: `Content must has length is at least ${MinContentLen}.`})
            }

            const newBlog = new Blogs({
                title: title.toLowerCase(),
                content,
                description,
                thumbnail,
                category: category ? category : undefined,
                type
            })

            await newBlog.save()
            res.json({
                ...newBlog._doc,
                msg: "Create Success!"
            })
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    get: async (req: Request, res: Response) => {
        try {
            const blog = await Blogs.findOne({_id: req.params.id})

            if (!blog) {
                return res.status(400).json({msg: "Not found."})
            }

            return res.json(blog)
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    update: async (req: IReqAuth, res: Response) => {
        try {
            let updateData = req.body
            if (!updateData.category) {
                updateData.category = undefined
            }
            const blog = await Blogs.findOneAndUpdate({
                _id: req.params.id
            }, updateData)

            if (!blog) {
                return res.status(400).json({msg: "Not found."})
            }

            return res.json({
                ...blog,
                ...updateData,
                msg: "Update success!",
            })
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    delete: async (req: IReqAuth, res: Response) => {
        try {
            const blog = await Blogs.findOne({
                _id: req.params.id
            })

            if (!blog) {
                return res.status(400).json({msg: "Not found."})
            }

            // check if this is category, don't allow deleting when it has blogs
            if (blog.type === CategoryType) {
                const blogs = await Blogs.find({category: blog._id})
                if (blogs.length > 0) {
                    return res.status(400).json({msg: "This category has other blogs"})
                }
            }

            await blog.delete()

            // TODO delete comments

            res.json({msg: "Delete Success!"})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const blogs = await Blogs.find().sort('title')

            return res.json(blogs)
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },
}

export default blogCtrl;

