import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct } from "../controller/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.get("/featured", getFeaturedProducts);

export default router;
