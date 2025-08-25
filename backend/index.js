import App from './src/App.js';
import { connectDB } from './src/database/connect.js';
import dotenv from 'dotenv';
import { statsRouter, userRouter, authRouter, categoryRouter, productRouter, cartRouter, orderRouter, paymentRouter } from './src/routes/routesProvider.js';

dotenv.config();
const PORT = process.env.PORT || 3000;


App.use('/api/users/', userRouter);
App.use('/api/auth/', authRouter);
App.use('/api/categories/', categoryRouter);
App.use('/api/products/', productRouter);
App.use('/api/cart/', cartRouter);
App.use('/api/orders/', orderRouter);
App.use("/api/payment/", paymentRouter);
App.use('/api/stats/', statsRouter)

connectDB().then(() => {
    App.listen(PORT, () => {
        console.log(`🚀 Server currently running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("❌ Failed to connect to the database", err);
    process.exit(1);
});