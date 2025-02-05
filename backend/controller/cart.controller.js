import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } });

        // Add quantity to each product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id == product.id);
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.status(200).json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find((item) => item.id == productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId });
        }
        await user.save();

        res.status(201).json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id != productId);
        }

        await user.save();

        res.status(200).json(user.cartItems);
    } catch (error) {
        console.log("Error in removeFromCart controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.filter((item) => item._id.toString() === productId);

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (quantity === 0) {
            user.cartItems = user.cartItems.filter((item) => item.id != productId);
        } else {
            existingItem.quantity = quantity;
        }

        await user.save();

        res.status(200).json(user.cartItems);
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
