import express from 'express';
import { deleteUserProfile, deleteUserProfileById, getAllUsers, getUserProfile, getUserProfileById, updateUserProfile, updateUserProfileById } from '../controllers/user.controllers.js';
import authCheck from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/adminCheck.middleware.js';


const userRouter = express.Router();

userRouter.use(authCheck);

userRouter.route('/getUserProfile').get(getUserProfile);
userRouter.route('/updateUserProfile').patch(updateUserProfile);
userRouter.route('/updateUserProfileById/:userId').put(updateUserProfileById);
userRouter.route('/getUserProfileById/:id').get(getUserProfileById);
userRouter.route('/deleteUserProfile').delete(deleteUserProfile);
userRouter.route('/deleteUserById/:id').delete(verifyAdmin, deleteUserProfileById);
userRouter.route('/getAllUsers').get(verifyAdmin, getAllUsers);

export default userRouter;