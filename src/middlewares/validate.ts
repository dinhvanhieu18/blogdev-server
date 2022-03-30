import { NextFunction, Request, Response } from 'express'
import { validateEmail } from '../utils/validate'

export const validateRegister = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body

    const errors = [];

    if (!name) {
        errors.push("Please add your name.")
    } else if (name.length > 30) {
        errors.push("Your name is up to 30 chars long.")
    }

    if (!email) {
        errors.push("Please add your email.")
    } else if (!validateEmail(email)) {
        errors.push("Email is invalid.")
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 chars.")
    }

    if (errors.length > 0) return res.status(400).json({msg: errors});

    next();
}

