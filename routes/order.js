import { Router } from "express";
import { addOrder } from "../controller/orderController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

export const router = Router();

router.post('/addOrder', authenticateToken, addOrder);