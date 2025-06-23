import { Router } from 'express';
import { userLogin, userRegister, userUpdate, userDelete, showProfile, getAllUsers } from '../controller/userController.js';
import { ensureOwnData, authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

export const router = Router();

router.post('/register', userRegister);
router.post('/login', userLogin);

router.use(authenticateToken);

router.put('/update/:id', ensureOwnData, userUpdate);
router.delete('/delete/:id', ensureOwnData, userDelete);
router.get('/profile/:id', ensureOwnData, showProfile); 
router.get('/allProfile', authorizeRole('admin'), getAllUsers)