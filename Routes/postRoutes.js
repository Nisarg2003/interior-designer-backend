import express from 'express';

import multer from 'multer';
import {createPost, findPostByCategoty, getPost} from '../Controller/postController.js';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const router = express.Router();

router.post('/createPost',
    upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'photos' },   
  ]),createPost)

router.get('/getAllPost',getPost)
router.post('/postByCategory',findPostByCategoty)


export default router;