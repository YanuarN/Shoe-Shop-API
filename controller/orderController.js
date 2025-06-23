import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const addOrder = async (req, res) => {
    try {
        const { userId, items } = req.body;

        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Invalid input: userId and items array are required." });
        }

        const productIds = items.map(item => item.productId);
        const productDetails = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: { 
                id: true,
                price: true
            }
        });

        const productMap = new Map(productDetails.map(p => [p.id, p]));
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = productMap.get(item.productId);

            if (!product || item.quantity <= 0) {
                return res.status(400).json({ message: `Invalid product ID or quantity for product ${item.productId}` });
            }

            const itemPriceAtOrder = product.price; 
            totalAmount += itemPriceAtOrder * item.quantity;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtOrder: itemPriceAtOrder
            });
        }

            const createdOrder = await prisma.order.create({
                data: {
                    userId,
                    total: totalAmount,
                    orderItem: {
                        create: orderItemsData 
                    }
                },
                select: {
                    id: true,
                    total: true,
                    orderItem: {
                        select: { 
                            id: true,
                            quantity: true,
                            productId: true
                        }
                    }
                }
            });



        res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Error creating order:", error);
        if (error instanceof pkg.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: "User or product not found." });
            }
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};