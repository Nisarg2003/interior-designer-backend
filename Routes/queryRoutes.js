import express from 'express';
import { createUserQuery, getUserQuery, resolveQuery } from '../Controller/userQueryController.js';

const router = express.Router();

router.post('/sendQuery',createUserQuery);
router.get('/getQueries',getUserQuery);
router.put('/resolveQuery',resolveQuery);
export default router;