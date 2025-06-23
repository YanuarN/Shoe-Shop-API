import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const addSize = async (req, res) => {
    try {
        const { size } = req.body;
        if (!size) {
            return res.status(400).json({ message: "Size is required" });
        }
        const existingSize = await prisma.size.findFirst({
            where: { size },
        });
        if (existingSize) {
            return res.status(400).json({ message: "Size already exists" });
        }
        const newSize = await prisma.size.create({
            data: {
                size
            },
        });
        res.status(201).json({
            message: "Size added successfully",
            size: newSize,
        });
    } catch (error) {
        console.error("Error adding size:", error);
        res.status(500).json({ error: "Server error while adding size" });
    }
}

export const getSizes = async (req, res) => {
    try {
        const sizes = await prisma.size.findMany();
        res.status(200).json(sizes);
    } catch (error) {
        console.error("Error fetching sizes:", error);
        res.status(500).json({ error: "Server error while fetching sizes" });
    }
}

export const updateSize = async (req, res) => {
    try {
        const { id } = req.params;
        const { size } = req.body;

        if (!size) {
            return res.status(400).json({ message: "Size is required" });
        }

        const updatedSize = await prisma.size.update({
            where: { id },
            data: { size },
        });

        res.status(200).json({
            message: "Size updated successfully",
            size: updatedSize,
        });
    } catch (error) {
        console.error("Error updating size:", error);
        res.status(500).json({ error: "Server error while updating size" });
    }
}

export const deleteSize = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Size ID is required in URL" });
        }
        const size = await prisma.size.findUnique({ where: { id } });
        if (!size) {
            return res.status(404).json({ message: "Size not found" });
        }
        await prisma.size.delete({ where: { id } });
        return res.status(200).json({ message: "Size deleted successfully" });
    } catch (error) {
        console.error("Error deleting size:", error);
        return res.status(500).json({ error: "An error occurred while deleting size" });
    }
}
