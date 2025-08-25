import express from 'express';
import { loginUser, logoutUser, registerUser, registerUserAsAdmin } from '../controllers/auth.controllers.js';
import authCheck from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/adminCheck.middleware.js';

const authRouter = express.Router();

authRouter.route('/registerUser').post(registerUser);
authRouter.route('/loginUser').post(loginUser);
authRouter.route('/logoutUser').get(authCheck, logoutUser);

// Admin only
authRouter.post("/admin/register",verifyAdmin, registerUserAsAdmin);



export default authRouter;