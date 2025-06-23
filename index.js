import express from 'express';
import cors from 'cors';
import { router as userRouter } from './routes/user.js';
import { router as categoryRouter } from './routes/category.js';
import { router as productRouter } from './routes/product.js';
import { router as sizeRouter } from './routes/size.js'
import { router as orderRouter } from './routes/order.js';



const app = express();
const port = process.env.PORT || 3200;

app.use(cors())
app.use(express.json())

app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/size', sizeRouter);
app.use('/order', orderRouter);

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});