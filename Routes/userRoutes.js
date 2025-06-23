import express from 'express';
import { loginUser, registerUser } from '../Controller/userController.js';
import { authenticateJWT } from '../Middelware/authMiddleware.js';

const router = express.Router();

router.post('/register',authenticateJWT,registerUser);
router.post('/login',loginUser);

export default router;