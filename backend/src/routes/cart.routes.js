import { Router } from "express";
import { addToCart, clearCart, getCartItems, removeFromCart } from "../controllers/cart.controllers.js";
import authCheck from '../middlewares/auth.middleware.js';

const cartRouter = Router();

cartRouter.route("/addToCart").post(authCheck, addToCart);
cartRouter.route("/removeFromCart/:productId").delete(authCheck, removeFromCart);
cartRouter.route("/getCartItems").get(authCheck, getCartItems);
cartRouter.route("/clearCart").delete(authCheck, clearCart);

export default cartRouter;