import express from 'express'
import blogCtrl from '../controllers/blogCtrl'
import auth from '../middlewares/auth'
import isAdmin from '../middlewares/admin'

const router = express.Router()

router.post('/blog', auth, isAdmin, blogCtrl.create)
router.get('/blog/:id', blogCtrl.get)
router.put('/blog/:id', auth, isAdmin, blogCtrl.update)
router.delete('/blog/:id', auth, isAdmin, blogCtrl.delete)
router.get('/blogs', blogCtrl.getAll)


export default router;
