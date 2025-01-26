import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: "Name is required",
        },
        description: {
            type: String,
            required: "Description is required",
        },
        price: {
            type: Number,
            min: [0, "Price must be greater than 0"],
            required: "Price is required",
        },
        image: {
            type: String,
            required: [true, "Image is required"],
        },
        category: {
            type: String,
            required: "Category is required",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
