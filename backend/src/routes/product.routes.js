import { Router } from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, getProductsByCategory, updateProduct } from "../controllers/product.controllers.js";
import authCheck from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";

const productRouter = Router();

productRouter.use(authCheck)

productRouter.route('/addProduct').post(verifyAdmin, addProduct);
productRouter.route('/getProductById/:id').get(getProductById);
productRouter.route('/updateProduct/:id').put(verifyAdmin, updateProduct);
productRouter.route('/deleteProduct/:id').delete(verifyAdmin, deleteProduct);
productRouter.route('/getAllProducts').get(getAllProducts);
productRouter.route('/getProductByCategory/:categoryId').get(getProductsByCategory);

export default productRouter;