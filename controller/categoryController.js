import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
        return res.status(400).json({ message: "Name are required" });
        }
    
        const existingCategory = await prisma.category.findUnique({
        where: { name },
        });
    
        if (existingCategory) {
        return res.status(400).json({ message: "Category already exists" });
        }
    
        const newCategory = await prisma.category.create({
        data: {
            name
        },
        });
    
        res.status(201).json({
        message: "Category added successfully",
        category: newCategory,
        });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ error: "Server error while adding category" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Server error while fetching categories" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name ) {
            return res.status(400).json({ message: "Name required" });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name },
        });

        res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Server error while updating category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await prisma.category.delete({
            where: { id },
        });

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Server error while deleting category" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        res.status(500).json({ error: "Server error while fetching category" });
    }
}