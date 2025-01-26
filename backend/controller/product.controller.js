import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        // If not in redis, fetch from mongodb
        // .lean() is used to get plain JS objects instead of mongoose documents
        featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return res.status(404).json({ message: "Featured products not found" });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts), "EX", 60);

        res.status(200).json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            image,
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
