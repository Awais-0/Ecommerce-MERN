import { Router } from "express";
import authCheck from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";
import { getStats } from "../controllers/stats.controllers.js";

const statsRouter = Router();

statsRouter.route('/getStats').get(authCheck, verifyAdmin, getStats);

export default statsRouter;