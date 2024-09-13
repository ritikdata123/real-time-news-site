import express , {Request , Response} from 'express';
import {register , login} from '../Controllers/UserController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
