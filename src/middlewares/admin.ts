import {IDecodedToken, IReqAuth} from "../utils/interface";
import {NextFunction, Response} from "express";
import jwt from "jsonwebtoken";
import Users from "../models/userModel";

const isAdmin = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(400).json({msg: "Invalid Authentication."})
        }

        if (req.user.role !== 'admin') {
            return res.status(400).json({msg: "You don't have permission."})
        }

        next()
    } catch (err: any) {
        return res.status(500).json({msg: err.message})
    }
}

export default isAdmin;
