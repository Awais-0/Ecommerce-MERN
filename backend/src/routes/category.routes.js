import { Router } from "express";
import { addCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controllers.js";
import authCheck from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";

const categoryRouter = Router();

categoryRouter.use(authCheck)

categoryRouter.route('/addCategory').post(verifyAdmin, addCategory);
categoryRouter.route('/getCategoryById/:id').get(getCategoryById);
categoryRouter.route('/updateCategory/:id').put(verifyAdmin, updateCategory);
categoryRouter.route('/deleteCategory/:id').delete(verifyAdmin, deleteCategory);
categoryRouter.route('/getAllCategories').get(getAllCategories);

export default categoryRouter;