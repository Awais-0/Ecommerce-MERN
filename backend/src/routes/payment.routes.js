import express from "express";
import { createCheckoutSession, getPaymentDetailsBySession } from "../controllers/payment.controllers.js";
import authCheck from "../middlewares/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-checkout-session", createCheckoutSession);
paymentRouter.get('/session/:sessionId', getPaymentDetailsBySession);

export default paymentRouter;
