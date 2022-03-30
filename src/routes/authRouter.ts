import express from 'express'
import authCtrl from '../controllers/authCtrl'
import { validateRegister } from '../middlewares/validate'
import auth from '../middlewares/auth'

const router = express.Router()

router.post('/auth/register', validateRegister, authCtrl.register)
router.post('/auth/active', authCtrl.activeAccount)
router.post('/auth/login', authCtrl.login)
router.get('/auth/refresh_token', authCtrl.refreshToken)
router.get('/auth/logout', auth, authCtrl.logout)
router.post('/auth/forgot_password', authCtrl.forgotPassword)
router.post('/auth/google_login', authCtrl.googleLogin)

export default router;