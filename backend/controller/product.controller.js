import cloudinary from "../lib/cloudinary.js";
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
        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url || "",
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted image from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary", error.message);
            }
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                },
            },
        ]);

        res.status(200).json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });

        if (!products) {
            return res.status(404).json({ message: "Products not found" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

const updateFeaturedProductsCache = async () => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            return;
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache", error.message);
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { isFeatured: !product.isFeatured },
            { new: true }
        );

        await updateFeaturedProductsCache();

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: error.message });
    }
};  
