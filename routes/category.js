import { Router } from "express";
import { addCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from "../controller/categoryController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
export const router = Router();

router.post('/add', authenticateToken, authorizeRole('admin'), addCategory);
router.put('/update/:id', authenticateToken, authorizeRole('admin'), updateCategory);
router.delete('/delete/:id', authenticateToken, authorizeRole('admin'), deleteCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
