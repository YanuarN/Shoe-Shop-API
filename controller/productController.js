import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, imageUrls, sizeIds } = req.body;

        if (!name || !description || !price || !stock || !categoryId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const data = {
            name,
            description,
            price,
            stock,
            categoryId
        };

        if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
            data.image = {
                create: imageUrls.map(url => ({ imageUrl: url }))
            };
        }

        if (sizeIds && Array.isArray(sizeIds) && sizeIds.length > 0) {
            data.size = {
                connect: sizeIds.map(id => ({ id }))
            };
        }

        const newProduct = await prisma.product.create({
            data,
            include: {
                image: true,
                size: true
            }
        });

        return res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true
            }
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required in URL" });
        }
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                size: true,
                image: true
            }
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, image, categoryId } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required in URL" });
        }
        if (!name || !description || !price || !stock || !categoryId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                stock,
                image,
                categoryId
            }
        });
        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error when updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required in URL" });
        }
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await prisma.product.delete({ where: { id } });
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}