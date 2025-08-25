import express from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/payment.controllers.js";
import authCheck from "../middlewares/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-checkout-session", createCheckoutSession);

export default paymentRouter;
