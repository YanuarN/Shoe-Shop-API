import { Router } from "express";
import { addSize, getSizes, updateSize, deleteSize } from "../controller/sizeController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
export const router = Router();

router.post('/add', authenticateToken, authorizeRole("admin"), addSize);
router.get('/', getSizes);
router.put('/update/:id', authenticateToken, authorizeRole("admin"), updateSize);
router.delete('/delete/:id', authenticateToken, authorizeRole("admin"), deleteSize);