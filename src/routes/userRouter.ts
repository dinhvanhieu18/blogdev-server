import express from 'express'
import userCtrl from '../controllers/userCtrl'
import auth from '../middlewares/auth'

const router = express.Router()

router.post('/user/reset_password', auth, userCtrl.resetPassword)

export default router;
