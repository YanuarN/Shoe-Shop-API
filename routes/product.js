import { Router } from "express";
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controller/productController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
export const router = Router();

router.post('/add', authenticateToken,authorizeRole("admin") ,addProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/update/:id', authenticateToken, authorizeRole("admin"), updateProduct);
router.delete('/delete/:id', authenticateToken, authorizeRole("admin"), deleteProduct);
