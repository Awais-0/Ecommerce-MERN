import { Router } from "express";
import authCheck from "../middlewares/auth.middleware.js";
import { createOrder, getAllOrders, getOrderDetails, getUserOrders, updateOrderStatus } from "../controllers/order.controllers.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";

const orderRouter = Router();

orderRouter.post("/createOrder", authCheck, createOrder);
orderRouter.get("/getOrder", authCheck, getUserOrders);
orderRouter.get("/orders/:id", authCheck, getOrderDetails);

orderRouter.get("/getAllOrders", authCheck, verifyAdmin, getAllOrders);
orderRouter.put("/orders/:id/status", authCheck, updateOrderStatus);

export default orderRouter;
