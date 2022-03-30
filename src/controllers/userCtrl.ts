import { Response } from 'express'
import Users from '../models/userModel'
import bcrypt from 'bcrypt'
import { IReqAuth } from '../utils/interface'

const userCtrl = {
    resetPassword: async (req: IReqAuth, res: Response) => {
        if (!req.user) {
            return res.status(400).json({msg: "Invalid Authentication."})
        }

        if (req.user.type !== 'register') {
            return res.status(400).json({
                msg: `Quick login account with ${req.user.type} can't use this function.`
            })
        }

        try {
            const { password } = req.body
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user._id}, {
                password: passwordHash
            })

            return res.json({msg: "Reset password success"})
        } catch (err: any) {
            return res.status(500).json({msg: err.message})
        }
    },
}

export default userCtrl;

